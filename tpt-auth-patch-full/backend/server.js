import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const transporter = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;

app.use(cors({ origin: process.env.FRONTEND_BASE_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

function b64url(buf) { return buf.toString('base64url'); }
function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

function setSession(res, userId) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: userId, jti }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const secure = process.env.NODE_ENV !== 'development';
  res.cookie('sid', token, { httpOnly: true, secure, sameSite: 'lax', path: '/' });
}
function auth(req, res, next) {
  const raw = req.cookies.sid;
  if (!raw) return res.status(401).end();
  try { req.user = jwt.verify(raw, process.env.JWT_SECRET).sub; next(); }
  catch { return res.status(401).end(); }
}

app.get('/api/health', (req,res)=>res.json({ok:true}));

app.get('/api/auth/me', auth, async (req, res) => {
  const { rows } = await pool.query('select id,email,email_confirmed from users where id=$1', [req.user]);
  if (!rows[0]) return res.status(401).end();
  res.json(rows[0]);
});

app.post('/api/auth/signup', async (req, res) => {
  const email = String(req.body.email||'').trim().toLowerCase();
  const password = String(req.body.password||'');
  if (!email || password.length < 8) return res.status(400).send('Invalid input');
  const password_hash = await bcrypt.hash(password, 10);
  let user;
  try {
    const { rows } = await pool.query(
      'insert into users(email,password_hash) values($1,$2) returning id,email',
      [email, password_hash]
    ); user = rows[0];
  } catch (e) {
    if (e.code === '23505') return res.json({ ok: true }); // don't leak
    throw e;
  }
  const tokenPlain = b64url(crypto.randomBytes(32));
  const tokenHash = sha256(tokenPlain);
  const expires = new Date(Date.now() + 24*3600*1000);
  await pool.query('insert into email_verifications(user_id,token_hash,expires_at) values($1,$2,$3)',
    [user.id, tokenHash, expires]);
  const link = `${process.env.FRONTEND_BASE_URL}#/verify?token=${tokenPlain}`;
  if (transporter) {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject: 'Confirm your e-mail', html: `<a href="${link}">${link}</a>` });
  } else {
    console.log('[dev] Email confirm link:', link);
  }
  res.json({ ok: true });
});

app.post('/api/auth/resend', async (req, res) => {
  const email = String(req.body.email||'').trim().toLowerCase();
  const { rows } = await pool.query('select id,email_confirmed from users where email=$1', [email]);
  if (rows[0] && !rows[0].email_confirmed) {
    const tokenPlain = b64url(crypto.randomBytes(32));
    const tokenHash = sha256(tokenPlain);
    const expires = new Date(Date.now() + 24*3600*1000);
    await pool.query('insert into email_verifications(user_id,token_hash,expires_at) values($1,$2,$3)',
      [rows[0].id, tokenHash, expires]);
    const link = `${process.env.FRONTEND_BASE_URL}#/verify?token=${tokenPlain}`;
    if (transporter) {
      await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject: 'Confirm your e-mail', html: `<a href="${link}">${link}</a>` });
    } else {
      console.log('[dev] Email confirm link:', link);
    }
  }
  res.json({ ok: true });
});

app.get('/api/auth/verify', async (req, res) => {
  const token = String(req.query.token||'');
  if (!token) return res.status(400).send('Missing token');
  const tokenHash = sha256(token);
  const { rows } = await pool.query(
    'select ev.id,u.id as user_id from email_verifications ev join users u on u.id=ev.user_id where ev.token_hash=$1 and ev.used_at is null and ev.expires_at>now()',
    [tokenHash]
  );
  if (!rows[0]) return res.status(400).send('Invalid or expired');
  await pool.query('update email_verifications set used_at=now() where id=$1', [rows[0].id]);
  await pool.query('update users set email_confirmed=true where id=$1', [rows[0].user_id]);
  res.json({ ok: true });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email||'').trim().toLowerCase();
  const password = String(req.body.password||'');
  const { rows } = await pool.query('select id,password_hash,email_confirmed from users where email=$1',[email]);
  if (!rows[0]) return res.status(401).send('Invalid credentials');
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return res.status(401).send('Invalid credentials');
  if (!rows[0].email_confirmed) return res.status(403).send('E-mail not confirmed.');
  setSession(res, rows[0].id);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  const secure = process.env.NODE_ENV !== 'development';
  res.clearCookie('sid', { path:'/', secure, sameSite:'lax', httpOnly:true });
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3001, () => console.log('API listening'));
