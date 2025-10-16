# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Documentation Structure

**Active Documentation:**
- **`/todo.md`** - Current development tasks (V2 Dashboard UI Improvements - Phase 3 in progress)
- **`/CLAUDE.md`** - This file - technical reference and development guidelines

**Archived:**
- **`/tasks/todo.ARCHIVED.md`** - Outdated Phase 1-6 tracker (receipt upload & filtering already implemented)

**Important:** Always refer to `/todo.md` for current work. Do not create duplicate todo files.

## Current Project Status

**Completed Features:**
- ✅ Sidebar navigation with collapsible design
- ✅ Month-based filtering across all pages
- ✅ Receipt upload system with image viewer
- ✅ Advanced expense filtering (user, category, type, amount range)
- ✅ Mobile-responsive design (375px+)
- ✅ Budget tracking and alerts
- ✅ Settlement calculations
- ✅ Contextual alerts and notifications

**In Progress:**
- 🚧 Phase 3: Polish & Accessibility (keyboard nav, ARIA labels, performance)

## Project Overview

This is a **multi-user financial expense tracker** built with Next.js 15, supporting up to 4 users who can track and manage shared household expenses. Users can categorize expenses, view analytics, and see spending breakdowns across personal and shared expenses.

## Development Commands

```bash
# Start development server (uses Turbopack)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Seed database with sample users and expenses
npm run seed

# Prisma commands
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma studio                                # Open database GUI
npx prisma generate                              # Regenerate Prisma client
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router and Turbopack
- **Tailwind CSS v4** (note: uses `@theme` directive syntax, not traditional config)
- **Prisma** with SQLite for database
- **shadcn/ui** components (Radix UI primitives)
- **Recharts** for data visualization
- **next-themes** for dark/light mode

### Database Schema (Prisma)

**User Model:**
- Supports up to 4 users (enforced at seed level, not schema level)
- Each user has a `color` field used for UI theming and visual identification
- Users own expenses through one-to-many relationship

**Expense Model:**
- `isShared` boolean determines if expense is split among all users
- Category is stored as string (validated against predefined list in `lib/utils.ts`)
- All expenses cascade delete when user is deleted

### Data Flow

1. **Client Component** (`app/page.tsx`) fetches data from three API routes:
   - `/api/users` - Returns all users
   - `/api/expenses` - Returns all expenses with user relations
   - `/api/stats` - Returns computed statistics (total spent, per-person breakdown, category breakdown)

2. **Stats Calculation** happens server-side in `/api/stats/route.ts`:
   - Aggregates expenses to calculate total spent, shared vs personal
   - Computes per-person totals including shared expense attribution
   - Groups expenses by category for chart data

3. **Shared Expense Logic:**
   - `isShared` flag on expense indicates it should be split among all users
   - UI displays shared expenses differently (green badge)
   - Stats endpoint separates personal and shared totals per user

### Categories System

Expense categories are defined in `lib/utils.ts` as a const array with:
- `value`: Internal identifier
- `label`: Display name
- `color`: Hex color for UI theming

To add/modify categories, update the `categories` array in `lib/utils.ts`. The type `Category` is automatically derived from this array.

### Styling with Tailwind v4

This project uses **Tailwind CSS v4**, which has different syntax from v3:

- CSS variables are defined using `@theme` directive in `app/globals.css`
- Color tokens use `--color-` prefix (e.g., `--color-background`)
- Dark mode is handled via `@media (prefers-color-scheme: dark)` with separate `@theme` blocks
- The `tailwind.config.ts` is minimal - most theme customization happens in CSS

### Component Structure

**Layout Components**:
- `sidebar-layout.tsx` - Main layout with collapsible sidebar, month selector, and navigation
- `month-selector-wrapper.tsx` - Suspense boundary wrapper for URL-based month selection
- `mobile-nav.tsx` - Bottom navigation for mobile devices

**Page Components** (`app/(new-layout)/*/page.tsx`):
- All pages are async Server Components that receive `searchParams` as Promise
- Pass `month` parameter to client-side content components
- Examples: `budgets/page.tsx`, `dashboard/page.tsx`, `expenses/page.tsx`

**Content Components** (`components/*-page-content.tsx`):
- Client components that handle page logic and state
- Accept `month` prop from parent page component
- Examples: `budgets-page-content.tsx`, `dashboard-page-content.tsx`

**Presentation Components** (`components/`):
- `metrics-cards.tsx` - Dashboard stat cards with gradient backgrounds
- `spending-charts.tsx` - Recharts visualizations (pie chart for categories, bar chart for users)
- `recent-expenses.tsx` - Table with inline edit/delete actions
- `expense-form.tsx` - Dialog-based form for creating/editing expenses
- `theme-toggle.tsx` - Dark/light mode switcher

**UI Components** (`components/ui/`):
- shadcn/ui components installed via CLI
- All use Radix UI primitives with Tailwind styling

### API Routes

All routes follow Next.js 15 App Router conventions:

- `GET /api/users` - List all users
- `GET /api/expenses?userId=&category=&startDate=&endDate=` - List expenses with optional filters
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense
- `GET /api/stats?startDate=&endDate=` - Computed statistics with optional date range

## Important Implementation Notes

### Database Migrations

After modifying `prisma/schema.prisma`:
1. Run `npx prisma migrate dev --name <description>` to create migration
2. Prisma Client auto-regenerates
3. Restart dev server if types aren't updating

### Adding New Expense Categories

1. Add entry to `categories` array in `lib/utils.ts` with value, label, and color
2. TypeScript types update automatically via `typeof categories[number]['value']`
3. No database migration needed (category is stored as string)

### Seeding Data

The seed script (`prisma/seed.ts`) creates 4 users and sample expenses. It's safe to run multiple times but will create duplicate users. To reset:

```bash
rm prisma/dev.db
npx prisma migrate dev
npm run seed
```

### Client-Side State Management

The main page (`app/page.tsx`) uses React useState for:
- Users, expenses, and stats fetched on mount
- `editingExpense` state to trigger form dialog for editing
- No global state management library (Redux, Zustand, etc.)

Refetches all data after mutations (add/edit/delete). For optimization, consider implementing optimistic updates or more granular refetching.

## Prisma Client Location

Prisma client is generated to default location (`node_modules/@prisma/client`). Import via:
```typescript
import { prisma } from '@/lib/db'
```

The singleton pattern in `lib/db.ts` prevents multiple instances in development with hot reloading.

### Development Notes

- Auto-save occurs on editor content changes
- Theme switching supports light/dark/system modes
- Responsive design optimized for desktop use

## Troubleshooting

### Next.js 15 Build Issues

**Problem**: `useSearchParams() should be wrapped in a suspense boundary` error during Vercel builds

**Solution Pattern**:
1. **For Page Components**: Use server-side `searchParams` prop instead of `useSearchParams()` hook
   ```typescript
   // Page component (Server Component)
   export default async function Page({
     searchParams,
   }: {
     searchParams: Promise<{ [key: string]: string | string[] | undefined }>
   }) {
     const { month } = await searchParams
     return <PageContent month={month as string | undefined} />
   }
   ```

2. **For Layout Components**: Extract `useSearchParams()` logic into separate component with Suspense boundary
   ```typescript
   // Wrapper component
   export function Wrapper({ children }) {
     return (
       <Suspense fallback={<Loading />}>
         <Client>{children}</Client>
       </Suspense>
     )
   }

   // Client component with useSearchParams
   function Client({ children }) {
     const searchParams = useSearchParams()
     // ... logic here
     return <Layout {...props}>{children}</Layout>
   }
   ```

**Key Points**:
- `useSearchParams()` in Client Components requires Suspense boundary for static generation
- Layout components that use `useSearchParams()` need special handling (see `month-selector-wrapper.tsx`)
- Server Components can access `searchParams` directly without Suspense
- Local dev builds may succeed while production builds fail - always test with `next build`

### Additional Rules

1. First think through the problem, read the codebase for relevant files, and write a plan to `/todo.md` (the ACTIVE todo file).
2. The plan should have a list of todo items that you can check off as you complete them.
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made.
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY.
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY.

CRITICAL: When debugging, you MUST trace through the ENTIRE code flow step by step. No assumptions. No shortcuts.
CRITICAL: Before pushing build to production, run locally to catch all errors in one cycle or in as few cycles needed.
- Update @todo.md regulary as you create features