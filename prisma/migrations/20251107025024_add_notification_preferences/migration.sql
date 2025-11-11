/*
  Warnings:

  - Added the required column `householdId` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "receiptUrl" TEXT;

-- CreateTable
CREATE TABLE "UserPin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IncomeSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Liability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "interestRate" REAL,
    "minimumPayment" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MonthlyExpenseOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "useOverride" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "budgetAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "budgetAlertThresholds" TEXT NOT NULL DEFAULT '75,90,100',
    "settlementRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "settlementReminderDays" INTEGER NOT NULL DEFAULT 7,
    "recurringRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "recurringReminderDays" INTEGER NOT NULL DEFAULT 3,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "month" TEXT NOT NULL,
    "userId" TEXT,
    "householdId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Budget_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Budget" ("amount", "category", "createdAt", "id", "month", "updatedAt", "userId") SELECT "amount", "category", "createdAt", "id", "month", "updatedAt", "userId" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
CREATE INDEX "Budget_month_idx" ON "Budget"("month");
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");
CREATE INDEX "Budget_householdId_idx" ON "Budget"("householdId");
CREATE UNIQUE INDEX "Budget_category_month_userId_householdId_key" ON "Budget"("category", "month", "userId", "householdId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserPin_userId_key" ON "UserPin"("userId");

-- CreateIndex
CREATE INDEX "UserPin_userId_idx" ON "UserPin"("userId");

-- CreateIndex
CREATE INDEX "IncomeSource_userId_idx" ON "IncomeSource"("userId");

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- CreateIndex
CREATE INDEX "Liability_userId_idx" ON "Liability"("userId");

-- CreateIndex
CREATE INDEX "Liability_category_idx" ON "Liability"("category");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyExpenseOverride_userId_key" ON "MonthlyExpenseOverride"("userId");

-- CreateIndex
CREATE INDEX "MonthlyExpenseOverride_userId_idx" ON "MonthlyExpenseOverride"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "Expense_userId_date_isShared_category_idx" ON "Expense"("userId", "date", "isShared", "category");

-- CreateIndex
CREATE INDEX "Expense_isShared_date_category_idx" ON "Expense"("isShared", "date", "category");

-- CreateIndex
CREATE INDEX "Expense_isShared_idx" ON "Expense"("isShared");

-- CreateIndex
CREATE INDEX "Settlement_month_fromUserId_idx" ON "Settlement"("month", "fromUserId");

-- CreateIndex
CREATE INDEX "Settlement_month_toUserId_idx" ON "Settlement"("month", "toUserId");
