# Task-Flow

A single-user task manager built for the **Acme AI Fellowship - Junior Full-Stack Developer** assessment.

Task-Flow pairs a Next.js App Router frontend with an Express + TypeScript REST API, persisting data in PostgreSQL (Neon) through Prisma. It covers full CRUD, runtime validation on both layers, status filtering, priority sorting, due dates with overdue highlighting, and automated database-backed integration tests.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Neon PostgreSQL)](#quick-start-neon-postgresql)
- [Local PostgreSQL Alternative](#local-postgresql-alternative)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Database Migrations & Seeding](#database-migrations--seeding)
- [REST API Documentation](#rest-api-documentation)
- [Validation Rules](#validation-rules)
- [Testing](#testing)
- [Quality Checks](#quality-checks)
- [Troubleshooting](#troubleshooting)
- [Assessment Checklist](#assessment-checklist)
- [AI Assistance Disclosure](#ai-assistance-disclosure)

---

## Overview

Task-Flow lets a user create, edit, complete, and delete personal tasks from a responsive dashboard. The API is the single source of truth: every mutation is validated again on the server, persisted in PostgreSQL, and returned in a consistent JSON envelope.

**Scope decisions**

- PostgreSQL is provided by **Neon** using a direct (non-pooled) connection string. No Docker is required.
- Any standard PostgreSQL connection string works, including a local server - this is the reviewer fallback.
- The frontend is deployed on **Vercel** and the backend API on **Render**, both backed by PostgreSQL.
- The database schema, migrations, and seed data are committed so an evaluator can start in a few commands.

---

## Live Demo

| Resource            | URL                                                                              |
| :------------------ | :------------------------------------------------------------------------------- |
| Frontend            | <https://task-follow-mu.vercel.app>                                              |
| Backend healthcheck | <https://task-follow.onrender.com/health>                                        |
| Demo video          | <https://drive.google.com/file/d/1yJk9NMElhv4oe5gDJ2iG1xPLAVdS-jOq/view>         |

The backend runs on Render's free tier. If the healthcheck takes a few seconds to
respond, the instance is waking up - retry once it is warm.

---

## Features

**Core**

- View all tasks with counts for pending and completed.
- Create tasks with title, description, priority, and due date.
- Edit any task field.
- Toggle status between `pending` and `completed` (optimistic UI with rollback on failure).
- Delete tasks behind an accessible confirmation dialog.
- Empty / whitespace-only titles rejected in the UI **and** in the API.
- Data persists across page refreshes and backend restarts.

**Bonus**

- Status filter: All / Pending / Completed with live counts.
- Priority sorting (high → low and low → high), creation-date sorting, and due-date sorting.
- Due dates with calendar-based **overdue** highlighting (pulsing border + badge).
- Quick search across titles and descriptions.
- 21 automated integration tests running against a real PostgreSQL test schema.

**UX & accessibility**

- Loading skeletons, animated empty state with CTA, dismissible error banner, and auto-dismissing toasts (`aria-live="polite"`).
- Modals use `role="dialog"`, `aria-modal`, labelled titles, Escape to close, Tab focus trap, and focus restoration.
- Keyboard-operable controls with visible focus rings.
- Responsive layout verified from 375px upward; controls stack without horizontal scrolling.
- Hand-written CSS tokens, custom scrollbar, keyframe animations, and completed-task strikethrough.

---

## Tech Stack

| Layer      | Choice                                             | Version                       |
| :--------- | :------------------------------------------------- | :---------------------------- |
| Frontend   | Next.js App Router + React                         | `15.5.28` / `19.3.1`          |
| Language   | TypeScript                                         | `5.9.3`                       |
| Styling    | Tailwind CSS + custom CSS                          | `3.4.19`                      |
| Icons      | lucide-react                                       | `1.60.0`                      |
| Backend    | Node.js + Express                                  | Node 20+ / `5.3.0`            |
| ORM        | Prisma + @prisma/client                            | `6.19.3`                      |
| Validation | Zod                                                | `4.6.7`                       |
| Database   | PostgreSQL (Neon)                                  | 16+                           |
| Tests      | Vitest + Supertest + tsx                           | `3.2.7` / `7.3.1` / `4.23.15` |
| Linting    | ESLint (flat config backend, Next config frontend) | `9.x` / `8.x`                 |

---

## Architecture

```text
Browser
  │
  ▼
Next.js App Router (client dashboard)
  │  typed fetch client (frontend/src/services/task-api.ts)
  ▼
Express REST API
  │  routes → validation middleware → controllers → services
  ▼
Prisma ORM
  │  parameterised queries
  ▼
PostgreSQL (Neon)
```

Backend layers:

- **Routes** map HTTP verbs to controllers and attach Zod validation.
- **Controllers** translate HTTP ↔ service calls and choose status codes.
- **Services** own business logic and Prisma access.
- **Middleware** provides centralised error mapping, 404 handling, and validation.
- **Schemas** define runtime contracts with Zod.

All responses use one envelope:

```json
{ "success": true, "data": {} }
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

---

## Project Structure

```text
Task-Follow/
├── package.json                  # Root convenience scripts
├── .env.example                  # Root reference for both apps
├── README.md
│
├── backend/
│   ├── .env.example
│   ├── .env.test.example
│   ├── eslint.config.mjs
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/0_init/migration.sql
│   │   └── seed.ts
│   ├── src/
│   │   ├── app.ts                # Express app assembly + /health
│   │   ├── server.ts             # Startup + graceful shutdown
│   │   ├── config/               # env parsing, Prisma singleton
│   │   ├── controllers/
│   │   ├── middleware/           # validate, error, not-found
│   │   ├── routes/
│   │   ├── schemas/              # Zod contracts
│   │   ├── services/
│   │   └── utils/                # AppError, response envelope, logger
│   └── tests/
│       ├── globalSetup.ts        # test schema + migrations
│       ├── setup.ts              # truncate between tests
│       └── task.api.test.ts      # 21 integration tests
│
└── frontend/
    ├── .env.example
    ├── next.config.ts
    ├── tailwind.config.ts
    └── src/
        ├── app/                  # layout, dashboard, error, not-found, icon
        ├── components/           # Header, FilterBar, TaskList, TaskCard, modals…
        ├── lib/format.ts         # UTC-safe formatting, overdue detection
        ├── services/task-api.ts  # typed fetch client + ApiError
        └── types/task.ts
```

---

## Prerequisites

- **Node.js 20 LTS or newer** (`20.x`, `22.x`, or `24.x`). Node 20 is recommended.
- **npm 10 or newer** (bundled with Node 20+).
- **PostgreSQL 16+**. The recommended path is a free [Neon](https://neon.tech) project, but any PostgreSQL server works.
- **Python is not required.** Both the frontend and backend are Node.js/TypeScript projects; there are no Python dependencies or scripts.
- Windows, macOS, or Linux. Commands below show both `cmd`/PowerShell and Unix variants where they differ.

---

## Quick Start (Neon PostgreSQL)

### 1. Clone and install

```bash
git clone <your-repository-url>
cd Task-Follow
npm install --prefix backend
npm install --prefix frontend
```

### 2. Create a Neon database

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **direct** connection string (the host **without** `-pooler`) from **Connection Details**.
3. It looks like:

```text
postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

> Migrations need a direct connection. A pooled URL (`-pooler` host) can be used for the running app, but keep a direct URL available for `prisma migrate deploy`.

### 3. Configure the backend

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

Create `backend/.env.test` from `backend/.env.test.example` (used only by the test suite):

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require&schema=test"
```

The tests create and use an isolated `test` schema, so they never touch the `public` data that the app reads.

### 4. Configure the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### 5. Apply migrations and seed

```bash
cd backend
npx prisma migrate deploy
npm run db:seed
cd ..
```

`db:seed` is optional and resets the `tasks` table with three demonstration tasks (one completed, one overdue, one upcoming).

### 6. Run the application

From the repository root:

```bash
npm run dev
```

Or run each workspace in its own terminal:

```bash
npm run dev --prefix backend     # http://localhost:5000
npm run dev --prefix frontend    # http://localhost:3000
```

Open <http://localhost:3000>. Confirm the API is healthy:

```bash
curl.exe http://localhost:5000/health     # Windows
curl http://localhost:5000/health         # macOS / Linux
```

```json
{
  "success": true,
  "data": { "status": "healthy", "database": "connected", "timestamp": "..." }
}
```

To use the hosted deployment instead of local servers, open the
[frontend](https://task-follow-mu.vercel.app) and check the
[backend health endpoint](https://task-follow.onrender.com/health).

---

## Local PostgreSQL Alternative

No Docker is required, but any PostgreSQL server works.

1. Create a database:

```sql
CREATE DATABASE taskflow;
```

2. Point `backend/.env` at it:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow?schema=public"
```

3. Apply the committed migration and seed:

```bash
cd backend
npx prisma migrate deploy
npm run db:seed
```

4. For tests, point `backend/.env.test` at the same server with `&schema=test`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow?schema=test"
```

The committed migration is generated SQL, so no shadow database privileges are required.

---

## Deployment

The project is already deployed and publicly accessible:

- **Frontend (Vercel):** <https://task-follow-mu.vercel.app>
- **Backend (Render):** <https://task-follow.onrender.com> - healthcheck at <https://task-follow.onrender.com/health>
- **Demo video:** <https://drive.google.com/file/d/1yJk9NMElhv4oe5gDJ2iG1xPLAVdS-jOq/view>

To reproduce the deployment:

1. **Backend (Render)**
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Root directory: `backend`
   - Environment variables:
     ```env
     DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
     CORS_ORIGIN="https://task-follow-mu.vercel.app"
     NODE_ENV="production"
     ```
   - Run `npx prisma migrate deploy` once against the production database.

2. **Frontend (Vercel)**
   - Framework preset: Next.js
   - Root directory: `frontend`
   - Environment variable:
     ```env
     NEXT_PUBLIC_API_URL="https://task-follow.onrender.com"
     ```
   - Redeploy after changing `NEXT_PUBLIC_API_URL`, because it is embedded at build time.

> The backend is hosted on Render's free tier, so the first request after a period of inactivity may take a few seconds while the instance wakes up.

---

## Environment Variables

| File                  | Variable              | Required                             | Description                             |
| :-------------------- | :-------------------- | :----------------------------------- | :-------------------------------------- |
| `backend/.env`        | `PORT`                | No (default `5000`)                  | API port                                |
| `backend/.env`        | `DATABASE_URL`        | Yes                                  | PostgreSQL connection string            |
| `backend/.env`        | `CORS_ORIGIN`         | No (default `http://localhost:3000`) | Allowed frontend origin                 |
| `backend/.env`        | `NODE_ENV`            | No (default `development`)           | `development` \| `test` \| `production` |
| `backend/.env.test`   | `DATABASE_URL`        | Yes for tests                        | Same database with `&schema=test`       |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | No (default `http://localhost:5000`) | Backend base URL                        |

`.env`, `.env.local`, and `.env.test` are gitignored. Only `*.example` files are committed - **never commit real credentials**.

---

## Available Scripts

From the repository root:

| Script                 | Description                                                      |
| :--------------------- | :--------------------------------------------------------------- |
| `npm run dev`          | Run backend and frontend together                                |
| `npm run dev:backend`  | Run only the API (`tsx watch`)                                   |
| `npm run dev:frontend` | Run only the Next.js dev server                                  |
| `npm run build`        | Production build for backend (`tsc`) and frontend (`next build`) |
| `npm test`             | Backend integration tests (Vitest + Supertest)                   |
| `npm run lint`         | ESLint for backend and frontend                                  |
| `npm run typecheck`    | `tsc --noEmit` for backend and frontend                          |
| `npm run db:seed`      | Reset and seed demonstration tasks                               |

From `backend/`: `npm run dev`, `build`, `start`, `test`, `lint`, `typecheck`, `db:seed`.

From `frontend/`: `npm run dev`, `build`, `start`, `lint`, `typecheck`.

---

## Database Migrations & Seeding

Schema highlights (`backend/prisma/schema.prisma`):

- `Task` model mapped to `tasks`.
- `TaskStatus` enum: `pending`, `completed` (default `pending`).
- `TaskPriority` enum: `low`, `medium`, `high` (default `medium`).
- `dueDate` (`due_date`) nullable, `createdAt` (`created_at`), `updatedAt` (`updated_at`).
- Indexes on `status`, `created_at DESC`, and `priority`.

Common commands (run inside `backend/`):

```bash
npx prisma validate         # validate schema
npx prisma migrate deploy   # apply committed migrations
npx prisma migrate status   # check migration state
npm run db:seed             # reset + insert sample tasks
npx prisma studio           # browse data
```

To regenerate the initial SQL without a database:

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

---

## REST API Documentation

Base URL: `http://localhost:5000`

All request bodies are JSON. All responses use the `success`/`data` or `success`/`error` envelope.

| Method   | Endpoint                | Body / Query                                           | Success | Errors              |
| :------- | :---------------------- | :----------------------------------------------------- | :------ | :------------------ |
| `GET`    | `/api/tasks`            | `?status=&sort=&order=&search=`                        | `200`   | `400`, `500`        |
| `GET`    | `/api/tasks/:id`        | -                                                      | `200`   | `400`, `404`, `500` |
| `POST`   | `/api/tasks`            | `{ title, description?, priority?, dueDate? }`         | `201`   | `400`, `500`        |
| `PUT`    | `/api/tasks/:id`        | Any of `title, description, status, priority, dueDate` | `200`   | `400`, `404`, `500` |
| `PATCH`  | `/api/tasks/:id/toggle` | -                                                      | `200`   | `404`, `500`        |
| `DELETE` | `/api/tasks/:id`        | -                                                      | `200`   | `404`, `500`        |
| `GET`    | `/health`               | -                                                      | `200`   | `503`               |
| `*`      | Unknown route           | -                                                      | -       | `404`               |
| `*`      | Malformed JSON          | -                                                      | -       | `400`               |

### Query parameters (`GET /api/tasks`)

| Parameter | Values                                 | Default     |
| :-------- | :------------------------------------- | :---------- |
| `status`  | `pending` \| `completed`               | all         |
| `sort`    | `createdAt` \| `dueDate` \| `priority` | `createdAt` |
| `order`   | `asc` \| `desc`                        | `desc`      |
| `search`  | string, max 100 chars                  | none        |

`sort=priority` uses a deterministic in-memory rank (`high → medium → low`) because PostgreSQL enum ordering follows declaration order.

### Examples

**Create**

```bash
curl.exe -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Ship Task-Flow\",\"description\":\"Final review\",\"priority\":\"high\",\"dueDate\":\"2026-11-01\"}"
```

```json
{
  "success": true,
  "data": {
    "id": "3f1c2b9e-4a7d-4e2a-9f3b-1c2d3e4f5a6b",
    "title": "Ship Task-Flow",
    "description": "Final review",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-11-01T00:00:00.000Z",
    "createdAt": "2026-10-21T07:30:00.000Z",
    "updatedAt": "2026-10-21T07:30:00.000Z"
  }
}
```

**List with filter + sort + search**

```bash
curl.exe "http://localhost:5000/api/tasks?status=pending&sort=priority&order=desc&search=ship"
```

**Update**

```bash
curl.exe -X PUT http://localhost:5000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"completed\"}"
```

**Toggle**

```bash
curl.exe -X PATCH http://localhost:5000/api/tasks/<id>/toggle
```

**Delete**

```bash
curl.exe -X DELETE http://localhost:5000/api/tasks/<id>
```

```json
{
  "success": true,
  "data": { "message": "Task deleted successfully", "id": "..." }
}
```

**Validation error**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "path": "title", "message": "Title is required" }]
  }
}
```

---

## Validation Rules

- `title`: trimmed, 1–255 characters (required on create; if provided on update, cannot be blank).
- `description`: optional/nullable, trimmed, max 2000 characters; empty string becomes `null`.
- `status`: `pending` | `completed`.
- `priority`: `low` | `medium` | `high`, defaults to `medium`.
- `dueDate`: ISO date or datetime, or `null`; date-only values are stored at UTC midnight.
- Update body: at least one recognised field; unknown keys are rejected.
- Path `:id`: must be a valid UUID → otherwise `400`.
- Query: enum/format checks → otherwise `400`.

Error mapping:

| Condition                                              | Status                                  |
| :----------------------------------------------------- | :-------------------------------------- |
| Zod validation failure / invalid UUID / malformed JSON | `400`                                   |
| Valid UUID not found (or Prisma `P2025`)               | `404`                                   |
| Unknown route                                          | `404`                                   |
| Database unavailable (`/health`)                       | `503`                                   |
| Unhandled error                                        | `500` (details logged server-side only) |

---

## Testing

```bash
npm test            # from root
npm test --prefix backend
```

- Framework: **Vitest** + **Supertest** against the real Express app and a real PostgreSQL test schema.
- `tests/globalSetup.ts` creates the `test` schema and applies migrations before the run.
- `tests/setup.ts` truncates `tasks` before each test for isolation.
- The suite covers 21 cases: health, list/search/filter/sort, create defaults, blank and oversized titles, get by id, invalid UUIDs, update, toggle both directions, delete, 404s, invalid query, unknown route, and malformed JSON.
- Tests run serially and use `backend/.env.test`. If it is not configured, the suite warns instead of failing.

---

## Quality Checks

```bash
npm run lint         # backend (ESLint flat config) + frontend (next lint)
npm run typecheck    # backend + frontend, strict TypeScript
npm run build        # backend tsc + frontend next build
npm test             # 21 integration tests
```

All four commands pass on the current codebase.

---

## Troubleshooting

| Symptom                                        | Cause / Fix                                                                                                                    |
| :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `P1001: Can't reach database server`           | Check `DATABASE_URL`, network/VPN, and that the Neon project is awake. Verify the host has no typos.                           |
| `P1017: Server has closed the connection`      | Usually SSL or pooling. Keep `?sslmode=require` and use the direct host for migrations.                                        |
| Migration fails with shadow database error     | Use `prisma migrate deploy` (applies committed SQL) instead of `migrate dev`.                                                  |
| `Environment variable not found: DATABASE_URL` | Ensure you run Prisma commands from `backend/` and `backend/.env` exists.                                                      |
| Frontend shows "Failed to fetch"               | Backend not running, wrong `NEXT_PUBLIC_API_URL`, or `CORS_ORIGIN` mismatch. Restart the frontend after changing `.env.local`. |
| Port already in use                            | Change `PORT` in `backend/.env` (and `NEXT_PUBLIC_API_URL` if needed) or stop the conflicting process.                         |
| Tests fail to connect                          | Create `backend/.env.test` pointing at the same database with `&schema=test`.                                                  |
| `@prisma/client` engine errors after install   | Run `npx prisma generate` inside `backend/`.                                                                                   |
| Next.js and backend clock/date mismatch        | Dates are formatted with an explicit `timeZone: "UTC"`; overdue detection compares UTC calendar dates.                         |

---

## Assessment Checklist

- [x] Full CRUD end-to-end (view, create, edit, toggle, delete with confirmation).
- [x] `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `GET /:id`, and `/health` return correct status codes.
- [x] Empty/whitespace titles rejected in frontend and backend.
- [x] Pending/completed states visually distinct; overdue tasks highlighted.
- [x] Status filter, priority sort, and search.
- [x] PostgreSQL persistence via Prisma with committed migrations and seed.
- [x] `npm test` (21 tests), `npm run lint`, `npm run typecheck`, and both builds pass.
- [x] README covers Neon and local PostgreSQL setup, migrations, seed, API, tests, and troubleshooting.
- [x] No credentials committed; `.env*` ignored; examples provided.
- [x] Responsive layout verified from 375px.
- [x] Frontend deployed to Vercel and backend deployed to Render with a live PostgreSQL database.
- [x] Live demo and walkthrough video linked in the README.

---

## AI Assistance Disclosure

As required by the assessment guidelines: AI assistance was used to help plan, scaffold, and review this project. All code was reviewed, executed, and verified locally - including database migrations, the seeded Neon database, the integration suite, linting, type-checking, and production builds. Architectural and implementation decisions remain the candidate's responsibility.

---

**Author:** Abul Bashar
**Assessment:** Acme AI Fellowship - Cohort 8
