# V2 Dashboard UI Improvements

> **📌 ACTIVE TODO FILE** - This is the current source of truth for Bready development.
> Previous todo file archived at: `/tasks/todo.ARCHIVED.md`

## Overview
Comprehensive UX improvements to make the V2 dashboard more intuitive, actionable, and visually engaging.

**Design Principles:**
- **3-Second Rule**: Users should understand their financial status in 3 seconds
- **Hierarchy**: Most important info gets most visual weight
- **Actionability**: Dashboard should suggest next steps, not just show data
- **Simplicity**: Every change should be as simple as possible

---

## Phase 1: Quick Wins + Foundation ⚡ **✅ COMPLETE**
**Goal**: Establish clear visual hierarchy and improve core dashboard UX
**Time Estimate**: 3-4 hours
**Completion Date**: 2025-10-15

### Information Hierarchy & Layout
- [x] **Redesign dashboard layout** with clear visual hierarchy
  - [x] Create hero card for "This Month at a Glance" (total spending + trend)
  - [x] Add mini sparkline to show 30-day spending trend
  - [x] Consolidate budget status into summary card (show count: "6 on track, 2 warning, 2 over")
  - [x] Move settlement alerts to prominent position (only if settlements exist)
  - [x] Create "Top 3 Categories" section with visual bars
  - [x] Remove detailed charts from dashboard (keep in Insights page)

### Dashboard Purpose Clarity
- [x] **Simplify dashboard focus** to answer "Am I okay?" in 3 seconds
  - [x] Add overall budget health indicator (🟢 Healthy / 🟡 Warning / 🔴 Over)
  - [x] Show only actionable summary information
  - [x] Add "View detailed breakdown" links pointing to Expenses, Budgets, Insights pages
  - [x] Remove redundant information (keep charts in Insights)

### Visual Improvements
- [x] **Add micro-visualizations** to category list
  - [x] Progress bars showing each category as % of total
  - [x] Color-code bars by category color
  - [x] Add category icons (emoji or lucide icons)

- [x] **Add trend indicators** to metric cards
  - [x] "+12% vs last month" style comparison
  - [x] Up/down arrows with color coding (green = down spending, red = up)
  - [x] Show absolute change: "+$127 vs last month"

- [x] **Improve empty states** with actionable CTAs
  - [x] "No expenses yet" state with friendly icon
  - [x] Clear "Add Your First Expense" button
  - [x] Optional: "Import from CSV" secondary action

- [x] **Add skeleton loading states**
  - [x] Create skeleton card component
  - [x] Replace spinner with content-shaped placeholders
  - [x] Improve perceived performance

### Visual Refinement (Feedback Round 1)
- [x] **Apply gradient backgrounds to cards**
  - [x] Budget Health card: blue-100 to indigo-100 gradient (stronger than 50)
  - [x] Settlements card: emerald-100 to teal-100 gradient (stronger than 50)
  - [x] Top Spending Categories card: amber-100 to orange-100 gradient (stronger than 50)
  - [x] Update text colors for readability on new backgrounds

- [x] **Enhance button prominence and alignment**
  - [x] Ensure "View All Budgets" and "Settle Now" buttons align horizontally using flexbox
  - [x] Change action buttons from outline to default variant with themed colors
  - [x] Add hover effects (shadow-lg, transition-all)
  - [x] Make clickable elements more visually distinct

### Visual Refinement (Feedback Round 2)
- [x] **Strengthen card gradients**
  - [x] Changed from 50-level to 100-level gradients for better contrast
  - [x] Cards now stand out against page background

- [x] **Enhance card shadows and borders**
  - [x] Changed from `shadow-md` to `shadow-xl` for stronger depth
  - [x] Added subtle white border (`border-white/40`) for glass card effect

- [x] **Fix button alignment with flexbox**
  - [x] Added `flex flex-col min-h-[200px]` to CardContent
  - [x] Used `mt-auto` on button Link wrappers to push buttons to bottom
  - [x] Buttons now align horizontally at same vertical position

