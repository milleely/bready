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
    let createdCount = 0

    // On first day of month, generate the 2nd month ahead for all recurring expenses
    if (isFirstDayOfMonth) {
      console.log('[Cron] First day of month - sliding 2-month window forward')

      // Calculate the target month (2 months ahead)
      const twoMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 2)
      const targetMonthStart = new Date(twoMonthsAhead.getFullYear(), twoMonthsAhead.getMonth(), 1)
      const targetMonthEnd = new Date(twoMonthsAhead.getFullYear(), twoMonthsAhead.getMonth() + 1, 0)

      // Also calculate 3-month window for yearly expenses
      const threeMonthsEnd = new Date(now.getFullYear(), now.getMonth() + 4, 0)

      // BATCH QUERY 1: Fetch all active recurring expenses
      const activeRecurringExpenses = await prisma.recurringExpense.findMany({
        where: { isActive: true },
      })

      if (activeRecurringExpenses.length === 0) {
        console.log('[Cron] No active recurring expenses found')
        return NextResponse.json({ success: true, generated: 0, expenses: [] })
      }

      // BATCH QUERY 2: Fetch ALL existing expenses for these recurring IDs in the target date range
      const recurringIds = activeRecurringExpenses.map(r => r.id)
      const existingExpenses = await prisma.expense.findMany({
        where: {
          recurringExpenseId: { in: recurringIds },
          date: { gte: targetMonthStart, lte: threeMonthsEnd },
        },
        select: { recurringExpenseId: true, date: true },
      })

      // Build a Set for O(1) duplicate checking: "recurringId-YYYY-MM"
      const existingKeys = new Set(
        existingExpenses.map(e => {
          const month = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`
          return `${e.recurringExpenseId}-${month}`
        })
      )

      // Prepare batch of expenses to create
      const expensesToCreate: {
        amount: number
        category: string
        description: string
        date: Date
        isShared: boolean
        userId: string
        recurringExpenseId: string
      }[] = []

      for (const recurring of activeRecurringExpenses) {
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
          const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`
          const dedupKey = `${recurring.id}-${monthKey}`

          // Check for duplicates using Set (O(1) instead of DB query)
          if (!existingKeys.has(dedupKey)) {
            expensesToCreate.push({
              amount: recurring.amount,
              category: recurring.category,
              description: recurring.description,
              date: expenseDate,
              isShared: recurring.isShared,
              userId: recurring.userId,
              recurringExpenseId: recurring.id,
            })
          }
        } else if (recurring.frequency === 'yearly') {
          // For yearly, only create if within 3-month window
          const month = recurring.monthOfYear || 1
          const day = recurring.dayOfMonth || 1
          const yearlyDate = new Date(now.getFullYear(), month - 1, day)

          // Skip if not in the 3-month window
          if (yearlyDate < now || yearlyDate > threeMonthsEnd) {
            continue
          }

          const monthKey = `${yearlyDate.getFullYear()}-${String(yearlyDate.getMonth() + 1).padStart(2, '0')}`
          const dedupKey = `${recurring.id}-${monthKey}`

          // Check for duplicates using Set (O(1) instead of DB query)
          if (!existingKeys.has(dedupKey)) {
            expensesToCreate.push({
              amount: recurring.amount,
              category: recurring.category,
              description: recurring.description,
              date: yearlyDate,
              isShared: recurring.isShared,
              userId: recurring.userId,
              recurringExpenseId: recurring.id,
            })
          }
        }
      }

      // BATCH QUERY 3: Create all expenses in one operation
      if (expensesToCreate.length > 0) {
        const result = await prisma.expense.createMany({
          data: expensesToCreate,
        })
        createdCount = result.count
      }
    }

    console.log(`[Cron] Generated ${createdCount} recurring expenses for 2nd month ahead`)

    return NextResponse.json({
      success: true,
      generated: createdCount,
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
