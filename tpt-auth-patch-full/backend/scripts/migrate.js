import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const sql = `
create extension if not exists pgcrypto;
create table if not exists users(
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  email_confirmed boolean not null default false,
  created_at timestamptz default now()
);
create table if not exists email_verifications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz
);
create index if not exists idx_verif_token on email_verifications(token_hash);
create index if not exists idx_users_email on users(lower(email));
`;
(async () => {
  await pool.query(sql);
  console.log('Migrations applied');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
