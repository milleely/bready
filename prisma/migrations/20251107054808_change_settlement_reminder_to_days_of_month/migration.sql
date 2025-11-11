-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "budgetAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "budgetAlertThresholds" TEXT NOT NULL DEFAULT '75,90,100',
    "settlementRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "settlementReminderDays" TEXT NOT NULL DEFAULT 'first,last',
    "recurringRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "recurringReminderDays" INTEGER NOT NULL DEFAULT 3,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NotificationPreference" ("budgetAlertThresholds", "budgetAlertsEnabled", "createdAt", "emailEnabled", "id", "recurringReminderDays", "recurringRemindersEnabled", "settlementReminderDays", "settlementRemindersEnabled", "updatedAt", "userId") SELECT "budgetAlertThresholds", "budgetAlertsEnabled", "createdAt", "emailEnabled", "id", "recurringReminderDays", "recurringRemindersEnabled", "settlementReminderDays", "settlementRemindersEnabled", "updatedAt", "userId" FROM "NotificationPreference";
DROP TABLE "NotificationPreference";
ALTER TABLE "new_NotificationPreference" RENAME TO "NotificationPreference";
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
