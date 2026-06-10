# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project briefing

You are helping build and extend the registration website for the
**Youth Digital Empowerment & Entrepreneurship Master Class**
(11 June 2026, Moses Kotane Research Institute, 190 K.E Masinga Road, Durban).

Tagline: "Empower. Equip. Connect. Succeed."

## Stack
- Next.js 14, App Router, TypeScript
- Prisma ORM + PostgreSQL (Neon / Vercel Postgres / Supabase)
- Plain CSS in `src/app/globals.css` (no Tailwind) — keep using the existing
  class names and CSS variables; do not introduce a UI framework without asking.
- Deploy target: Vercel. GitHub for source control.

## Commands
- `npm run dev` — start the dev server (form at `/`, admin at `/admin`).
- `npm run build` — runs `prisma generate` then `next build` (Vercel uses this).
- `npm run lint` — `next lint`.
- `npm run db:push` — push `schema.prisma` to the database (no migration files; this
  project uses `db push`, not `prisma migrate`). Run once against prod after first deploy.
- `npm run db:studio` — open Prisma Studio to inspect/edit registrations.
- No test runner is configured. If you add tests, also wire up the script and tooling.

Env vars (`.env`, see `.env.example`): `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`
(generate the secret with `openssl rand -hex 32`).

## Brand
- Navy `#0B2350`, gold `#F4A81C`, green `#1F9E5A`, light bg `#EEF2F8`.
- Display font: Space Grotesk. Body font: Inter (both via `next/font`).
- South African flag accent stripe is the signature element.

## Structure
- `src/app/page.tsx` — public hero + mounts `RegistrationForm`.
- `src/components/RegistrationForm.tsx` — the form (client component).
- `src/app/api/register/route.ts` — creates a Registration, returns a reference.
- `src/app/admin/page.tsx` — protected server component, queries Prisma.
- `src/components/AdminTable.tsx` — table, search, CSV export (client).
- `src/app/admin/login/page.tsx` + `src/app/api/admin/login|logout` — auth.
- `src/lib/auth.ts` — stateless session cookie (HMAC of ADMIN_PASSWORD + SESSION_SECRET).
- `src/lib/prisma.ts` — singleton Prisma client.
- `prisma/schema.prisma` — `Registration` model.
- `master-class-registration.html` — original standalone HTML mockup; reference only,
  not part of the Next.js app.

## Architecture notes (the non-obvious parts)
- **Auth is stateless and DB-less.** The session cookie value is `HMAC-SHA256(ADMIN_PASSWORD)`
  keyed by `SESSION_SECRET` (`sessionToken()` in `src/lib/auth.ts`). Login (`/api/admin/login`)
  compares the posted password to `ADMIN_PASSWORD` and sets that HMAC as an httpOnly cookie
  (8h). `admin/page.tsx` validates the cookie with a timing-safe compare and redirects to
  `/admin/login` if invalid. Changing `ADMIN_PASSWORD` or `SESSION_SECRET` invalidates all
  existing sessions. There is one shared admin password, not per-user accounts.
- **Client/server boolean convention:** the form posts `hasBusiness` / `hasWebsite` as the
  strings `"Yes"`/`"No"`; the API converts them to booleans. Keep this contract when editing
  either side.
- **References** are `YDEE-2026-NNNN` (4-digit random), generated server-side in the register route.
- **Honeypot:** a hidden `company_url` field; if present the API returns `{ ok: true,
  reference: "IGNORED" }` and discards the submission. Don't surface this field to real users.
- Register and admin routes use `export const dynamic = "force-dynamic"` (no caching).
- `socials` is a Postgres `String[]` (e.g. `["Instagram","LinkedIn"]`).

## Form rules (important — keep these intact)
- Required: firstName, surname, email, phone (SA cell), city, occupation, status, referral ("How did you hear about us?"), hasBusiness, POPIA consent.
- The **website** question appears ONLY when the person has a business, and is required in that case.
- **Social media is tick-only** — store the list of platforms; do NOT ask for handles.
- Conditional reveals: institution (if Student), business block (if hasBusiness=Yes), domain (if hasWebsite=Yes).

## Likely next tasks
- Email/SMS confirmation on register (Lubelo Tech has a bulk SMS API; Resend works for email).
- Capacity cap / "seats remaining" counter.
- Export filters by status/business in the admin dashboard.
- Per-user admin accounts if more than one organiser needs access.

## Conventions
- Keep server validation in the API route as the source of truth.
- Don't put secrets in client components. Env vars: DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET.
</content>
</invoke>