### Visual Refinement (Feedback Round 3 - Warm Color Palette)
- [x] **Switch to warm, cohesive color scheme**
  - [x] Budget Health: Changed from blue-100/indigo-100 to yellow-100/amber-100 (golden yellow)
  - [x] Budget Health icon: Changed from indigo-600 to amber-700
  - [x] Budget Health buttons: Changed from indigo-600/700 to amber-600/700
  - [x] Settlements: Changed from emerald-100/teal-100 to pink-100/rose-100 (warm pink)
  - [x] Settlements icon: Changed from emerald-600 to rose-600
  - [x] Settlements button: Changed from emerald-600/700 to rose-600/700
  - [x] Top Categories: Kept amber-100/orange-100 (already on-brand)
  - [x] All cards now use warm tones aligned with Bready's bread theme

### Visual Refinement (Feedback Round 4 - Rich Vibrant Gradients)
- [x] **Upgrade to rich, saturated gradients (400-500 level)**
  - [x] Budget Health: Changed from yellow-100/amber-100 to amber-400/yellow-400/amber-500 (rich golden)
  - [x] Budget Health icon: Darkened from amber-700 to amber-800
  - [x] Budget Health buttons: Darkened from amber-600/700 to amber-700/800 for contrast
  - [x] Settlements: **REMOVED PINK** - Changed from pink-100/rose-100 to lime-400/yellow-400/lime-500 (bright lime)
  - [x] Settlements icon: Changed from rose-600 to lime-800
  - [x] Settlements button: Changed from rose-600/700 to lime-700/800
  - [x] Top Categories: Changed from amber-100/orange-100 to orange-400/amber-400/orange-500 (vibrant orange)
  - [x] Top Categories button: Changed from amber-600/700 to orange-700/800
  - [x] All cards now use rich, vibrant gradients matching reference design
  - [x] Pink completely removed from color palette

### Visual Refinement (Feedback Round 5 - Neutral Stone Palette) **UI/UX AGENT APPROVED**
- [x] **Switch to sophisticated neutral stone palette** (vibrant gradients were too overpowering)
  - [x] Budget Health: Changed from amber-400/yellow-400/amber-500 to stone-50/stone-100 (neutral base)
  - [x] Budget Health borders: Changed from white/40 to stone-200/50 (subtle definition)
  - [x] Budget Health icon: Changed from amber-800 to stone-600
  - [x] Budget Health buttons: Changed from amber-700/800 to stone-700/800
  - [x] Budget Health title: Changed from gray-900 to stone-700
  - [x] Settlements: Changed from lime-400/yellow-400/lime-500 to amber-50/40 to stone-100 (very subtle amber accent)
  - [x] Settlements borders: Changed from white/40 to amber-200/40 (maintains bread theme connection)
  - [x] Settlements icon: Changed from lime-800 to stone-600
  - [x] Settlements button: Changed from lime-700/800 to stone-700/800
  - [x] Settlements title: Changed from gray-900 to stone-700
  - [x] Top Categories: Changed from orange-400/amber-400/orange-500 to stone-50/stone-50/50/stone-100
  - [x] Top Categories borders: Changed from white/40 to stone-200/50
  - [x] Top Categories button: Changed from orange-700/800 to stone-700/800
  - [x] Top Categories title: Changed from gray-900 to stone-700
  - [x] **Result**: Calm, professional, sophisticated palette that doesn't overwhelm
  - [x] **Visual hierarchy** maintained through typography, shadows, and spacing rather than bold colors

---

## Phase 2: Enhanced Interactivity 🎯 **✅ COMPLETE**
**Goal**: Make the dashboard more interactive and efficient to use
**Time Estimate**: 3-5 hours
**Completion Date**: 2025-10-15

