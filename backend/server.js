const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// CORS: comma-separated list in CORS_ORIGINS (default: allow all, fine for local dev)
const corsOrigins = (process.env.CORS_ORIGINS || '*').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: corsOrigins.includes('*') ? true : corsOrigins }));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret';
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET must be set in production');
    process.exit(1);
  }
  console.warn('⚠️  JWT_SECRET not set — using an insecure dev default');
}

// API routes live on a router mounted at /api (used by the frontend) and at / (legacy paths)
const api = express.Router();

// ── In-Memory DB ──────────────────────────────────────────────
let users = [];
let applications = [];

const JOBS = [
  { id: '1', title: 'Logo Design', description: 'Create a minimal logo for a tech startup. Must be clean, scalable, and provided in SVG format.', applicants: [] },
  { id: '2', title: 'Blog Writing', description: 'Write a 500-word SEO article on remote work trends in 2024. Must include keywords and subheadings.', applicants: [] },
  { id: '3', title: 'Data Entry', description: 'Enter 100 product records into a Google Sheet with name, price, category, and SKU columns.', applicants: [] },
  { id: '4', title: 'Social Media Posts', description: 'Design 3 Instagram posts for a local bakery using Canva. Warm and friendly tone required.', applicants: [] },
  { id: '5', title: 'Product Descriptions', description: 'Write descriptions for 10 e-commerce items (50 words each). Must be persuasive and SEO-friendly.', applicants: [] },
  { id: '6', title: 'Email Newsletter', description: 'Write a monthly newsletter for a fitness brand. 300 words, include a CTA and tips section.', applicants: [] },
];

// Skill test answer key (0-indexed option)
const ANSWER_KEY = [1, 0, 2, 1, 0];

const SKILL_QUESTIONS = [
  {
    q: 'What does "scope creep" mean?',
    opts: ['Coding bugs in a project', 'Uncontrolled growth of project requirements', 'Slow internet speeds', 'None of the above'],
  },
  {
    q: 'A good freelancer invoice should include:',
    opts: ['Due date, itemised work, and total amount', 'Just the total amount', 'A personal thank-you note only', 'Nothing special'],
  },
  {
    q: 'Best way to handle unclear requirements from a client?',
    opts: ['Guess what they want', 'Skip the task entirely', 'Ask the client early for clarification', 'Deliver anything and see'],
  },
  {
    q: 'What is a milestone payment in freelancing?',
    opts: ['Only one final payment', 'A daily fee structure', 'Payment tied to specific deliverable stages', 'A tax deduction method'],
  },
  {
    q: 'Professionalism online means:',
    opts: ['Responding fast to everything', 'Sharing your opinions freely', 'Meeting deadlines and communicating clearly', 'Working 24 hours a day'],
  },
];

const SANDBOX_TASK = {
  title: 'Write a Project Proposal',
  description:
    'A client needs a 1-paragraph proposal for building their bakery website. Your response must include: (1) a timeline estimate, (2) your approach to the project, and (3) one clarifying question you would ask the client before starting.',
};

// ── Helpers ───────────────────────────────────────────────────
const findUser  = (id) => users.find((u) => u.id === id);
const calcTrust = (u)  => Math.min(u.skillScore, 50) + Math.min(u.tasksCompleted * 10, 30) + (u.isActive ? 20 : 0);
const validate  = (keys, body) => keys.every((k) => body[k] !== undefined && String(body[k]).trim() !== '');

const auth = (req, res, next) => {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorised — please login' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ── Routes ────────────────────────────────────────────────────

// POST /signup
api.post('/signup', async (req, res) => {
  if (!validate(['name', 'email', 'password'], req.body))
    return res.status(400).json({ error: 'name, email, and password are required' });

  const { name, email, password } = req.body;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (users.find((u) => u.email === email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash,
    skillScore: 0,
    tasksCompleted: 0,
    isActive: true,
    trustScore: 20, // starts with active bonus
  };
  users.push(user);

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, trustScore: user.trustScore },
  });
});

