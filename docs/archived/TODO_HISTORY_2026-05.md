# Todo History (archived 2026-05-19)

This file preserves the detailed task logs that previously lived in the root `todo.md`. It was archived to keep the active `todo.md` small and fast to scan. Items here are all **complete** — see the project changelogs for shipped-feature detail.

---

## V2 Dashboard UI Improvements (Phases 1–3)

Full implementation log lives in `/docs/CHANGELOG_V2_DASHBOARD.md`. Highlights:

- **Phase 1 — Quick Wins & Foundation** (completed 2025-10-15): redesigned dashboard hierarchy (hero "This Month at a Glance" card, sparkline trend, consolidated budget status, settlement alerts, Top 3 Categories with progress bars), trend indicators on metric cards, empty states with CTAs, skeleton loading states.
- **Phase 1 visual refinements** — five feedback rounds iterated card backgrounds from blue/indigo → warm yellow/amber → vibrant 400-level saturation → final **neutral stone palette** (UI/UX agent approved). Strengthened shadows (`shadow-xl`), added `border-white/40` glass-card borders, flexbox-aligned action buttons via `mt-auto`.
- **Phase 2 — Enhanced Interactivity** (completed 2025-10-15): collapsible sidebar with localStorage persistence, navigation reorder (Dashboard → Expenses → Budgets → Settlements → Insights → Settings), optimistic UI for expense creation, Settings page with full user CRUD (4-user limit), URL-based global month selector (`?month=YYYY-MM`).
- **Phase 3 — Polish & Accessibility** (partially complete):
  - ✅ Mobile calendar selector with bottom-sheet picker (vaul drawer, amber/stone palette, 48px touch targets).
  - ✅ ARIA labels on icon-only buttons, global `:focus-visible` styling (WCAG 2.1 AA), keyboard shortcuts dialog (`?` to open), Radix Dialog focus trap + escape handling.
  - Remaining items moved back to active `todo.md`.

## Net Worth Dashboard

Full implementation log lives in `/docs/CHANGELOG_NET_WORTH.md`.

### Net Worth Month Isolation Refactor (2025-11-23)

Switched Net Worth tracking from automatic carry-forward to **complete month isolation**. Each month is now a clean slate; the "Copy to Next Month" button **replaces** the target month's data when used.

- Removed ~150 lines of carry-forward logic from `app/api/networth/{assets,liabilities,income,summary}/route.ts`.
- `app/api/networth/carry-forward/route.ts` now deletes target-month data before copying.
- `components/networth-page-content.tsx` simplified — no `isEditingInherited` branching, no inheritance detection.

### One-Time Income Frequency (2025-12-22)

Added `"one_time"` income frequency for gifts/bonuses/windfalls. Five files touched (~12 lines): type union, INCOME_FREQUENCIES, normalizeIncomeToMonthly (returns full amount), Zod validation enum (initially missed — caused save failure), carry-forward exclusion (`frequency: { not: "one_time" }`).

## Security Hardening (started 2025-10-27)

**Phase 1.1 — httpOnly cookie sessions** ✅ shipped in commit 43f8c19. Created `lib/networth/session.ts`, server actions in `app/actions/networth-session.ts`, added `dynamic = 'force-dynamic'` + `runtime = 'nodejs'` to the Net Worth page for Next.js 15 async cookies.

Outstanding security work moved to active `todo.md`.

Reference docs: `SECURITY_AUDIT_REPORT_2025.md`, `SECURITY_MIGRATION_NOTES.md`.

## Notification System (started 2025-11-08)

Roughly 80% complete. **Phases 1–4 done**:

- **Phase 1** — `NotificationPreference` migration applied (`20251107025024_add_notification_preferences`), Resend client wired (`lib/email/resend-client.ts`), `.env.example` updated with `RESEND_API_KEY` plus free-tier notes.
- **Phase 2** — Settings UI (`components/settings/notification-settings.tsx`) with multi-select threshold dropdown, monthly settlement schedule, predefined recurring options, checkbox email toggle. API route `/api/notifications/preferences` (GET/PUT) working. UI currently behind a "Coming Soon" preview wrapper (`NotificationSettingsPreview`) because Resend account requires domain verification for production sends.
- **Phase 3** — Three email templates built in `lib/email/templates/` (budget-alert, settlement-reminder, recurring-reminder). Bready amber/stone palette, 600px responsive, CTAs link to the relevant page, includes helpful tips section + footer with preference link.
- **Phase 4** — Budget alert trigger logic in `lib/notifications/budget-alerts.ts` (183 lines). Integrated into `app/api/expenses/route.ts` POST (lines 125–128) using fire-and-forget pattern. De-duplication compares previous vs current % so alerts only fire when threshold is newly crossed — no schema changes needed. Supports personal and household budgets (personal takes priority).

