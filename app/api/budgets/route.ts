import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import { validateAmount } from '@/lib/utils'

// GET /api/budgets?month=YYYY-MM&userId=xxx
export async function GET(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const userId = searchParams.get('userId')

    // Build where clause - filter by householdId for complete isolation
    const where: any = {
      householdId, // All budgets must belong to this household
    }
    if (month) where.month = month
    if (userId) where.userId = userId

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { month: 'desc' },
    })

    return NextResponse.json(budgets)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch budgets:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

// POST /api/budgets
export async function POST(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await request.json()
    const { category, amount, month, userId } = body

    if (!category || !amount || !month) {
      return NextResponse.json(
        { error: 'Missing required fields: category, amount, month' },
        { status: 400 }
      )
    }

    // If userId provided, verify it belongs to household
    if (userId) {
      const user = await prisma.user.findFirst({
        where: { id: userId, householdId },
      })
      if (!user) {
        return NextResponse.json(
          { error: 'User not found in your household' },
          { status: 403 }
        )
      }
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        amount: validateAmount(amount),
        month,
        userId: userId || null,
        householdId, // Add householdId for proper isolation
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error: any) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create budget:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Budget already exists for this category and month' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create budget' },
      { status: 500 }
    )
  }
}
