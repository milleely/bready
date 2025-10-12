# Budget Data Isolation Bug - Fix Plan

## Status: 🔴 CRITICAL BUG - Immediate Fix Required

## Root Cause Identified ✅

**The Problem:**
The `Budget` model is missing a `householdId` field. This causes shared budgets (`userId: null`) to be visible across ALL households instead of being scoped to individual households.

**Detailed Analysis:** See `tasks/bug-analysis-budget-isolation.md`

---

## Implementation Plan

### Phase 1: Update Database Schema
- [ ] Add `householdId` field to Budget model in `prisma/schema.prisma`
- [ ] Add foreign key relationship to Household
- [ ] Update unique constraint to include householdId
- [ ] Add index on householdId for query performance

**Files to modify:**
- `prisma/schema.prisma`

**Changes:**
```prisma
model Budget {
  id          String    @id @default(cuid())
  category    String
  amount      Float
  month       String    // Format: "YYYY-MM"
  userId      String?   // Optional: null means shared budget for all users in household
  householdId String    // NEW: Link to household for proper isolation
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([category, month, userId, householdId])  // Updated constraint
  @@index([month])
  @@index([userId])
  @@index([householdId])  // NEW: For efficient household queries
}
```

### Phase 2: Create and Run Migration
- [ ] Generate Prisma migration: `npx prisma migrate dev --name add-household-to-budgets`
- [ ] Review migration SQL
- [ ] Run migration locally
- [ ] Verify schema changes in database

**Note:** This will reset any existing budget data (acceptable since app is in development)

### Phase 3: Update API Routes

#### A. Update GET /api/budgets
- [ ] Add householdId to where clause
- [ ] Remove the OR condition (householdId filter is sufficient)

**File:** `app/api/budgets/route.ts`

**Current (BROKEN):**
```typescript
const where: any = {
  OR: [
    { userId: null },
    { userId: { in: householdUserIds } },
  ],
}
```

**Fixed:**
```typescript
const where: Prisma.BudgetWhereInput = {
  householdId,  // Scope all budgets to household
}
```

#### B. Update POST /api/budgets
- [ ] Include householdId when creating budget
- [ ] Remove unnecessary user validation (householdId filter handles this)

**File:** `app/api/budgets/route.ts`

**Add to budget creation:**
```typescript
const budget = await prisma.budget.create({
  data: {
    category,
    amount: validateAmount(amount),
    month,
    userId: userId || null,
    householdId,  // NEW: Add householdId
  },
})
```

#### C. Update PUT /api/budgets/[id]
- [ ] Add householdId verification in update

**File:** `app/api/budgets/[id]/route.ts`

**Add household verification:**
```typescript
const budget = await prisma.budget.findUnique({
  where: { id },
})

if (!budget || budget.householdId !== householdId) {
  return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
}
```

#### D. Update DELETE /api/budgets/[id]
- [ ] Add householdId verification in delete

**File:** `app/api/budgets/[id]/route.ts`

**Same verification as PUT**

### Phase 4: Update Schema Relationship
- [ ] Add budgets relation to Household model

**File:** `prisma/schema.prisma`

**Add to Household model:**
```prisma
model Household {
  id                String             @id @default(cuid())
  clerkId           String             @unique
  name              String
  users             User[]
  budgets           Budget[]           // NEW: Add budgets relation
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}
```

### Phase 5: Testing
- [ ] Test budget creation in Household A
- [ ] Test budget creation in Household B
- [ ] Verify Household A cannot see Household B's budgets
- [ ] Test shared budgets (userId: null) within household
- [ ] Test user-specific budgets
- [ ] Test budget update and delete
- [ ] Test unique constraint (category + month + userId + householdId)

### Phase 6: Verify Similar Issues Don't Exist
- [ ] Check Expenses model - verify household isolation
- [ ] Check RecurringExpenses model - verify household isolation
- [ ] Check Settlements model - verify household isolation
- [ ] Document isolation strategy for each model

---

## Simplified Implementation Steps

**Step 1: Update Schema**
1. Modify `prisma/schema.prisma` - Add householdId to Budget
2. Add budgets relation to Household

**Step 2: Create Migration**
1. Run: `npx prisma migrate dev --name add-household-to-budgets`
2. Confirm migration

**Step 3: Update GET /api/budgets**
1. Simplify where clause to just filter by householdId
2. Remove complex OR logic (no longer needed)

**Step 4: Update POST /api/budgets**
1. Add householdId to budget creation
2. Simplify validation logic

**Step 5: Update PUT & DELETE /api/budgets/[id]**
1. Add householdId verification
2. Return 404 if household doesn't match

**Step 6: Test Everything**
1. Create budgets in different households
2. Verify complete isolation

---

## Expected Outcome

### Before Fix:
- ❌ Shared budgets visible across all households
- ❌ User can see friend's budgets
- ❌ Data privacy violation

### After Fix:
- ✅ Budgets completely isolated by household
- ✅ Shared budgets (userId: null) only visible within household
- ✅ User-specific budgets only visible to that user's household
- ✅ Proper data privacy and GDPR compliance

---

## Impact Assessment

**Code Changes:**
- 1 schema file (`prisma/schema.prisma`)
- 3 API route files (`app/api/budgets/*.ts`)
- 1 migration file (auto-generated)

**Database Changes:**
- Add householdId column to Budget table
- Add foreign key constraint
- Update unique constraint
- Add index on householdId

**Breaking Changes:**
- ✅ None for users (transparent fix)
- ⚠️ Existing budget data will need householdId backfill (acceptable in dev)

**Risk Level:** LOW
- Schema change is additive (non-breaking)
- API changes are minimal and localized
- No frontend changes required

---

## Ready to Implement?

**All changes follow the simplicity principle:**
- ✅ Minimal code changes
- ✅ Focused on one issue
- ✅ No unnecessary refactoring
- ✅ Clear and straightforward fix

**Waiting for approval to proceed with implementation.**
