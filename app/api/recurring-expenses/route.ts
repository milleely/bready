import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import { validateAmount } from '@/lib/utils'

// GET /api/recurring-expenses?userId=xxx
export async function GET(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where: any = {
      user: { householdId }, // Only return recurring expenses from user's household
    }
    if (userId) where.userId = userId

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(recurringExpenses)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch recurring expenses:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to fetch recurring expenses' },
      { status: 500 }
    )
  }
}

// POST /api/recurring-expenses
export async function POST(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await request.json()
    const {
      amount,
      category,
      description,
      frequency,
      dayOfMonth,
      dayOfWeek,
      monthOfYear,
      isShared,
      userId,
    } = body

    if (!amount || !category || !description || !frequency || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the userId belongs to household
    const user = await prisma.user.findFirst({
      where: { id: userId, householdId },
    })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in your household' },
        { status: 403 }
      )
    }

    // Calculate the next date based on frequency
    const now = new Date()
    let nextDate = new Date()

    if (frequency === 'monthly') {
      // Handle -1 as "last day of month"
      const day = dayOfMonth === -1
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        : (dayOfMonth || 1)
      nextDate = new Date(now.getFullYear(), now.getMonth(), day)
      // If the date has passed this month, move to next month
      if (nextDate <= now) {
        const nextMonthDay = dayOfMonth === -1
          ? new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()
          : day
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, nextMonthDay)
      }
    } else if (frequency === 'yearly') {
      const month = monthOfYear || 1
      const day = dayOfMonth || 1
      nextDate = new Date(now.getFullYear(), month - 1, day)
      // If the date has passed this year, move to next year
      if (nextDate <= now) {
        nextDate = new Date(now.getFullYear() + 1, month - 1, day)
      }
    }

    const recurringExpense = await prisma.recurringExpense.create({
      data: {
        amount: validateAmount(amount),
        category,
        description,
        frequency,
        dayOfMonth: dayOfMonth || null,
        dayOfWeek: dayOfWeek || null,
        monthOfYear: monthOfYear || null,
        isShared: isShared || false,
        userId,
        nextDate,
      },
      include: { user: true },
    })

    // Generate 2 months of expenses immediately (current + next 1 month)
    const expenses = []
    const generateMonthsAhead = 2

    for (let monthOffset = 0; monthOffset < generateMonthsAhead; monthOffset++) {
      if (frequency === 'monthly') {
        const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset)
        // Handle -1 as "last day of month" for the target month
        let day: number
        if (dayOfMonth === -1) {
          day = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
        } else {
          // Cap day at last valid day of month to prevent overflow (e.g., Jan 31 → Feb 28)
          const lastDayOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
          day = Math.min(dayOfMonth || 1, lastDayOfMonth)
        }
        const expenseDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day)

        const expense = await prisma.expense.create({
          data: {
            amount: validateAmount(amount),
            category,
            description,
            date: expenseDate,
            isShared: isShared || false,
            userId,
            recurringExpenseId: recurringExpense.id,
          },
          include: { user: true },
        })
        expenses.push(expense)
      } else if (frequency === 'yearly') {
        // For yearly, only create current year (not future years in 3-month window)
        if (monthOffset > 0) continue
        const month = monthOfYear || 1
        const day = dayOfMonth || 1
        const expenseDate = new Date(now.getFullYear(), month - 1, day)

        const expense = await prisma.expense.create({
          data: {
            amount: validateAmount(amount),
            category,
            description,
            date: expenseDate,
            isShared: isShared || false,
            userId,
            recurringExpenseId: recurringExpense.id,
          },
          include: { user: true },
        })
        expenses.push(expense)
      }
    }

    return NextResponse.json({
      recurringExpense,
      expenses,
    }, { status: 201 })
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create recurring expense:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create recurring expense' },
      { status: 500 }
    )
  }
}
