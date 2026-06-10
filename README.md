# Master Class Registration

Registration website + admin dashboard for the **Youth Digital Empowerment & Entrepreneurship Master Class** (11 June 2026, Moses Kotane Research Institute, Durban).

Built with Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL. Designed to deploy on **Vercel**.

## What's inside

- **Public registration form** (`/`) — collects attendee details, business info (website asked only if they have a business), and social platforms (tick-only). POPIA consent required. Generates a reference like `YDEE-2026-1234`.
- **Admin dashboard** (`/admin`) — password-protected list of every registration, with live search and CSV export.
- **API** — `POST /api/register`, plus `/api/admin/login` and `/api/admin/logout`.

## Run it locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env file and fill it in:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — a PostgreSQL connection string (free options: Neon, Vercel Postgres, Supabase).
   - `ADMIN_PASSWORD` — the password for `/admin`.
   - `SESSION_SECRET` — run `openssl rand -hex 32` and paste the result.
3. Create the database tables:
   ```bash
   npm run db:push
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Form: http://localhost:3000 · Admin: http://localhost:3000/admin

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo.
3. Add a database: **Storage → Create → Postgres** (this sets `DATABASE_URL` for you), or paste a Neon/Supabase URL into **Settings → Environment Variables**.
4. Also add `ADMIN_PASSWORD` and `SESSION_SECRET` as environment variables.
5. Deploy. After the first deploy, run `npm run db:push` once against the production database (locally with the prod `DATABASE_URL`, or via a one-off script) to create the table.

> The build runs `prisma generate` automatically (see `package.json` → `build`).

## Notes

- Admin auth is a single shared password with a signed, httpOnly session cookie (8h). Fine for an event; swap for per-user auth later if needed.
- `socials` is stored as a string array (e.g. `["Instagram","LinkedIn"]`).
- A honeypot field silently drops bot submissions.

Built by Lubelo Tech Solutions.
