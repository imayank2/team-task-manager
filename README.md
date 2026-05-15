# ⚡ TaskFlow - Team Task Manager

A full-stack web app for managing projects and tasks with role-based access control (Admin/Member).

## Features

- **Authentication** — Signup/Login with JWT
- **Role-based access** — Admins manage everything; Members view/update their tasks
- **Projects** — Create, edit, delete projects with team members (Admin only)
- **Tasks** — Create, assign, filter, and track tasks with status & priority
- **Dashboard** — Summary stats (total, todo, in progress, done, overdue)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcryptjs |
| Deploy | Railway |

---

## Local Development

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend setup (in a new terminal)

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`, API at `http://localhost:5000`.

---

## 🚀 Deploy on Railway

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### Step 2 — Create Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project → Deploy from GitHub repo**
3. Select your repository

### Step 3 — Add MongoDB

1. In Railway dashboard, click **New → Database → MongoDB**
2. Copy the **MONGO_PUBLIC_URL** connection string

### Step 4 — Set Environment Variables

In your Railway service settings → **Variables**, add:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Any long random string |
| `NODE_ENV` | `production` |

### Step 5 — Deploy

Railway auto-deploys when you push. The `railway.toml` handles the build and start commands.

Your app will be live at `https://<your-project>.railway.app`

---

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `GET /api/auth/users` — List all users

### Projects
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project (Admin)
- `PUT /api/projects/:id` — Update project (Admin)
- `DELETE /api/projects/:id` — Delete project (Admin)

### Tasks
- `GET /api/tasks` — List tasks (filter by `?projectId=`)
- `GET /api/tasks/dashboard` — Get stats summary
- `POST /api/tasks` — Create task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

---

## Roles

| Feature | Admin | Member |
|---------|-------|--------|
| Create/edit/delete projects | ✅ | ❌ |
| Add members to projects | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ |
| Delete tasks | ✅ | ✅ |
| View all tasks | ✅ | Own tasks only |
