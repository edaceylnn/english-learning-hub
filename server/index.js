import 'dotenv/config';
import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

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
app.use(express.json({ limit: '5mb' }));

app.get('/api/state', (_req, res) => {
  const state = {};
  for (const key of VALID_KEYS) {
    const row = getStmt.get(key);
    state[key] = row ? JSON.parse(row.value) : null;
  }
  res.json(state);
});

app.put('/api/state/:key', (req, res) => {
  const { key } = req.params;
  if (!VALID_KEYS.has(key)) {
    return res.status(400).json({ error: `Unknown key: ${key}` });
  }
  upsertStmt.run(key, JSON.stringify(req.body), new Date().toISOString());
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`[server] English Study API listening on http://localhost:${PORT}`);
  console.log(`[server] SQLite database at ${path.join(dataDir, 'app.db')}`);
});