// POST /login
api.post('/login', async (req, res) => {
  if (!validate(['email', 'password'], req.body))
    return res.status(400).json({ error: 'email and password are required' });

  const { email, password } = req.body;
  const user = users.find((u) => u.email === email.toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, trustScore: user.trustScore },
  });
});

// GET /skill-test/questions
api.get('/skill-test/questions', auth, (_req, res) => {
  res.json(SKILL_QUESTIONS.map(({ q, opts }) => ({ q, opts })));
});

// POST /skill-test
api.post('/skill-test', auth, (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length !== ANSWER_KEY.length)
    return res.status(400).json({ error: `Provide exactly ${ANSWER_KEY.length} answers` });

  const correct    = answers.filter((a, i) => a === ANSWER_KEY[i]).length;
  const skillScore = Math.round((correct / ANSWER_KEY.length) * 50);

  const user = findUser(req.user.id);
  user.skillScore = skillScore;
  user.trustScore = calcTrust(user);

  res.json({ correct, total: ANSWER_KEY.length, skillScore, trustScore: user.trustScore });
});

// GET /task
api.get('/task', auth, (_req, res) => res.json(SANDBOX_TASK));

// POST /task-submit
api.post('/task-submit', auth, (req, res) => {
  const { taskOutput } = req.body;
  if (!taskOutput || String(taskOutput).trim().length < 20)
    return res.status(400).json({ error: 'Submission too short — minimum 20 characters' });

  const user = findUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.tasksCompleted += 1;
  user.trustScore = calcTrust(user);

  res.json({
    tasksCompleted: user.tasksCompleted,
    trustScore: user.trustScore,
    message: 'Task accepted! Trust score updated.',
  });
});

// GET /jobs
api.get('/jobs', auth, (_req, res) => {
  res.json(JOBS.map((j) => ({ ...j, applicants: j.applicants.length })));
});

// POST /apply-job
api.post('/apply-job', auth, (req, res) => {
  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ error: 'jobId is required' });

  const job  = JOBS.find((j) => j.id === String(jobId));
  if (!job)  return res.status(404).json({ error: 'Job not found' });

  const user = findUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.trustScore < 30)
    return res.status(403).json({
      error: `Trust score too low (${user.trustScore}). Need at least 30 to apply.`,
    });

  if (applications.find((a) => a.jobId === jobId && a.userId === req.user.id))
    return res.status(409).json({ error: 'You already applied to this job' });

  const application = {
    id: Date.now().toString(),
    jobId,
    userId: req.user.id,
    status: 'pending',
  };
  applications.push(application);
  job.applicants.push(req.user.id);

  res.status(201).json({ message: 'Application submitted!', application });
});

// GET /profile
api.get('/profile', auth, (req, res) => {
  const user = findUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const myApps = applications
    .filter((a) => a.userId === req.user.id)
    .map((a) => ({
      ...a,
      jobTitle: JOBS.find((j) => j.id === a.jobId)?.title || 'Unknown',
    }));

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    trustScore: user.trustScore,
    skillScore: user.skillScore,
    tasksCompleted: user.tasksCompleted,
    trustBreakdown: {
      fromSkill:   Math.min(user.skillScore, 50),
      fromTasks:   Math.min(user.tasksCompleted * 10, 30),
      activeBonus: user.isActive ? 20 : 0,
    },
    applications: myApps,
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', api);

// Production: serve the React build (frontend/build) from this server if present
const BUILD_DIR = process.env.FRONTEND_BUILD_DIR || path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
  app.use(express.static(BUILD_DIR));
  // Browser navigations (Accept: text/html) to client routes get index.html
  app.get('*', (req, res, next) => {
    if ((req.headers.accept || '').includes('text/html')) return res.sendFile(path.join(BUILD_DIR, 'index.html'));
    next();
  });
}

app.use('/', api);

app.listen(PORT, () => {
  console.log('');
  console.log(`✅  Backend running → http://localhost:${PORT}`);
  console.log('');
});
