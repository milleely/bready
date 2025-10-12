# Budget Data Isolation Bug - Root Cause Analysis

## Date: 2025-10-12
## Severity: CRITICAL - Data Privacy Violation

## Problem Statement
Budgets created in one user's household are visible in another user's household. This is a serious data isolation bug causing cross-account data leakage.

## Root Cause

### The Bug
The `Budget` model in `prisma/schema.prisma` is missing a `householdId` field.

**Current Schema (BROKEN):**
```prisma
model Budget {
  id        String   @id @default(cuid())
  category  String
  amount    Float
  month     String   // Format: "YYYY-MM"
  userId    String?  // Optional: null means shared budget for all users
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([category, month, userId])
  @@index([month])
  @@index([userId])
}
```

### Why This Causes the Bug

**In `/app/api/budgets/route.ts` (lines 24-29):**
```typescript
const where: any = {
  OR: [
    { userId: null },                        // 🔴 MATCHES ALL SHARED BUDGETS GLOBALLY!
    { userId: { in: householdUserIds } },   // Matches user-specific budgets in household
  ],
}
```

**The Problem:**
- When a budget has `userId: null`, it's meant to be a "shared budget for all users in a household"
- But there's NO household filter in the query!
- Result: `{ userId: null }` matches EVERY shared budget across ALL households

**Scenario:**
1. User A (Household 1) creates shared budget: Groceries $1,000, userId=null
2. User B (Household 2) creates shared budget: Dining Out $300, userId=null
3. User A queries budgets → Gets BOTH Groceries AND Dining Out (because both have userId=null)
4. User B queries budgets → Gets BOTH budgets too!

## Code Flow Trace

### 1. Authentication
```
User signs in → Clerk provides clerkId
→ getHouseholdId() in auth.ts
→ getOrCreateHousehold(clerkId)
→ Returns household.id
```

### 2. Budget Query (GET /api/budgets)
```
1. Gets householdId for current user (line 10)
2. Fetches all user IDs in that household (lines 18-22)
3. Queries budgets with:
   - userId: null (shared budgets) ← BUG: No household filter!
   - OR userId in householdUserIds
```

### 3. Budget Creation (POST /api/budgets)
```
1. Gets householdId (line 58) ← ✅ Has household context
2. Validates userId belongs to household (lines 72-82) ← ✅ Good validation
3. Creates budget without householdId (lines 84-91) ← 🔴 Missing householdId!
```

## Impact

**Severity: CRITICAL**
- ✅ User-specific budgets (userId set) are NOT leaked (correct filtering)
- 🔴 Shared budgets (userId=null) ARE leaked across all households
- 🔴 Any user can see all shared budgets from all households
- 🔴 Financial data privacy violation
- 🔴 GDPR compliance issue (cross-account data access)

## The Fix

### Required Changes:

**1. Update Prisma Schema** (Add householdId to Budget)
**2. Create Migration** (Database schema change)
**3. Update API Routes** (Filter by householdId)
**4. Update Unique Constraint** (Include householdId)

## Implementation Plan

### Phase 1: Schema Update
1. Add `householdId` field to Budget model
2. Add foreign key relationship to Household
3. Update unique constraint: `@@unique([category, month, userId, householdId])`
4. Add index on householdId

### Phase 2: Migration
1. Create migration to add householdId column
2. Backfill existing budgets with householdId (if any exist)
3. Run migration in development and production

### Phase 3: API Updates
1. Update GET /api/budgets - Add householdId to where clause
2. Update POST /api/budgets - Include householdId in creation
3. Update PUT /api/budgets/[id] - Verify householdId matches

### Phase 4: Testing
1. Test budget isolation between households
2. Test shared budgets within household
3. Test user-specific budgets
4. Verify unique constraint works correctly

## Similar Issues to Check

This bug pattern might exist in other features:
- ✅ **Expenses**: Has userId → User → householdId (indirect, need to verify)
- ✅ **RecurringExpenses**: Has userId → User → householdId (indirect, need to verify)
- ❓ **Settlements**: Has fromUserId and toUserId but no householdId (potential issue?)

Need to audit all models for proper household isolation.

## Estimated Effort

- Schema changes: 10 minutes
- Migration creation and testing: 15 minutes
- API route updates: 15 minutes
- Testing and verification: 20 minutes
- **Total: ~1 hour**

## Priority

**IMMEDIATE - Stop production use until fixed!**

This is a data privacy violation. If the app is in production, users can see each other's financial data.
