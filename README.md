# FreelanceUp MVP — Setup Guide for VS Code

## Prerequisites
Install these before starting:
- **Node.js** (v18+) → https://nodejs.org
- **VS Code** → https://code.visualstudio.com

---

## Step 1 — Open the project in VS Code

1. Extract the downloaded zip file
2. Open VS Code
3. Go to **File → Open Folder**
4. Select the `freelance-mvp` folder
5. Click **Open**

---

## Step 2 — Open two terminals in VS Code

In VS Code: go to **Terminal → New Terminal** (or press Ctrl+` / Cmd+`)

---

## Step 3 — Start the Backend

In the first terminal, run:

```bash
cd backend
npm install
npm start
```

You should see:
```
✅  Backend running → http://localhost:5000
```

---

## Step 4 — Start the Frontend

Click the **+** icon to open a second terminal, then run:

```bash
cd frontend
npm install
npm start
```

The browser will open automatically at **http://localhost:3000**

---

## Using the App

1. **Sign Up** — create an account (trust score starts at 20)
2. **Skill Test** — answer 5 questions, earn up to 50 trust points
3. **Sandbox Task** — write a proposal, earn +10 trust points
4. **Jobs** — apply to any job once your trust score is ≥ 30
5. **Profile** — view your full trust score breakdown

---

## Trust Score Formula

```
Trust Score = min(skillScore, 50) + min(tasksCompleted × 10, 30) + 20 (active bonus)
Max possible = 100
Minimum to apply for jobs = 30
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /signup | No | Create account |
| POST | /login | No | Login |
| GET | /skill-test/questions | Yes | Get quiz questions |
| POST | /skill-test | Yes | Submit quiz answers |
| GET | /task | Yes | Get sandbox task |
| POST | /task-submit | Yes | Submit task output |
| GET | /jobs | Yes | List all jobs |
| POST | /apply-job | Yes | Apply to a job |
| GET | /profile | Yes | Get user profile |

---

## Project Structure

```
freelance-mvp/
├── backend/
│   ├── server.js       ← Express server (all routes + logic)
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js    ← React entry point
    │   ├── App.js      ← Router + Auth context + Nav
    │   ├── api.js      ← fetch() wrapper with JWT
    │   └── pages/
    │       ├── Login.js
    │       ├── Signup.js
    │       ├── Dashboard.js
    │       ├── SkillTest.js
    │       ├── Task.js
    │       ├── Jobs.js
    │       └── Profile.js
    └── package.json
```

---

## Notes

- Data is stored **in-memory** — it resets when you restart the backend
- In development the frontend proxies `/api` calls to `localhost:5000` via the `proxy` field in `package.json`
- JWT tokens are stored in `localStorage` and expire after 7 days

---

## Run locally / Production

### Run locally (development)

```bash
# Terminal 1 — API on http://localhost:5000
cd backend
npm install
npm run dev          # or: npm start

# Terminal 2 — React dev server on http://localhost:3000 (proxies /api to :5000)
cd frontend
npm install
npm start
```

No env vars are needed for local dev. See `backend/.env.example` and `frontend/.env.example` for what can be set.

### Production (single service, e.g. Render / Railway)

The backend serves the built React app, so one Node service is enough:

- **Build command:** `npm run build` (from the repo root)
- **Start command:** `npm start`
- **Env vars:** `NODE_ENV=production`, `JWT_SECRET` (required, long random string), `CORS_ORIGINS` (optional), `PORT` (set by most hosts)

Health check: `GET /health`. The API is available under `/api/*` (old un-prefixed paths still work).

### Production (separate frontend + backend)

- Deploy `backend/` as a Node service (`npm ci && npm start`) with `JWT_SECRET`, `CORS_ORIGINS=https://<your-frontend-domain>`, `NODE_ENV=production`.
- Deploy `frontend/` as a static site (`npm ci && npm run build`, publish `build/`) with `REACT_APP_API_URL=https://<your-backend-domain>`, and add an SPA rewrite of all paths to `/index.html`.

> ⚠️ Data is stored in memory and is lost on every restart/redeploy. Add a database before real use.

> 🧹 `node_modules/` folders are committed in this repo (~38k files). They are now ignored; untrack them once with:
> `git rm -r --cached backend/node_modules frontend/node_modules && git commit -m "Stop tracking node_modules" && git push`
