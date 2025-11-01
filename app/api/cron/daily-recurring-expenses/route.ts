import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// This endpoint is called by Vercel Cron daily at midnight UTC
// to automatically generate recurring expenses that are due
export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel Cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()
    const isFirstDayOfMonth = now.getDate() === 1
    const createdExpenses = []

    // On first day of month, generate the 2nd month ahead for all recurring expenses
    if (isFirstDayOfMonth) {
      console.log('[Cron] First day of month - sliding 2-month window forward')

      const activeRecurringExpenses = await prisma.recurringExpense.findMany({
        where: { isActive: true },
        include: { user: true },
      })

      // For each active recurring expense, generate the 2nd month ahead
      for (const recurring of activeRecurringExpenses) {
        // Calculate date 2 months from now
        const twoMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 2)

        if (recurring.frequency === 'monthly') {
          // Handle -1 as "last day of month" for the target month
          let day: number
          if (recurring.dayOfMonth === -1) {
            day = new Date(twoMonthsAhead.getFullYear(), twoMonthsAhead.getMonth() + 1, 0).getDate()
          } else {
            // Cap day at last valid day of month to prevent overflow (e.g., Jan 31 → Feb 28)
            const lastDayOfMonth = new Date(twoMonthsAhead.getFullYear(), twoMonthsAhead.getMonth() + 1, 0).getDate()
            day = Math.min(recurring.dayOfMonth || 1, lastDayOfMonth)
          }
          const expenseDate = new Date(twoMonthsAhead.getFullYear(), twoMonthsAhead.getMonth(), day)

          // Check if expense already exists for this month (deduplication)
          const monthStart = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1)
          const monthEnd = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0)

          const existing = await prisma.expense.findFirst({
            where: {
              recurringExpenseId: recurring.id,
              date: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
          })

          if (!existing) {
            const expense = await prisma.expense.create({
              data: {
                amount: recurring.amount,
                category: recurring.category,
                description: recurring.description,
                date: expenseDate,
                isShared: recurring.isShared,
                userId: recurring.userId,
                recurringExpenseId: recurring.id,
              },
              include: { user: true },
            })
            createdExpenses.push(expense)
          }
        } else if (recurring.frequency === 'yearly') {
          // For yearly, only create if within 3-month window
          const month = recurring.monthOfYear || 1
          const day = recurring.dayOfMonth || 1
          const yearlyDate = new Date(now.getFullYear(), month - 1, day)

          // Check if this yearly expense falls within the 3rd month ahead
          const threeMonthsEnd = new Date(now.getFullYear(), now.getMonth() + 4, 0)
          if (yearlyDate < now || yearlyDate > threeMonthsEnd) {
            continue // Skip if not in the 3-month window
          }

          // Check if expense already exists for this month (deduplication)
          const monthStart = new Date(yearlyDate.getFullYear(), yearlyDate.getMonth(), 1)
          const monthEnd = new Date(yearlyDate.getFullYear(), yearlyDate.getMonth() + 1, 0)

          const existing = await prisma.expense.findFirst({
            where: {
              recurringExpenseId: recurring.id,
              date: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
          })

          if (!existing) {
            const expense = await prisma.expense.create({
              data: {
                amount: recurring.amount,
                category: recurring.category,
                description: recurring.description,
                date: yearlyDate,
                isShared: recurring.isShared,
                userId: recurring.userId,
                recurringExpenseId: recurring.id,
              },
              include: { user: true },
            })
            createdExpenses.push(expense)
          }
        }
      }
    }

    console.log(`[Cron] Generated ${createdExpenses.length} recurring expenses for 2nd month ahead`)

    return NextResponse.json({
      success: true,
      generated: createdExpenses.length,
      expenses: createdExpenses,
    })
  } catch (error) {
    // Secure error logging
    console.error('[Cron] Failed to generate recurring expenses:', error)

    return NextResponse.json(
      { error: 'Failed to generate recurring expenses' },
      { status: 500 }
    )
  }
}
