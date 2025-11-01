import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Verify expense belongs to user's household
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        user: { householdId },
      },
      include: {
        recurringExpense: true,
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found or access denied' },
        { status: 404 }
      )
    }

    if (!existingExpense.recurringExpenseId) {
      return NextResponse.json(
        { error: 'Expense is not a recurring expense' },
        { status: 400 }
      )
    }

    // Update the expense to remove recurring link
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        recurringExpenseId: null,
      },
      include: { user: true },
    })

    return NextResponse.json(expense)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to unmark recurring expense:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to unmark recurring expense' },
      { status: 500 }
    )
  }
}
