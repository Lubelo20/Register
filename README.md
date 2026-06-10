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
3. Add a database: **Storage → Create → Postgres** (Neon). When prompted, connect it
   to the project — this injects `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED`
   (direct) automatically.
4. Also add `ADMIN_PASSWORD` and `SESSION_SECRET` as environment variables.
5. Deploy. The build creates/syncs the `Registration` table automatically (see below),
   so there's no separate migration step.

> The build runs `prisma generate && prisma db push && next build` (see
> `package.json` → `build`). `prisma db push` uses the **direct** connection via the
> `directUrl` in `schema.prisma` (`DATABASE_URL_UNPOOLED`), while the app's runtime
> queries use the pooled `DATABASE_URL`. The push is idempotent — it only applies
> schema diffs.

## Notes

- Admin auth is a single shared password with a signed, httpOnly session cookie (8h). Fine for an event; swap for per-user auth later if needed.
- `socials` is stored as a string array (e.g. `["Instagram","LinkedIn"]`).
- A honeypot field silently drops bot submissions.

Built by Lubelo Tech Solutions.
