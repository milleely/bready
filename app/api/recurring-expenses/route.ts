import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/recurring-expenses?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where: any = {}
    if (userId) where.userId = userId

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(recurringExpenses)
  } catch (error) {
    console.error('Failed to fetch recurring expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring expenses' },
      { status: 500 }
    )
  }
}

// POST /api/recurring-expenses
export async function POST(request: NextRequest) {
  try {
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

    // Calculate the next date based on frequency
    const now = new Date()
    let nextDate = new Date()

    if (frequency === 'monthly') {
      const day = dayOfMonth || 1
      nextDate = new Date(now.getFullYear(), now.getMonth(), day)
      // If the date has passed this month, move to next month
      if (nextDate <= now) {
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, day)
      }
    } else if (frequency === 'weekly') {
      const targetDay = dayOfWeek || 0
      const currentDay = now.getDay()
      const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7
      nextDate = new Date(now)
      nextDate.setDate(now.getDate() + daysUntilNext)
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
        amount: parseFloat(amount),
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

    return NextResponse.json(recurringExpense, { status: 201 })
  } catch (error) {
    console.error('Failed to create recurring expense:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring expense' },
      { status: 500 }
    )
  }
}
