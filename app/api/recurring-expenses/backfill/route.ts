import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'

/**
 * POST /api/recurring-expenses/backfill
 *
 * Generate missing recurring expenses for a specific month.
 * This is useful when recurring expenses were created before the
 * automatic 2-month generation feature was added.
 *
 * Body: { targetMonth: "YYYY-MM" }
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await request.json()
    const { targetMonth } = body

    // Validate targetMonth format
    if (!targetMonth || !/^\d{4}-\d{2}$/.test(targetMonth)) {
      return NextResponse.json(
        { error: 'Missing or invalid targetMonth. Use YYYY-MM format.' },
        { status: 400 }
      )
    }

    const [year, month] = targetMonth.split('-').map(Number)
    const targetMonthStart = new Date(year, month - 1, 1)
    const targetMonthEnd = new Date(year, month, 0) // Last day of target month

    // Fetch all active recurring expenses for this household
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        user: { householdId },
      },
      include: { user: true },
    })

    if (recurringExpenses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active recurring expenses found',
        generated: 0,
        expenses: [],
      })
    }

    // Get existing expenses for these recurring IDs in the target month
    const recurringIds = recurringExpenses.map(r => r.id)
    const existingExpenses = await prisma.expense.findMany({
      where: {
        recurringExpenseId: { in: recurringIds },
        date: { gte: targetMonthStart, lte: targetMonthEnd },
      },
      select: { recurringExpenseId: true },
    })

    // Build a Set of recurring IDs that already have expenses this month
    const existingRecurringIds = new Set(existingExpenses.map(e => e.recurringExpenseId))

    // Generate missing expenses
    const createdExpenses = []

    for (const recurring of recurringExpenses) {
      // Skip if expense already exists for this month
      if (existingRecurringIds.has(recurring.id)) {
        continue
      }

      // Only process monthly recurring expenses (yearly handled differently)
      if (recurring.frequency === 'monthly') {
        // Calculate expense date for target month
        let day: number
        if (recurring.dayOfMonth === -1) {
          // Last day of month
          day = targetMonthEnd.getDate()
        } else {
          // Cap day at last valid day of month (e.g., Jan 31 → Feb 28)
          day = Math.min(recurring.dayOfMonth || 1, targetMonthEnd.getDate())
        }

        const expenseDate = new Date(year, month - 1, day)

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
      } else if (recurring.frequency === 'yearly') {
        // For yearly, only create if target month matches the recurring month
        const recurringMonth = recurring.monthOfYear || 1
        if (recurringMonth === month) {
          const day = recurring.dayOfMonth || 1
          const expenseDate = new Date(year, month - 1, day)

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
      }
    }

    return NextResponse.json({
      success: true,
      targetMonth,
      generated: createdExpenses.length,
      skipped: recurringExpenses.length - createdExpenses.length,
      expenses: createdExpenses.map(e => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        date: e.date,
      })),
    })
  } catch (error) {
    console.error('Failed to backfill recurring expenses:', error)

    return NextResponse.json(
      { error: 'Failed to backfill recurring expenses' },
      { status: 500 }
    )
  }
}
