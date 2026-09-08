import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import {
  requireEnv,
  verifyCredentials,
  issueSession,
  clearSession,
  authMiddleware,
  loginRateLimit,
  ensureDemoSeed,
} from './auth.js';

requireEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'app.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const VALID_KEYS = new Set(['words', 'notes', 'lessonNotes', 'todos', 'reviewLog', 'settings']);

const getStmt = db.prepare('SELECT value FROM store WHERE key = ?');
const upsertStmt = db.prepare(`
  INSERT INTO store (key, value, updated_at) VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
`);

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser(process.env.AUTH_COOKIE_SECRET));

app.post('/api/login', loginRateLimit, (req, res) => {
  const { username, password } = req.body ?? {};
  const scope = verifyCredentials(username ?? '', password ?? '');
  if (!scope) {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  }
  issueSession(res, scope);
  res.json({ scope });
});

app.post('/api/login/demo', loginRateLimit, (_req, res) => {
  issueSession(res, 'demo');
  res.json({ scope: 'demo' });
});

app.post('/api/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ scope: req.scope });
});

app.get('/api/state', authMiddleware, (req, res) => {
  if (req.scope === 'demo') ensureDemoSeed(db);
  const state = {};
  for (const key of VALID_KEYS) {
    const dbKey = req.scope === 'demo' ? `demo:${key}` : key;
    const row = getStmt.get(dbKey);
    state[key] = row ? JSON.parse(row.value) : null;
  }
  res.json(state);
});

app.put('/api/state/:key', authMiddleware, (req, res) => {
  const { key } = req.params;
  if (!VALID_KEYS.has(key)) {
    return res.status(400).json({ error: `Unknown key: ${key}` });
  }
  const dbKey = req.scope === 'demo' ? `demo:${key}` : key;
  upsertStmt.run(dbKey, JSON.stringify(req.body), new Date().toISOString());
  res.json({ ok: true });
});

// In production the built frontend (vite build → dist/) sits one level up
// from server/. Serving it from this same process keeps deployment to a
// single Node port — handy behind a panel like aaPanel that maps one
// domain to one Node project. In local dev dist/ doesn't exist; Vite's own
// dev server handles the frontend and proxies /api here instead.
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`[server] English Study API listening on http://localhost:${PORT}`);
  console.log(`[server] SQLite database at ${path.join(dataDir, 'app.db')}`);
});
