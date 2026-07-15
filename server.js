// server.js — simple auth backend for school project
// Stack: Express + SQLite (better-sqlite3) + bcrypt password hashing + sessions

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Database setup ----------
// Creates a file called users.db in this folder. Real, persistent SQL database.
const db = new Database(path.join(__dirname, 'users.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// ---------- Routes ----------

// Create an account
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'That username is already taken.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);

  res.json({ message: 'Account created. You can now log in.' });
});

// Log in
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ message: `Welcome back, ${user.username}!` });
});

// Check current session (used by the dashboard page)
app.get('/api/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in.' });
  }
  res.json({ username: req.session.username });
});

// Log out
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
