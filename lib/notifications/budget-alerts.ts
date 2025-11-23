/**
 * Budget Alert Trigger System
 *
 * Automatically sends email alerts when users cross budget spending thresholds.
 * Integrates with expense creation to provide real-time budget notifications.
 *
 * Features:
 * - Threshold detection (75%, 90%, 100%)
 * - De-duplication (only alert on NEW threshold crossings)
 * - Personal + household budget support
 * - Non-blocking (never fails expense creation)
 */

import { prisma } from "@/lib/db"
import { sendNotification } from "@/lib/email/send-notification"
import BudgetAlertEmail from "@/lib/email/templates/budget-alert"
import type { Expense } from "@prisma/client"

/**
 * Check if a newly created expense crosses any budget thresholds
 * and send email alerts accordingly.
 *
 * @param expense - The expense that was just created
 * @returns Promise<void> - Always resolves (errors are logged, not thrown)
 */
export async function checkBudgetThreshold(expense: Expense): Promise<void> {
  try {
    // Extract month from expense date (format: "YYYY-MM") - needed for multiple queries
    const expenseDate = new Date(expense.date)
    const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`

    // 🚀 PERFORMANCE: Run independent queries in parallel
    // User + Preferences + Previous Expenses all only need expense.userId
    const [user, preferences, previousExpenses] = await Promise.all([
      // Query 1: Get user information (name, email, householdId)
      prisma.user.findUnique({
        where: { id: expense.userId },
        select: {
          id: true,
          name: true,
          email: true,
          householdId: true,
        },
      }),
      // Query 2: Get notification preferences
      prisma.notificationPreference.findUnique({
        where: { userId: expense.userId },
      }),
      // Query 3: Calculate spending BEFORE this expense (previous spending)
      prisma.expense.findMany({
        where: {
          userId: expense.userId,
          category: expense.category,
          date: {
            gte: new Date(`${month}-01`),
            lt: new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 1),
          },
          id: {
            not: expense.id, // Exclude the current expense
          },
        },
        select: {
          amount: true,
          isShared: true,
        },
      }),
    ])

    // Early exit checks (after parallel queries complete)
    if (!user) {
      console.log('[Budget Alert] User not found:', expense.userId)
      return
    }

    if (!user.email) {
      console.log('[Budget Alert] User has no email address:', user.name)
      return
    }

    // Check if alerts are enabled
    if (!preferences?.budgetAlertsEnabled || !preferences?.emailEnabled) {
      console.log('[Budget Alert] Notifications disabled for user:', user.name)
      return
    }

    // Parse threshold preferences (CSV string → number array)
    const thresholds = preferences.budgetAlertThresholds
      .split(',')
      .map(t => parseInt(t.trim()))
      .filter(t => !isNaN(t) && t > 0 && t <= 100)
      .sort((a, b) => a - b) // Sort ascending: [75, 90, 100]

    if (thresholds.length === 0) {
      console.log('[Budget Alert] No valid thresholds configured for user:', user.name)
      return
    }

    // Query 4: Find relevant budget(s) - needs householdId from user query
    // Priority: Personal budget (userId set) → Household budget (userId = null)
    const budgets = await prisma.budget.findMany({
      where: {
        householdId: user.householdId,
        category: expense.category,
        month: month,
        OR: [
          { userId: user.id },      // Personal budget
          { userId: null },         // Household budget
        ],
      },
      orderBy: {
        userId: 'desc', // Personal budgets first (non-null values sort before null)
      },
    })

    if (budgets.length === 0) {
      console.log('[Budget Alert] No budget found for category:', expense.category, 'month:', month)
      return
    }

    // Use the first budget (personal if exists, otherwise household)
    const budget = budgets[0]
    const budgetLimit = budget.amount
    const budgetName = expense.category

    const previousSpent = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const previousPercent = (previousSpent / budgetLimit) * 100

    // Step 7: Calculate spending AFTER this expense (current spending)
    const currentSpent = previousSpent + expense.amount
    const currentPercent = (currentSpent / budgetLimit) * 100

    console.log('[Budget Alert] Threshold check:', {
      user: user.name,
      category: expense.category,
      month,
      previousSpent: `$${previousSpent.toFixed(2)} (${previousPercent.toFixed(1)}%)`,
      currentSpent: `$${currentSpent.toFixed(2)} (${currentPercent.toFixed(1)}%)`,
      budgetLimit: `$${budgetLimit.toFixed(2)}`,
      thresholds,
    })

    // Step 8: Determine which thresholds were NEWLY crossed
    const crossedThresholds = thresholds.filter(threshold => {
      const wasBelow = previousPercent < threshold
      const isNowAbove = currentPercent >= threshold
      return wasBelow && isNowAbove
    })

    if (crossedThresholds.length === 0) {
      console.log('[Budget Alert] No new thresholds crossed')
      return
    }

    // Step 9: Send email alerts for each crossed threshold
    for (const threshold of crossedThresholds) {
      console.log(`[Budget Alert] Sending ${threshold}% alert to ${user.email}`)

      const result = await sendNotification({
        to: user.email,
        subject: `Budget Alert: ${budgetName} (${threshold}%)`,
        react: BudgetAlertEmail({
          userName: user.name,
          budgetName: budgetName,
          percentSpent: Math.round(currentPercent),
          amountSpent: currentSpent,
          budgetLimit: budgetLimit,
          threshold: threshold,
        }),
      })

      if (result.success) {
        console.log(`[Budget Alert] ✅ Email sent successfully (${threshold}% threshold)`)
      } else {
        console.error(`[Budget Alert] ❌ Email send failed (${threshold}% threshold):`, result.error)
      }
    }

  } catch (error) {
    // CRITICAL: Do NOT throw errors - expense creation has already succeeded
    // Budget alerts are a "nice-to-have" feature that shouldn't break core functionality
    console.error('[Budget Alert] Error in checkBudgetThreshold:', error)
    console.error('[Budget Alert] Stack trace:', error instanceof Error ? error.stack : 'N/A')
  }
}