### Navigation Improvements
- [x] **Collapsible sidebar toggle** ✅ COMPLETE
  - [x] Add collapse/expand button to sidebar
  - [x] Icon-only mode when collapsed (width: 64px)
  - [x] Persist user preference in localStorage
  - [x] Smooth animation for collapse/expand

- [x] **Navigation order optimization** ✅ COMPLETE (2025-10-16)
  - [x] Reordered navigation to prioritize daily-use features
  - **New order:** Dashboard → Expenses → Budgets → Settlements → Insights → Settings
  - **Rationale:** Expenses (daily use) moved from 3rd to 2nd position
  - **UX improvement:** Reduced mouse travel for most common actions
  - Updated in `components/sidebar/sidebar-nav.tsx`

- [x] **Keyboard shortcuts** ✅ DESCOPED
  - User requested removal from scope
  - May be reconsidered in future phases

### UX Enhancements
- [x] **Optimistic UI** for expense creation ✅ ALREADY IMPLEMENTED
  - [x] Shows expense immediately in UI when user adds it
  - [x] Rollback and error handling if API fails
  - [x] Implemented in `app/(new-layout)/expenses/page.tsx` (lines 160-206)
  - [x] Uses `optimisticExpenses` state with temp IDs

- [x] **Contextual quick actions** ✅ REMOVED (2025-10-16)
  - ~~Over-budget alerts with "Review Budgets" button~~
  - ~~Pending settlements alerts with "Settle Now" button~~
  - ~~Recurring expenses due soon notifications~~
  - ~~Inactivity reminders (>3 days without expenses)~~
  - **Removed from Dashboard, Expenses, and Budgets pages per user request**
  - Component file kept for potential future use

### User Management & Settings
- [x] **Settings page** ✅ COMPLETE
  - [x] Created Settings navigation in sidebar
  - [x] Built dedicated Settings page (`app/(new-layout)/settings/page.tsx`)
  - [x] Integrated UserManagement component
  - [x] Added placeholder sections for future features (Notifications, Export Data)

- [x] **User CRUD operations** ✅ COMPLETE
  - [x] Create user with name, email, and color picker
  - [x] Edit user with inline dialog
  - [x] Delete user with cascade warning (deletes expenses)
  - [x] 4-user household limit enforced by API
  - [x] Color-coded user avatars
  - [x] Fully functional API routes

### Global Month Selector
- [x] **URL-based month state management** ✅ COMPLETE
  - [x] Moved MonthSelector from sidebar bottom to below "Add Expense" button
  - [x] Implemented URL query parameter (`?month=YYYY-MM`)
  - [x] Month selection persists across all pages
  - [x] Removed redundant page-specific MonthSelector from Settlements page
  - [x] Updated all page headers to display dynamic month names:
    - Dashboard: "October 2025 at a Glance"
    - Expenses: "October 2025 Expenses"
    - Budgets: "October 2025 Budgets"
    - Settlements: "October 2025 Settlements"
    - Insights: "October 2025 Insights"

---

## Phase 3: Polish & Accessibility ✨
**Goal**: Perfect the experience with advanced features and accessibility
**Time Estimate**: 5-8 hours

### Mobile Experience
- [ ] **Swipe navigation** (mobile only)
  - [ ] Horizontal swipes between pages (Dashboard ← → Expenses ← → Budgets ← → Insights)
  - [ ] Smooth page transitions
  - [ ] Visual page indicator (dots)

- [ ] **Smart FAB (Floating Action Button)**
  - [ ] Hide when scrolling down (focus on content)
  - [ ] Show when scrolling up (quick access)
  - [ ] Thumb-zone optimized positioning

### Onboarding & Help
- [ ] **First-time user onboarding**
  - [ ] Progressive disclosure tour (4 steps)
  - [ ] "Welcome to Bready" modal
  - [ ] Highlight key features (sidebar, add expense, budgets)
  - [ ] "Skip tour" option

