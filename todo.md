# Bready — Active Todo

> **ACTIVE SOURCE OF TRUTH.** Detailed history of completed work archived at `/docs/archived/TODO_HISTORY_2026-05.md`. Shipped feature notes live in `/docs/CHANGELOG_V2_DASHBOARD.md` and `/docs/CHANGELOG_NET_WORTH.md`.

## Shipped (one-line recap)

- ✅ V2 Dashboard (sidebar, neutral-stone cards, URL month state, keyboard shortcuts, mobile bottom-sheet picker) — see `/docs/CHANGELOG_V2_DASHBOARD.md`.
- ✅ Net Worth dashboard (50/30/20 budget, PIN auth, httpOnly cookie sessions, full month isolation, one-time income frequency) — see `/docs/CHANGELOG_NET_WORTH.md`.
- ✅ Notification System infrastructure (Resend client, email templates, budget-alert trigger on expense create) — currently behind a "Coming Soon" preview pending Resend domain verification.
- ✅ Performance pass (cron N+1 fix, composite index, debounced listeners, parallel budget-alert queries, paginated expenses API).
- ✅ Fixed dashboard empty-state "Add expense" button (2026-06-01): both `ExpenseForm` instances in `dashboard-page-content.tsx` had `onSubmit` stubs that closed the dialog + refetched but never POSTed to `/api/expenses`, so adds silently did nothing on an empty month. Added a `handleAddExpense` handler that POSTs (and throws on failure so the form shows the error), wired to both instances.
- ✅ Recurring expense feature deactivated (2026-05-30): all 9 blueprints set `isActive=false` after recurring round-3 bugs (May rent over-count, missing June/July). Code/cron/UI remain; all entry is manual going forward. See `scripts/deactivate-all-recurring.ts`.

---

## In Progress

### Phase 3: Polish & Accessibility ✨

**Mobile**
- [ ] Swipe navigation between pages (Dashboard ↔ Expenses ↔ Budgets ↔ Insights) with dot indicator.
- [ ] Smart FAB — hide on scroll-down, show on scroll-up, thumb-zone positioning.

**Onboarding**
- [ ] First-time tour modal (4 steps: sidebar, add expense, budgets, settings) with skip option.
- [ ] Contextual tooltips for budget health, shared vs personal expenses, "?" icons for complex features.

**Accessibility**
- [ ] Semantic HTML audit — swap `<div>`-heavy structure for `<article>`/`<section>`/`<header>`, fix heading hierarchy, use `<data>` for numbers.
- [ ] `aria-live` regions for dynamic updates (added/deleted expenses, budget warnings).
- [ ] Screen reader: announce expense add/delete, budget warnings, descriptive chart alt text.

**Performance**
- [ ] Lazy load Insights page (charts are heavy) and modal/dialog components.
- [ ] Memoize expensive calculations (stats, charts); `React.memo` for frequently re-rendered components.
- [ ] Bundle audit with `@next/bundle-analyzer`, prune unused deps, dynamic-import heavy libs.

### Security Hardening (target: 7.2/10 → ~4.0/10 risk)

- [ ] **Phase 1.2 — CSRF protection** on all POST/PUT/DELETE routes. Token generation + validation system, form integration, cross-origin test.
- [ ] **Phase 2.1 — Security headers** in `next.config.ts`: CSP (nonce), HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy.
- [ ] **Phase 2.2 — PIN strength**: 8+ chars, letters + numbers + special, block common patterns (1234, 0000), strength meter in UI.
- [ ] **Phase 2.3 — Rate limiting**: Upstash Redis middleware on all API routes (stricter on auth), `X-RateLimit-*` response headers, per-endpoint limits.

Reference docs: `/SECURITY_AUDIT_REPORT_2025.md`, `/SECURITY_MIGRATION_NOTES.md`.

### Notification System — remaining ~1 hour

**Phase 5 — Daily reminders cron**
- [ ] `lib/notifications/settlement-reminders.ts` — query settlements with `lastSettlementDate` older than user-pref threshold; filter by `settlementRemindersEnabled`; batch send.
- [ ] `lib/notifications/recurring-reminders.ts` — query `RecurringExpense` where `nextDate` within user-pref window; filter by `recurringRemindersEnabled`; batch send.
- [ ] `/app/api/cron/daily-notifications/route.ts` — calls both reminder fns, `CRON_SECRET` header auth, returns summary count.
- [ ] `vercel.json` — add `"0 9 * * *"` schedule (9 AM UTC daily) → `/api/cron/daily-notifications`.

**Phase 6 — Testing & rollout**
- [ ] Manual end-to-end: cross 75% threshold, trigger settlement reminder via date adjustment, set recurring expense due soon, toggle preferences off.
- [ ] Edge cases: no email, `emailEnabled: false`, Resend API error (log + don't crash), multiple thresholds crossed (only highest sent).
- [ ] Production: add `RESEND_API_KEY` to Vercel env, test cron via `vercel dev --yes`, verify no dupes, check rendering in Gmail/Outlook/Apple Mail.
- [ ] Lift "Coming Soon" wrapper once Resend domain is verified.

---

## Nice-to-have backlog

- [ ] PDF export of monthly reports.
- [ ] Spending goals + achievements.
- [ ] Custom user-defined expense categories.
- [ ] Multi-currency support.
- [ ] Receipt image lightbox/viewer.
- [ ] Expense search/filter on dashboard.

---

## Working agreements

1. Plan first → confirm with user → implement → high-level recap.
2. Every change as small as possible. Touch only the code the task requires.
3. Trace the **whole** code flow when debugging — no assumptions, no temp fixes, find root causes.
4. Run a local build before pushing to production.
5. Keep this file slim; archive completed work to `/docs/archived/`.

---

## Reference links

- [Vercel preview](https://bready-git-feature-navigation-redesign-michael-lys-projects.vercel.app)
- [GitHub PR #1](https://github.com/milleely/bready/pull/1)
