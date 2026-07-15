# Snapchat-style Login Demo (School Project)

A full login/signup system: Express backend + SQLite database + bcrypt password hashing + sessions.

## Run locally
1. `npm install`
2. `npm start`
3. Open http://localhost:3000/login.html

## Files
- `server.js` — backend (routes: /api/signup, /api/login, /api/me, /api/logout)
- `public/login.html` — login page
- `public/signup.html` — signup page
- `public/dashboard.html` — page shown after login (proves the session works)
- `users.db` — created automatically on first run (SQLite database file)

## Deploy free (Render.com)
1. Push this folder to a GitHub repo (node_modules and users.db are gitignored — that's fine, Render installs deps and creates the DB itself).
2. Go to render.com → New → Web Service → connect your repo.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Deploy. Render gives you a free `https://yourapp.onrender.com` URL.

Note: Render's free tier has an ephemeral filesystem, so the SQLite file resets
on redeploy/restart. That's fine for a class demo. If you need data to persist
long-term, swap in a free hosted Postgres database (e.g. Supabase) later.

## Security notes for your writeup
- Passwords are hashed with bcrypt before storage — never stored in plain text.
- Sessions use `express-session` with an HttpOnly cookie, so the session token isn't accessible to page JavaScript.
- This is a teaching demo: use test accounts only, not real personal passwords.
