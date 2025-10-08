import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { user: true },
    })

    const users = await prisma.user.findMany()

    // Calculate total spent
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    // Calculate shared expenses total
    const sharedExpenses = expenses
      .filter(exp => exp.isShared)
      .reduce((sum, exp) => sum + exp.amount, 0)

    // Calculate spending per person
    const spendingPerPerson = users.map(user => {
      const userExpenses = expenses.filter(exp => exp.userId === user.id)
      const total = userExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const shared = userExpenses
        .filter(exp => exp.isShared)
        .reduce((sum, exp) => sum + exp.amount, 0)
      const personal = total - shared

      return {
        userId: user.id,
        name: user.name,
        color: user.color,
        total,
        shared,
        personal,
      }
    })

    // Calculate spending by category
    const categoryMap = new Map<string, number>()
    expenses.forEach(exp => {
      categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount)
    })

    const spendingByCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }))

    return NextResponse.json({
      totalSpent,
      sharedExpenses,
      spendingPerPerson,
      spendingByCategory,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