- [ ] **Contextual tooltips**
  - [ ] Explain budget health indicators
  - [ ] Explain shared vs personal expenses
  - [ ] Add "?" help icons for complex features

### Accessibility
- [ ] **Semantic HTML audit**
  - [ ] Replace div-heavy structure with semantic tags (`<article>`, `<section>`, `<header>`)
  - [ ] Proper heading hierarchy (h1 → h2 → h3)
  - [ ] Use `<data>` for numeric values

- [x] **ARIA labels & roles** ✅ COMPLETE (2025-10-16)
  - [x] Added `aria-label` to icon-only buttons (Edit, Delete, View Receipt)
  - [x] Contextual labels include entity names (e.g., "Edit {user.name}")
  - [x] Implemented in expense tables, user management, and budget cards
  - [ ] Add `aria-live` regions for dynamic updates
  - [ ] Proper `role` attributes for custom components

- [x] **Keyboard navigation** ✅ COMPLETE (2025-10-16)
  - [x] Added global focus styles with `:focus-visible` (WCAG 2.1 AA compliant)
  - [x] 2-3px solid outlines with offsets and box-shadows
  - [x] Enhanced focus for buttons (3px outline + shadow)
  - [x] Form input focus styling with border color changes
  - [x] Radix UI Dialog primitives provide automatic:
    - Focus trap (locks focus inside modals)
    - Escape key handling (closes dialogs)
    - Focus restoration (returns to trigger element)
  - [x] Created keyboard shortcuts system:
    - Hook: `hooks/use-keyboard-shortcut.ts`
    - Help dialog: `components/keyboard-shortcuts-dialog.tsx`
    - Floating "Shortcuts" button (bottom-right)
    - Press `?` to view keyboard shortcuts
    - Integrated into `components/sidebar-layout.tsx`
  - [x] All interactive elements reachable via Tab
  - [x] Enter/Space to activate buttons (browser default)

- [ ] **Screen reader support**
  - [ ] Announce when expenses are added/deleted
  - [ ] Announce budget warnings
  - [ ] Descriptive alt text for charts

### Performance
- [ ] **Code splitting**
  - [ ] Lazy load Insights page (charts are heavy)
  - [ ] Lazy load modals/dialogs

- [ ] **Memoization**
  - [ ] Memoize expensive calculations (stats, charts)
  - [ ] Use React.memo for frequently re-rendered components

- [ ] **Bundle size optimization**
  - [ ] Analyze bundle with `@next/bundle-analyzer`
  - [ ] Remove unused dependencies
  - [ ] Use dynamic imports for heavy libraries

---

## Additional Nice-to-Haves (Future)
- [ ] Add data export feature (PDF reports)
- [ ] Add spending goals and achievements
- [ ] Add expense categories customization
- [ ] Add multi-currency support
- [ ] Add receipt image viewer/lightbox
- [ ] Add expense search/filter on dashboard

---

## Completed Features Summary

**V2 Dashboard UI Improvements** (Phases 1-3): ✅ Complete
- See detailed implementation notes in `/docs/CHANGELOG_V2_DASHBOARD.md`

**Net Worth Dashboard Feature**: ✅ Complete & Production-Ready
- See detailed implementation notes in `/docs/CHANGELOG_NET_WORTH.md`

---

## Security Hardening Implementation (2025-10-27) **🚧 IN PROGRESS**
**Goal**: Address critical security vulnerabilities identified in security audit
**Risk Reduction**: 7.2/10 → ~4.0/10 (45% improvement target)

### Phase 1: Session & Authentication Security

- [x] **Phase 1.1: Migrate sessions from localStorage to httpOnly cookies** ✅ COMPLETE
  - [x] Create secure session library with httpOnly cookies (`lib/networth/session.ts`)
  - [x] Create server actions for client components (`app/actions/networth-session.ts`)
  - [x] Document migration plan in `SECURITY_MIGRATION_NOTES.md`
  - [x] Update Net Worth page component to use server-side sessions
  - [x] Add dynamic rendering configuration for Next.js 15 async cookies
  - [x] Test session persistence - verified in production (commit 43f8c19)

