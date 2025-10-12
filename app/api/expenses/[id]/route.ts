import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import { validateAmount } from '@/lib/utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params
    const body = await request.json()

    // Verify expense belongs to user's household
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        user: { householdId },
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found or access denied' },
        { status: 404 }
      )
    }

    // Verify the new userId belongs to the household
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

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        amount: validateAmount(body.amount),
        category: body.category,
        description: body.description,
        date: new Date(body.date),
        isShared: body.isShared,
        userId: body.userId,
      },
      include: { user: true },
    })

    return NextResponse.json(expense)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to update expense:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update expense' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Verify expense belongs to user's household before deleting
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        user: { householdId },
      },
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to delete expense:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