Phases 5 (daily reminders cron) and 6 (testing) still open — see active `todo.md`.

## Performance Optimizations (2025-11-23)

Five changes, no UX impact:

1. **Cron N+1 fix** — `app/api/cron/daily-recurring-expenses/route.ts` now batches with `findFirst` + `createMany` + Set-based dedup (3 queries total, was O(N)).
2. **Composite index** — `Budget` model gained `@@index([householdId, category, month])` for threshold lookups.
3. **Debounced dashboard listeners** — 150ms debounce via `useRef` + `useCallback` on `expenseAdded/Edited/Deleted` events.
4. **Parallel budget-alert queries** — User, NotificationPreference, previousExpenses now run in parallel via `Promise.all` (~150ms → ~50ms).
5. **Pagination on `/api/expenses`** — optional `?page=1&limit=50`, returns `{ expenses, pagination }` shape when params present, plain array otherwise. Max 100/page enforced.

Composite index applies on next `prisma migrate dev` against a valid Postgres connection.

## Bug Fixes

### Dashboard "View All" 404 (2025-10-31)

`components/dashboard-page-content.tsx:516` linked to nonexistent `/insights` route. Changed to `/expenses` — single line, logical destination since the card shows category-grouped expenses.

### Recurring Expense Carry-Forward Bug (2026-05-02)

**Bug**: Recurring expenses created in month N appeared in N and N+1, then **skipped month N+2 entirely**, then resumed N+3 onward. User saw May 2026 (current month) empty even though March/April/June+ were populated.

**Root cause**: Off-by-one between creation (`app/api/recurring-expenses/route.ts:124-176` creates current + next) and cron (`app/api/cron/daily-recurring-expenses/route.ts:26` used `now.getMonth() + 2` — "two months ahead"). So April 1 cron generated June, never May. Permanent gap at month +2 from creation.

**Fix** (1 line): `now.getMonth() + 2` → `now.getMonth() + 1` in the daily cron, with renames (`twoMonthsAhead` → `nextMonth`) and updated comments/logs for clarity.

**Data recovery**:
- `scripts/diagnose-recurring.ts` (read-only) flagged 10 duplicate blueprints from a single Feb 7 2026 session (user had re-entered recurring expenses thinking they were broken).
- `scripts/deactivate-duplicate-recurring.ts --apply` deactivated 10 older blueprints (kept newer descriptions, e.g. "YMCA membership" over "YMCA").
- `scripts/backfill-recurring.ts 2026-05 --apply` wrote 13 missing May 2026 expense rows totaling $1,931.13. Re-running dry-run after showed 0 would-create / 13 skip — dedup working.

**Open follow-up** (out of scope, surfaced for awareness):
- April 2026 YMCA expenses in the UI didn't come from any active blueprint per diagnostic — source unknown (manual? deactivated blueprint?). Investigate only if user reports unexpected charges.
- Cron is still gated on `isFirstDayOfMonth`. A missed Vercel run = full month skipped, no recovery. Kept minimal per user direction; revisit if it bites again.

Phase 2 (cron self-healing window expansion) was descoped.

---

For UI/UX implementation decisions, the canonical references are:

- `/docs/CHANGELOG_V2_DASHBOARD.md` — V2 dashboard shipped features.
- `/docs/CHANGELOG_NET_WORTH.md` — Net Worth feature shipped details.
- `/docs/DESIGN_SYSTEM.md` — Color palette, tokens, motion language.
- `/docs/PROGRESS.md` — Cross-feature progress notes.
- `/SECURITY_AUDIT_REPORT_2025.md` — Security baseline and risk scoring.
- `/SECURITY_MIGRATION_NOTES.md` — httpOnly cookie migration notes.
