# Bready Development Progress

**Last Updated:** 2025-10-09
**Status:** Phase 2 In Progress (Recurring Expenses)

## Overview

Bready is a multi-user expense tracking app built with Next.js 15, Prisma, and Tailwind CSS v4. This document tracks the implementation progress of new features beyond the initial multi-user expense tracker.

## Completed Features (11/29 tasks)

### ✅ Phase 1: Budget & Goals System (5 tasks)
- **Budget Model** - Added to Prisma schema with unique constraint on (category, month, userId)
- **Database Migration** - `20251009213512_add_budget_model`
- **API Routes** - Full CRUD at `/api/budgets` and `/api/budgets/[id]`
  - GET with month and userId filtering
  - POST with conflict handling for duplicate budgets
  - PUT and DELETE operations
- **BudgetDialog Component** - Form to set monthly budgets per category (shared or per-user)
  - Uses amber styling consistent with app theme
  - Validates category, amount, and month
- **BudgetProgress Component** - Visual progress bars showing budget vs spending
  - Color-coded: green (on track), yellow (>80%), red (over budget)
  - Only displays when budgets exist

**Key Files:**
- `prisma/schema.prisma` - Budget model
- `app/api/budgets/route.ts` - List and create
- `app/api/budgets/[id]/route.ts` - Update and delete
- `components/budget-dialog.tsx` - Budget creation dialog
- `components/budget-progress.tsx` - Progress visualization

### ✅ Month Selector Feature (4 tasks)
- **MonthSelector Component** - Navigation with prev/next buttons and "Today" quick jump
  - Displays current month in "October 2025" format
  - Calendar icon with amber styling
- **State Management** - Added `selectedMonth` state to main page (defaults to current month)
- **Dynamic Data Fetching** - All API calls now filtered by selected month
  - Calculates start date (1st of month) and end date (last day of month)
  - Passes `startDate` and `endDate` to `/api/expenses` and `/api/stats`
  - Passes month to `/api/budgets`
- **UI Integration** - Month selector in header between title and action buttons
- **Auto-Refetch** - useEffect dependency on `selectedMonth` triggers data reload

**Impact:** All metrics cards, budget progress, charts, and expense list now dynamically filter by selected month.

**Key Files:**
- `components/month-selector.tsx` - Month navigation component
- `app/page.tsx` - State management and API integration (lines 56-110)

### ✅ Recurring Expenses Foundation (2 tasks)
- **RecurringExpense Model** - Added to Prisma schema
  - Fields: amount, category, description, frequency, dayOfMonth, dayOfWeek, monthOfYear
  - `nextDate` field tracks when to create next expense
  - `isActive` flag to enable/disable
  - Supports monthly, weekly, yearly frequencies
- **Database Migration** - `20251009221425_add_recurring_expense`
- **API Routes** - Full CRUD at `/api/recurring-expenses` and `/api/recurring-expenses/[id]`
  - GET with userId filtering
  - POST with automatic `nextDate` calculation based on frequency
  - PUT and DELETE operations

**Key Files:**
- `prisma/schema.prisma` - RecurringExpense model
- `app/api/recurring-expenses/route.ts` - List and create with date calculation
- `app/api/recurring-expenses/[id]/route.ts` - Update and delete

## In Progress (1 task)

### 🔄 Phase 2: Recurring Expenses System
- [x] Database schema
- [x] API routes
- [ ] Auto-generation logic
- [ ] Management dialog UI
- [ ] Visual indicators on expense list

## Pending Features (18 tasks)

### 📋 Phase 3: Enhanced Filtering & Search
- Update `/api/expenses` with robust query params (date range, multi-category, multi-user)
- Build filter panel component with date pickers, category multi-select, user multi-select
- Add filter state to main page
- Visual feedback (active filter badges, clear all button)

### 📋 Phase 4: Receipt Upload System
- Add local file storage (public/uploads directory)
- Add `receiptUrl` field to Expense model + migration
- Create upload endpoint with file validation
- Image upload in expense form
- Thumbnail preview and lightbox viewer

### 📋 Phase 5: Debt Tracking (Shared Expense Settlement)
- Calculate who owes whom based on shared expenses
- Create `/api/settlements` route
- Debt summary card component
- Add Settlement model for payment tracking

### 📋 Phase 6: Mobile Responsive Design
- Convert grid layouts to responsive flex/grid
- Collapse charts on mobile, hamburger menu
- Larger tap targets, swipe actions
- Test on various screen sizes

## Technical Details

### Database Schema Changes
```prisma
// Budget model
model Budget {
  id        String   @id @default(cuid())
  category  String
  amount    Float
  month     String   // Format: "YYYY-MM"
  userId    String?  // null = shared budget
  @@unique([category, month, userId])
}

// RecurringExpense model
model RecurringExpense {
  id          String   @id @default(cuid())
  amount      Float
  category    String
  description String
  frequency   String   // "monthly", "weekly", "yearly"
  dayOfMonth  Int?     // 1-31
  dayOfWeek   Int?     // 0-6 (0=Sunday)
  monthOfYear Int?     // 1-12
  isShared    Boolean  @default(false)
  userId      String
  nextDate    DateTime
  isActive    Boolean  @default(true)
}
```

### API Endpoints Added
- `GET/POST /api/budgets`
- `PUT/DELETE /api/budgets/[id]`
- `GET/POST /api/recurring-expenses`
- `PUT/DELETE /api/recurring-expenses/[id]`

### Styling Conventions
- **Amber theme** - All dialogs use `bg-white border-2 border-amber-300 text-amber-900`
- **Gradient buttons** - `bg-gradient-to-r from-amber-600 to-orange-600`
- **Consistent dropdowns** - SelectTrigger and SelectContent share styling across all dialogs

## Git Commits

1. `feat: add user management and CSV export functionality` (8dc34ce)
2. `feat: add budget tracking system with progress visualization` (5110dc3)
3. `feat: add month selector for dynamic data filtering` (b3e726c)
4. `feat: add RecurringExpense database schema` (a91e611)

## Next Steps

1. **Implement auto-generation logic** - Check `nextDate` on page load, create expenses, update `nextDate`
2. **Build recurring expenses UI** - Management dialog to add/edit/delete recurring expenses
3. **Complete Phase 2** - Visual indicators on expense list (🔁 icon)
4. **Commit progress** - Save recurring expenses feature
5. **Move to Phase 3** - Enhanced filtering system

## Known Issues / TODOs

- None currently - all implemented features are working

## Development Notes

- Server running on port 3003 (port 3000 was in use)
- Using Turbopack for fast hot reloading
- All API routes follow Next.js 15 App Router conventions
- Database: SQLite via Prisma
- Styling: Tailwind CSS v4 with `@theme` directive syntax
