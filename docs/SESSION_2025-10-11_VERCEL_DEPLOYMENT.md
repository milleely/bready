# Vercel Deployment Session - October 11, 2025

## Session Overview
Working through Vercel deployment issues for Bready expense tracker. Multiple TypeScript compilation errors encountered and resolved.

## Initial Setup
- **Vercel Account:** Created
- **GitHub Repository:** https://github.com/milleely/bready
- **Clerk Authentication:** Production instance created with domain `bready.com` (to be updated)
- **Environment Variables:** All Clerk keys configured in Vercel

## Issues Encountered & Fixed

### Issue 1: Next.js 15 Route Params Type Error
**Error:** `Type "{ params: { id: string; }; }" is not a valid type`

**Root Cause:** Next.js 15 requires params to be `Promise<{ id: string }>` instead of `{ id: string }`

**Files Fixed:**
- `app/api/budgets/[id]/route.ts`
- `app/api/recurring-expenses/[id]/route.ts`

**Commit:** `4cb1792` - "fix: update route params for Next.js 15 compatibility"

### Issue 2: CSV Export Nullable Email
**Error:** `Type 'string | null' is not assignable to type 'string'` in CSV export

**Root Cause:** Database schema allows nullable emails but CSV utility expected non-nullable

**File Fixed:**
- `lib/csv-utils.ts` - Changed `email: string` to `email: string | null`

**Commit:** `cbea888` - "fix: handle nullable email in CSV export"

### Issue 3: Page Component User Type
**Error:** `Type 'Expense' is not assignable to type 'SetStateAction<Expense | undefined>'`

**Root Cause:** User interface in page.tsx had `email: string` but database returns nullable

**File Fixed:**
- `app/page.tsx` - Changed User interface `email: string` to `email: string | null`

**Commit:** `38c46ec` - "fix: make User.email nullable in page.tsx to match schema"

### Issue 4: Duplicate User Type Definitions (CURRENT)
**Error:** `Type 'User[]' is not assignable to type 'User[]'. Two different types with this name exist`

**Root Cause:** Multiple components have their own User interface definitions with `email: string` (non-nullable) conflicting with page.tsx's nullable version

**Components with Non-Nullable Email:**
1. `components/budget-dialog.tsx` - Line 29
2. `components/enhanced-recent-expenses.tsx` - Line 10
3. `components/expense-data-table.tsx` - Line 43
4. `components/recent-expenses.tsx` - Line 14
5. `components/user-form.tsx` - Line 14
6. `components/user-management.tsx` - Line 12

## Database Schema Reference
```prisma
model User {
  id         String    @id @default(cuid())
  email      String?   // <- Nullable in database
  name       String
  color      String
  // ... other fields
}
```

## Why Email is Nullable
- Household members don't all need separate Clerk logins
- Only the household owner needs an email/login
- Other members are created within the app without emails
- This allows families to track expenses without requiring everyone to have accounts

## Current Status
- ❌ Build failing due to type conflicts
- Need to update all 6 components to use `email: string | null`
- After fix, should successfully deploy

## Next Steps After Successful Build
1. **Add Postgres Database**
   - Storage → Create Database → Postgres
   - Name: `bready-db`

2. **Update Build Command**
   - Settings → Build & Development Settings
   - Change from `npm run build` to `npm run vercel-build`

3. **Update Clerk Domain**
   - Clerk Dashboard → Settings → Domains
   - Replace `bready.com` with actual Vercel URL

4. **Final Redeploy**
   - Deployments → Redeploy
   - This runs migrations and connects database

## Lessons Learned
1. **Type Consistency is Critical** - All layers (DB → API → Components) must agree on types
2. **Next.js 15 Breaking Changes** - Route params are now async/Promise-based
3. **Duplicate Type Definitions** - Should use a shared types file instead of defining User in each component
4. **Build Errors Are Sequential** - Fixing one error often reveals the next one

## Future Improvements
- Create a shared `types/index.ts` file for common interfaces
- Use Prisma-generated types directly instead of manual interfaces
- Add type checking to CI/CD pipeline before deployment