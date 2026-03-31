# dev-team

> Internal skill management dashboard for development teams — members register their technical competencies across 10 skill categories, enabling team leads to visualize the collective capability map.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?style=flat-square&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-lightgrey?style=flat-square)

---

## Overview

**dev-team** is a full-stack web application for managing a development team's skill inventory. Each team member authenticates, selects their proficiency level across 10 technical categories (backend, frontend, mobile, architecture, management, security, infra, data, immersive, marketing), and keeps their profile up to date. An admin panel allows user management — creating, editing, and removing members. The app is deployed on Vercel using a serverless Node.js backend with SQLite persistence.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 + JavaScript (ES6+) |
| Framework | Express 5 |
| Database | SQLite 3 (`sqlite3`) |
| Authentication | JWT (`jsonwebtoken`) + bcryptjs |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Deployment | Vercel (serverless via `serverless-http`) |

---

## Features

- **Member authentication** — login with email/password, JWT issued on success (1h expiry)
- **Skill self-assessment** — 10 categories with individual skill entries and proficiency levels
- **Profile management** — members update their own skill set; `lastUpdate` timestamp tracked automatically
- **Team overview** — public endpoint returns all members with full parsed skill data
- **Admin panel** — create, edit (name, email, unit), and delete team members
- **Serverless-ready** — single `api/index.js` entry point wraps the Express app for Vercel Functions
- **Static frontend** — served directly from `/public` via Vercel's static build

---

## Skill Categories

Each user profile contains skill arrays for the following categories:

| Category | Examples |
|---|---|
| Backend | Node.js, Spring Boot, .NET, Python, PostgreSQL |
| Frontend | React, Angular, TypeScript, Next.js, Tailwind CSS |
| Mobile | React Native, Flutter, Kotlin, Swift |
| Architecture | Microservices, SOLID, Design Patterns, Figma |
| Management | Scrum, Kanban |
| Security | Pentest, OWASP, ISO 27001, LGPD |
| Infra | Docker, Kubernetes, AWS, CI/CD |
| Data | Power BI, Machine Learning, ETL |
| Immersive | AR/VR, Unity |
| Marketing | SEO, Google Ads, Social Media |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Vercel CLI](https://vercel.com/docs/cli) (for local dev with `vercel dev`)

### 1. Clone the repository

```bash
git clone https://github.com/nascimentoraphael/dev_team.git
cd dev_team
```

### 2. Configure environment variables

Create a `.env` file in `back-end/`:

```env
JWT_SECRET=your_jwt_secret_here
PORT=3001
NODE_ENV=development
```

### 3. Install dependencies

```bash
# Root (Vercel serverless entry)
npm install

# Backend (local dev)
cd back-end && npm install
```

### 4. Run locally

**Option A — Vercel dev (recommended, mirrors production):**

```bash
vercel dev
```

**Option B — Backend only:**

```bash
cd back-end
node server.js
```

The API will be available at `http://localhost:3001`.

---

## API Reference

### Authentication

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Login with email + password, returns JWT |
| `POST` | `/api/auth/register` | ❌ | Register new member |

### Users

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me/profile` | ✅ | Get authenticated user's profile with skills |
| `PUT` | `/api/users/me/profile/skills` | ✅ | Update authenticated user's skill set |
| `PUT` | `/api/users/:id` | ✅ Admin | Edit member (fullName, email, unit) |
| `DELETE` | `/api/users/:id` | ✅ Admin | Remove a member |

### Team

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/team` | ❌ | List all team members with parsed skills |

### Utility

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/ping` | Health check → `{ pong: true }` |

> **Auth header:** `Authorization: Bearer <token>`

---

## Project Structure

```
dev-team/
├── api/
│   └── index.js              # Serverless entry point (wraps Express with serverless-http)
├── back-end/
│   ├── server.js             # Express app setup, middleware, route registration
│   ├── database.js           # SQLite connection, schema creation, seed data
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification middleware
│   └── routes/
│       ├── authRoutes.js     # Register + login
│       ├── userRoutes.js     # Profile and admin user management
│       └── teamRoutes.js     # Team listing
├── public/
│   ├── index.html            # Main dashboard
│   ├── login.html            # Login page
│   ├── script.js             # Frontend logic
│   └── styles.css            # Styles
├── vercel.json               # Vercel build and routing config
└── package.json
```

---

## Deployment

The project is configured for zero-config deployment on Vercel:

```bash
vercel --prod
```

The `vercel.json` routes all `/api/*` requests to the serverless function and serves everything else as static files from `/public`.

> **Note:** SQLite writes to the local filesystem. On Vercel's ephemeral serverless environment, the database state does not persist between cold starts. For production use, replace SQLite with a persistent database (PostgreSQL, PlanetScale, Turso, etc.).

---

## License

ISC © [Raphael Nascimento](https://github.com/nascimentoraphael)
