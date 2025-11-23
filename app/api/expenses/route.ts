import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import { validateAmount } from '@/lib/utils'
import { checkBudgetThreshold } from '@/lib/notifications/budget-alerts'

export async function GET(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isShared = searchParams.get('isShared')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const isRecurring = searchParams.get('isRecurring')

    // 🚀 PERFORMANCE: Optional pagination params (backwards-compatible)
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const page = pageParam ? Math.max(1, parseInt(pageParam)) : null
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : null // Max 100 per page

    const where: any = {
      user: { householdId }, // Only return expenses from user's household
    }

    // Single user filter
    if (userId) where.userId = userId

    // Single category filter
    if (category) where.category = category

    // Date range filter
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // Expense type filter (shared/personal)
    if (isShared !== null && isShared !== undefined) {
      where.isShared = isShared === 'true'
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      where.amount = {}
      if (minAmount) where.amount.gte = parseFloat(minAmount)
      if (maxAmount) where.amount.lte = parseFloat(maxAmount)
    }

    // Recurring expense filter
    if (isRecurring !== null && isRecurring !== undefined) {
      if (isRecurring === 'true') {
        // Show only recurring expenses (those with a recurringExpenseId)
        where.recurringExpenseId = { not: null }
      } else if (isRecurring === 'false') {
        // Show only one-time expenses (those without a recurringExpenseId)
        where.recurringExpenseId = null
      }
      // If isRecurring is anything else, show all expenses (no filter)
    }

    // When pagination is requested, return paginated response with metadata
    if (page && limit) {
      const skip = (page - 1) * limit

      // Run count and data queries in parallel for efficiency
      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          include: {
            user: true,
            recurringExpense: true,
          },
          orderBy: { date: 'desc' },
          skip,
          take: limit,
        }),
        prisma.expense.count({ where }),
      ])

      return NextResponse.json({
        expenses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    }

    // Default: Return all expenses (backwards-compatible)
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        user: true,
        recurringExpense: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch expenses:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await request.json()

    // Verify the userId belongs to the authenticated user's household
    const user = await prisma.user.findFirst({
      where: {
        id: body.userId,
        householdId,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in your household' },
        { status: 403 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        amount: validateAmount(body.amount),
        category: body.category,
        description: body.description,
        date: new Date(body.date),
        isShared: body.isShared,
        receiptUrl: body.receiptUrl || null, // Optional receipt URL
        userId: body.userId,
      },
      include: { user: true },
    })

    // 🔔 Trigger budget alert check (non-blocking, fire-and-forget)
    checkBudgetThreshold(expense).catch(err => {
      console.error('[API] Budget alert failed:', err)
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create expense:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create expense' },
      { status: 500 }
    )
  }
}
