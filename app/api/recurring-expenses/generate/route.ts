import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/recurring-expenses/generate
export async function POST(request: NextRequest) {
  try {
    const now = new Date()

    // Find all active recurring expenses where nextDate is today or earlier
    const dueRecurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        nextDate: {
          lte: now,
        },
      },
      include: { user: true },
    })

    const createdExpenses = []
    const updatedRecurringExpenses = []

    // Process each due recurring expense
    for (const recurring of dueRecurringExpenses) {
      // Create the actual expense
      const expense = await prisma.expense.create({
        data: {
          amount: recurring.amount,
          category: recurring.category,
          description: recurring.description,
          date: recurring.nextDate,
          isShared: recurring.isShared,
          userId: recurring.userId,
          recurringExpenseId: recurring.id,
        },
        include: { user: true },
      })
      createdExpenses.push(expense)

      // Calculate the next occurrence date
      let nextDate = new Date(recurring.nextDate)

      if (recurring.frequency === 'monthly') {
        const day = recurring.dayOfMonth || 1
        nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, day)
      } else if (recurring.frequency === 'weekly') {
        nextDate = new Date(nextDate)
        nextDate.setDate(nextDate.getDate() + 7)
      } else if (recurring.frequency === 'yearly') {
        const month = recurring.monthOfYear || 1
        const day = recurring.dayOfMonth || 1
        nextDate = new Date(nextDate.getFullYear() + 1, month - 1, day)
      }

      // Update the recurring expense with new nextDate
      const updated = await prisma.recurringExpense.update({
        where: { id: recurring.id },
        data: { nextDate },
        include: { user: true },
      })
      updatedRecurringExpenses.push(updated)
    }

    return NextResponse.json({
      success: true,
      generated: createdExpenses.length,
      expenses: createdExpenses,
      updated: updatedRecurringExpenses,
    })
  } catch (error) {
    console.error('Failed to generate recurring expenses:', error)
    return NextResponse.json(
      { error: 'Failed to generate recurring expenses' },
      { status: 500 }
    )
  }
}
