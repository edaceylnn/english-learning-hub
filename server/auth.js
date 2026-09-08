import crypto from 'node:crypto';

const REQUIRED_ENV = [
  'AUTH_REAL_USER',
  'AUTH_REAL_PASSWORD',
  'AUTH_DEMO_USER',
  'AUTH_DEMO_PASSWORD',
  'AUTH_COOKIE_SECRET',
];

export function requireEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`,
    );
  }
}

/** Constant-time string comparison — hashes both sides to a fixed length first
 * since crypto.timingSafeEqual throws on mismatched buffer lengths. */
function safeEqual(a, b) {
  const bufA = crypto.createHash('sha256').update(String(a)).digest();
  const bufB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(username, password) {
  if (
    safeEqual(username, process.env.AUTH_REAL_USER) &&
    safeEqual(password, process.env.AUTH_REAL_PASSWORD)
  ) {
    return 'real';
  }
  if (
    safeEqual(username, process.env.AUTH_DEMO_USER) &&
    safeEqual(password, process.env.AUTH_DEMO_PASSWORD)
  ) {
    return 'demo';
  }
  return null;
}

export const SESSION_COOKIE = 'es_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function issueSession(res, scope) {
  const payload = JSON.stringify({ scope, iat: Date.now() });
  res.cookie(SESSION_COOKIE, payload, {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSession(res) {
  res.clearCookie(SESSION_COOKIE);
}

export function authMiddleware(req, res, next) {
  const raw = req.signedCookies?.[SESSION_COOKIE];
  if (!raw) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const { scope, iat } = JSON.parse(raw);
    if ((scope !== 'real' && scope !== 'demo') || typeof iat !== 'number') {
      throw new Error('Malformed session');
    }
    if (Date.now() - iat > SESSION_TTL_MS) {
      return res.status(401).json({ error: 'Session expired' });
    }
    req.scope = scope;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const attempts = new Map();

export function loginRateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return res
      .status(429)
      .json({ error: 'Çok fazla deneme yaptın, birkaç dakika sonra tekrar dene.' });
  }
  entry.count += 1;
  next();
}

const DEMO_SEED_TTL_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function makeDemoWord(term, translation, type, example, status, dueInDays) {
  return {
    id: crypto.randomUUID(),
    term,
    translation,
    type,
    example,
    notes: '',
    tags: ['demo'],
    status,
    favorite: false,
    createdAt: daysFromNow(-5),
    lastReviewedAt: status === 'new' ? null : daysFromNow(-2),
    nextReviewAt: daysFromNow(dueInDays),
    interval: status === 'new' ? 0 : 2,
    repetitions: status === 'new' ? 0 : 1,
    easeFactor: 2.5,
  };
}

function buildDemoSeed() {
  const words = [
    makeDemoWord('ubiquitous', 'her yerde bulunan', 'adjective', 'Smartphones are ubiquitous these days.', 'learning', -1),
    makeDemoWord('reluctant', 'isteksiz', 'adjective', 'She was reluctant to leave.', 'learning', -1),
    makeDemoWord('give up', 'vazgeçmek', 'phrase', "Don't give up on your goals.", 'new', 0),
    makeDemoWord('borrow', 'ödünç almak', 'verb', 'Can I borrow your pen?', 'learned', 6),
    makeDemoWord('yummy', 'lezzetli', 'adjective', 'This cake is yummy!', 'learned', 8),
    makeDemoWord('hairdryer', 'saç kurutma makinesi', 'noun', 'I forgot my hairdryer at home.', 'new', 3),
  ];

  const notes = [
    {
      id: crypto.randomUUID(),
      title: 'Present Perfect kullanım notları',
      content: 'Present Perfect, geçmişte başlayıp etkisi süren ya da zamanı belirsiz olaylar için kullanılır.',
      category: 'Gramer',
      tags: ['demo', 'gramer'],
      createdAt: daysFromNow(-4),
      updatedAt: daysFromNow(-4),
    },
    {
      id: crypto.randomUUID(),
      title: 'Sık kullanılan phrasal verb\'ler',
      content: 'give up, look after, get along with, run into...',
      category: 'Kelime',
      tags: ['demo'],
      createdAt: daysFromNow(-2),
      updatedAt: daysFromNow(-2),
    },
  ];

  const lessonNotes = [
    {
      id: crypto.randomUUID(),
      date: daysFromNow(-1).slice(0, 10),
      topic: 'Modal Verbs: could, should, might',
      learned: 'Olasılık ve öneri bildiren modal fiillerin farkları üzerinde çalıştık.',
      exampleSentences: ['You should see a doctor.', 'It might rain later.'],
      teacherNotes: 'Telaffuzda "should" ve "would" karışabiliyor, tekrar pratik yap.',
      newWordIds: [words[0].id, words[1].id],
      createdAt: daysFromNow(-1),
    },
  ];

  const todos = [
    {
      id: crypto.randomUUID(),
      title: 'Grammar practice',
      description: 'Present Perfect alıştırmalarını tamamla',
      priority: 'medium',
      status: 'todo',
      dueDate: daysFromNow(0).slice(0, 10),
      createdAt: daysFromNow(-3),
    },
    {
      id: crypto.randomUUID(),
      title: '10 kelime tekrarı yap',
      description: '',
      priority: 'high',
      status: 'todo',
      dueDate: daysFromNow(0).slice(0, 10),
      createdAt: daysFromNow(-3),
    },
  ];

  const settings = { theme: 'dark', dailyGoal: 10, displayName: 'Demo' };

  return { words, notes, lessonNotes, todos, reviewLog: [], settings };
}

const demoGetStmt = (db) => db.prepare('SELECT value FROM store WHERE key = ?');
const demoUpsertStmt = (db) =>
  db.prepare(`
    INSERT INTO store (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);

/** Re-seeds the demo scope if it has never been seeded or is older than 24h.
 * Called lazily on demo-scoped requests instead of a setInterval, so it's
 * self-healing regardless of how often the server process restarts. */
export function ensureDemoSeed(db) {
  const get = demoGetStmt(db);
  const upsert = demoUpsertStmt(db);
  const row = get.get('demo:_seededAt');
  const seededAt = row ? Number(JSON.parse(row.value)) : 0;
  if (Date.now() - seededAt < DEMO_SEED_TTL_MS) return;

  const seed = buildDemoSeed();
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(seed)) {
    upsert.run(`demo:${key}`, JSON.stringify(value), now);
  }
  upsert.run('demo:_seededAt', JSON.stringify(Date.now()), now);
}