- [ ] **Phase 1.2: Implement CSRF protection for all state-changing operations**
  - [ ] Create CSRF token generation and validation system
  - [ ] Add CSRF tokens to all POST/PUT/DELETE API routes
  - [ ] Update forms to include CSRF tokens
  - [ ] Test CSRF protection with cross-origin requests

### Phase 2: Security Headers & Authentication Hardening

- [ ] **Phase 2.1: Add comprehensive security headers to next.config.ts**
  - [ ] Content-Security-Policy (CSP) with nonce support
  - [ ] Strict-Transport-Security (HSTS) for HTTPS enforcement
  - [ ] X-Frame-Options: DENY (clickjacking protection)
  - [ ] X-Content-Type-Options: nosniff
  - [ ] Referrer-Policy: strict-origin-when-cross-origin
  - [ ] Permissions-Policy (disable unnecessary features)

- [ ] **Phase 2.2: Strengthen PIN requirements (8+ chars with complexity)**
  - [ ] Update validation in PIN setup/update API routes
  - [ ] Update UI validation in PIN dialogs
  - [ ] Add complexity requirements (letters + numbers + special chars)
  - [ ] Prevent common patterns (1234, 0000, etc.)
  - [ ] Add password strength meter

- [ ] **Phase 2.3: Implement Redis-based rate limiting for production**
  - [ ] Set up Upstash Redis for serverless compatibility
  - [ ] Create rate limiting middleware
  - [ ] Apply to all API routes (especially auth endpoints)
  - [ ] Add rate limit headers (X-RateLimit-*)
  - [ ] Configure different limits per endpoint type

### Security Metrics

| Metric | Before | After Phase 1 | After Phase 2 | Target |
|--------|--------|---------------|---------------|--------|
| Critical Vulnerabilities | 2 | 1 | 0 | 0 |
| High Severity Issues | 3 | 2 | 0 | 0 |
| Overall Risk Score | 7.2/10 | ~5.5/10 | ~4.0/10 | <4.5/10 |
| OWASP Top 10 Coverage | Partial | Improved | Comprehensive | 90%+ |

### Related Documents
- `SECURITY_AUDIT_REPORT_2025.md` - Full security assessment
- `SECURITY_MIGRATION_NOTES.md` - httpOnly cookie migration guide

---

---

## Notification System Implementation (2025-10-29) **🚧 IN PROGRESS**
**Goal**: Implement email notification system with budget alerts, settlement reminders, and recurring expense reminders
**Time Estimate**: 4-6 hours

### Phase 1: Database Schema & Email Setup (1.5 hours)
- [ ] **Phase 1.1: Add NotificationPreference table**
  - [ ] Add NotificationPreference model to Prisma schema
  - [ ] Run migration: `npx prisma migrate dev --name add_notification_preferences`
  - [ ] Verify schema with Prisma Studio

- [ ] **Phase 1.2: Set up Resend email service**
  - [ ] Install dependencies: `npm install resend @react-email/components`
  - [ ] Set up Resend account and get API key
  - [ ] Add RESEND_API_KEY to .env
  - [ ] Create `lib/email/resend-client.ts` wrapper
  - [ ] Create `lib/email/send-notification.ts` helper

### Phase 2: Notification Settings UI (1 hour)
- [ ] **Build notification settings page**
  - [ ] Create `components/settings/notification-settings.tsx` component
  - [ ] Add toggle controls for each notification type
  - [ ] Add threshold/days configuration inputs
  - [ ] Integrate into Settings page
  - [ ] Create API route: `/api/notifications/preferences`

