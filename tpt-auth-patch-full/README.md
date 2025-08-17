# TPT Auth Patch (Vanilla Frontend + Express Backend)

This bundle gives you:
- Vanilla JS frontend with **login/signup/verify** pages and an **auth guard** (hash routes).
- Express backend with **email confirmation** (signup → email link → verify → then login).

## Local run
### Backend
```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL (Postgres), JWT_SECRET, FRONTEND_BASE_URL, SMTP_URL, EMAIL_FROM
npm install
npm run db:migrate
npm start
# API on http://localhost:3001
```
If SMTP isn’t configured, the backend logs the confirmation link in the console.

### Frontend
```bash
cd frontend
python3 -m http.server 8080
# open http://localhost:8080
```
If backend runs on a different host, set `window.API_BASE_URL` in `frontend/index.html`.

## Deploy
- **Backend** → Render/Fly/Heroku (set envs from `.env`).
- **Frontend** → Vercel (Project = `/frontend`, Framework = "Other"). No build step.

## Routes
Frontend: `#/login`, `#/signup`, `#/verify`, `#/`  
API: `/api/auth/signup`, `/api/auth/resend`, `/api/auth/verify`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
