// SQLite persistence (better-sqlite3). Users, quiz results, trust scores and
// job applications survive restarts. The DB file defaults to backend/data/freelanceup.db
// and can be moved with DB_PATH (point it at a persistent disk in production).
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'freelanceup.db');
if (DB_PATH !== ':memory:') fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    skill_score     INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    is_active       INTEGER NOT NULL DEFAULT 1,
    trust_score     INTEGER NOT NULL DEFAULT 20,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    correct     INTEGER NOT NULL,
    total       INTEGER NOT NULL,
    skill_score INTEGER NOT NULL,
    answers     TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS task_submissions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    output      TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id         TEXT PRIMARY KEY,
    job_id     TEXT NOT NULL,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status     TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (job_id, user_id)
  );
`);

const rowToUser = (r) =>
  r && {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    skillScore: r.skill_score,
    tasksCompleted: r.tasks_completed,
    isActive: !!r.is_active,
    trustScore: r.trust_score,
  };

const stmts = {
  userById: db.prepare('SELECT * FROM users WHERE id = ?'),
  userByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  insertUser: db.prepare(`INSERT INTO users (id, name, email, password_hash, skill_score, tasks_completed, is_active, trust_score)
                          VALUES (@id, @name, @email, @passwordHash, @skillScore, @tasksCompleted, @isActive, @trustScore)`),
  updateScores: db.prepare(`UPDATE users SET skill_score = @skillScore, tasks_completed = @tasksCompleted,
                            trust_score = @trustScore WHERE id = @id`),
  insertQuiz: db.prepare('INSERT INTO quiz_results (user_id, correct, total, skill_score, answers) VALUES (?, ?, ?, ?, ?)'),
  insertTask: db.prepare('INSERT INTO task_submissions (user_id, output) VALUES (?, ?)'),
  insertApp: db.prepare('INSERT INTO applications (id, job_id, user_id, status) VALUES (@id, @jobId, @userId, @status)'),
  findApp: db.prepare('SELECT 1 FROM applications WHERE job_id = ? AND user_id = ?'),
  appsByUser: db.prepare('SELECT id, job_id AS jobId, user_id AS userId, status FROM applications WHERE user_id = ? ORDER BY created_at'),
  applicantCounts: db.prepare('SELECT job_id AS jobId, COUNT(*) AS n FROM applications GROUP BY job_id'),
};

module.exports = {
  db,
  DB_PATH,
  findUserById: (id) => rowToUser(stmts.userById.get(id)),
  findUserByEmail: (email) => rowToUser(stmts.userByEmail.get(email)),
  createUser: (u) => stmts.insertUser.run({ ...u, isActive: u.isActive ? 1 : 0 }),
  saveScores: (u) => stmts.updateScores.run(u),
  recordQuiz: db.transaction((u, correct, total, answers) => {
    stmts.insertQuiz.run(u.id, correct, total, u.skillScore, JSON.stringify(answers));
    stmts.updateScores.run(u);
  }),
  recordTask: db.transaction((u, output) => {
    stmts.insertTask.run(u.id, output);
    stmts.updateScores.run(u);
  }),
  hasApplied: (jobId, userId) => !!stmts.findApp.get(jobId, userId),
  createApplication: (a) => stmts.insertApp.run(a),
  applicationsByUser: (userId) => stmts.appsByUser.all(userId),
  applicantCounts: () => Object.fromEntries(stmts.applicantCounts.all().map((r) => [r.jobId, r.n])),
};
