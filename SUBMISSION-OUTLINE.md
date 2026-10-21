# Submission Outline — Fellowship-C8-AAI-Abul Bashar.pdf

Outline for the required assessment PDF. The PDF itself must be exported by the candidate with the screenshots listed below.

**File name:** `Fellowship-C8-AAI-Abul Bashar.pdf`

---

## Section 1 — Project Overview & Objectives

- What Task-Flow is: a single-user task manager.
- Assessment goal: demonstrate full-stack CRUD, validation, REST design, PostgreSQL persistence, and a polished responsive UI.
- Key decisions: Neon PostgreSQL (direct connection), Prisma migrations without a shadow database, Next.js App Router + Express/TypeScript separation.
- Scope statement: local execution, no live deployment claimed.

## Section 2 — Technology Stack & Architectural Decisions

- Stack table: Next.js `15.5.28`, React `19.3.1`, TypeScript `5.9.3`, Tailwind `3.4.19`, Express `5.3.0`, Prisma `6.19.3`, Zod `4.6.7`, Vitest + Supertest.
- Layer diagram: React dashboard → typed fetch client → routes → validation → controllers → services → Prisma → PostgreSQL.
- Why a service layer: isolates business logic from HTTP and database concerns.
- Why a shared response envelope: predictable success/error contracts for the client.
- Why client-side filtering plus API query support: instant UI feedback while keeping the API capable independently.
- Trade-offs: UUIDs for stable identifiers; direct Neon connection for migration reliability; in-memory priority rank to avoid PostgreSQL enum declaration-order quirks.

## Section 3 — Database Schema & Neon PostgreSQL Integration

- `Task` model fields and types; `TaskStatus` and `TaskPriority` enums.
- Indexes: `status`, `created_at DESC`, `priority`.
- Migration strategy: SQL generated with `prisma migrate diff`, applied with `prisma migrate deploy`; no shadow database required.
- Seed data: three tasks covering completed, overdue pending, and upcoming.
- Isolation: application uses the `public` schema; the test suite uses the `test` schema created and migrated by `tests/globalSetup.ts`.
- Credentials: `.env` files gitignored; only `.env*.example` placeholders committed.
- Include: schema excerpt, migration excerpt, Neon console screenshot showing the `tasks` table.

## Section 4 — REST API Documentation & Status Codes

- Endpoint table with methods, paths, bodies, and success/error codes.
- Request/response envelope examples.
- Validation rules (`title`, `description`, `priority`, `dueDate`, query params, UUID params).
- Error mapping table: `400`, `404`, `500`, `503`.
- Include: `GET /health` response screenshot, one successful create response, one validation error response.

## Section 5 — Feature Walkthrough & Screenshots

Capture and annotate:

1. Dashboard with mixed pending/completed tasks and counts.
2. Create-task modal (empty and with validation error).
3. Edit-task modal populated with existing values.
4. Toggle interaction (pending → completed).
5. Delete confirmation dialog.
6. Overdue task highlighting (pulsing border + badge).
7. Status filter: All / Pending / Completed.
8. Priority sort: High → Low.
9. Toast notification and error banner.
10. Mobile view at 375px (no horizontal overflow).
11. Neon data view / persistence after refresh.

## Section 6 — Setup Instructions & Evaluation Guide

- Prerequisites: Node 20+, PostgreSQL/Neon.
- Commands: install, environment files, `npx prisma migrate deploy`, `npm run db:seed`, `npm run dev`.
- Verification commands: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- Expected results: 21 tests passing, clean lint/typecheck, successful production builds.
- Reference README sections rather than duplicating everything.

## Section 7 — AI Assistance Disclosure

- State the scope of AI assistance (planning, scaffolding, review).
- State that all code was executed and verified locally: migrations applied, seed loaded, 21 integration tests passed against the Neon test schema, lint/typecheck/build passed.

---

## Rubric Coverage

| Criterion | Points | Evidence |
| :--- | :--- | :--- |
| Functionality | 20 | Full CRUD, validation, filter, sort, confirmation |
| Code Quality | 20 | Layered backend, reusable typed components, strict TypeScript |
| API Design | 20 | REST semantics, envelope, status codes, 404 catch-all |
| Database Integration | 20 | Neon PostgreSQL, Prisma migrations, parameterised queries |
| README & Setup | 20 | Setup for Neon and local PostgreSQL, API docs, troubleshooting |
| Bonus | +10 | Filter, priority sort, due dates/overdue, 21 DB-backed tests |

---

## Pre-Submission Checklist

- [ ] `git status` clean; `node_modules`, `dist`, `.next`, `.env`, `.env.local`, `.env.test` untracked.
- [ ] Secret scan finds no credentials in tracked files.
- [ ] `npm test` → 21 passing.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` → all pass.
- [ ] Screenshots captured for every item in Section 5 (desktop and 375px).
- [ ] PDF exported as `Fellowship-C8-AAI-Abul Bashar.pdf`.
- [ ] Public remote created and pushed by the candidate.
