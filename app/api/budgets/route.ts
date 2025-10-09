import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/budgets?month=YYYY-MM&userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const userId = searchParams.get('userId')

    const where: any = {}
    if (month) where.month = month
    if (userId) where.userId = userId

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { month: 'desc' },
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Failed to fetch budgets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

// POST /api/budgets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, amount, month, userId } = body

    if (!category || !amount || !month) {
      return NextResponse.json(
        { error: 'Missing required fields: category, amount, month' },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        amount: parseFloat(amount),
        month,
        userId: userId || null,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create budget:', error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Budget already exists for this category and month' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    )
  }
}