### Phase 3: Trigger Logic (1.5 hours)
- [ ] **Budget alerts**
  - [ ] Create `lib/notifications/budget-alerts.ts`
  - [ ] Check budget thresholds (75%, 90%, 100%) in expense creation
  - [ ] Trigger email notifications when thresholds crossed
  - [ ] Integrate into `/api/expenses/route.ts`

- [ ] **Settlement reminders**
  - [ ] Create `lib/notifications/settlement-reminders.ts`
  - [ ] Find pending settlements older than X days
  - [ ] Send reminder emails to users with pending payments

- [ ] **Recurring expense reminders**
  - [ ] Create `lib/notifications/recurring-reminders.ts`
  - [ ] Find recurring expenses due in X days
  - [ ] Send reminder emails before due date

### Phase 4: Email Templates (1 hour)
- [ ] **Create React Email templates**
  - [ ] `lib/email/templates/budget-alert.tsx`
  - [ ] `lib/email/templates/settlement-reminder.tsx`
  - [ ] `lib/email/templates/recurring-reminder.tsx`
  - [ ] Add Bready branding (logo, colors)
  - [ ] Test templates with sample data

### Phase 5: Cron Jobs (30 minutes)
- [ ] **Daily notification checks**
  - [ ] Create `/api/cron/daily-notifications/route.ts`
  - [ ] Configure Vercel Cron (vercel.json)
  - [ ] Schedule daily at 9 AM user timezone
  - [ ] Check settlement reminders
  - [ ] Check recurring expense reminders

### Phase 6: Testing & Polish (30 minutes)
- [ ] **End-to-end testing**
  - [ ] Test email deliverability
  - [ ] Test notification preferences CRUD
  - [ ] Test each notification type trigger
  - [ ] Verify no duplicate notifications
  - [ ] Check email formatting across clients

### Features
- **Budget Alerts**: 75%, 90%, 100% spending thresholds
- **Settlement Reminders**: Configurable days (default 7)
- **Recurring Expense Reminders**: X days before due (default 3)
- **Individual Controls**: Toggle each notification type separately
- **Email Delivery**: Via Resend API (push notifications future phase)

### Status
🚧 **IN PROGRESS** - Starting Phase 1: Database Schema & Email Setup

---

## Reference Links
- [Original UI Analysis Discussion](#)
- [Vercel Preview URL](https://bready-git-feature-navigation-redesign-michael-lys-projects.vercel.app)
- [GitHub PR #1](https://github.com/milleely/bready/pull/1)

---

## Bug Fix Review - Dashboard "View All" 404 Error (2025-10-31)

### Issue
Production bug where clicking "View All" button on the Top Spending Categories card redirected users to `/insights` route, which doesn't exist, resulting in a 404 error.

### Root Cause
The dashboard component was linking to `/insights` page that was planned but never implemented. The route file `app/(new-layout)/insights/page.tsx` doesn't exist in the codebase.

### Solution
**File Changed**: `components/dashboard-page-content.tsx:516`
- Changed: `<Link href="/insights">`
- To: `<Link href="/expenses">`

### Rationale
- Top Spending Categories shows expense breakdown by category
- Users expecting to see more details should be directed to the Expenses page
- The Expenses page exists and allows filtering/viewing all expenses
- Maintains logical user flow: Dashboard → Category summary → Full expense list

### Impact
- **Minimal code change**: 1 line modified
- **No breaking changes**: Simple route update
- **Immediate fix**: Resolves 404 error in production
- **User experience**: Users can now navigate to view detailed expenses as intended

### Testing Needed
- [x] Verify `/expenses` route exists (confirmed: `app/(new-layout)/expenses/page.tsx`)
- [ ] Manual test: Click "View All" button and verify redirect to Expenses page
- [ ] Verify no other components link to non-existent `/insights` route

### Notes
- The `/insights` page may be implemented in a future phase based on the V2 Dashboard roadmap
- When `/insights` is implemented, consider whether it should show category-filtered view vs current implementation
