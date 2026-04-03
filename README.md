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
- The frontend proxies API calls to `localhost:5000` via the `proxy` field in `package.json`
- JWT tokens are stored in `localStorage` and expire after 7 days
