import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import { validateAmount } from '@/lib/utils'

// GET /api/recurring-expenses/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Find recurring expense and verify it belongs to household
    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id,
        user: { householdId },
      },
      include: { user: true },
    })

    if (!recurringExpense) {
      return NextResponse.json(
        { error: 'Recurring expense not found in your household' },
        { status: 404 }
      )
    }

    return NextResponse.json(recurringExpense)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch recurring expense:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to fetch recurring expense' },
      { status: 500 }
    )
  }
}

// PUT /api/recurring-expenses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Verify recurring expense belongs to household
    const existingRecurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id,
        user: { householdId },
      },
    })

    if (!existingRecurringExpense) {
      return NextResponse.json(
        { error: 'Recurring expense not found in your household' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      amount,
      category,
      description,
      frequency,
      dayOfMonth,
      monthOfYear,
      isShared,
      isActive,
    } = body

    const recurringExpense = await prisma.recurringExpense.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: validateAmount(amount) }),
        ...(category && { category }),
        ...(description && { description }),
        ...(frequency && { frequency }),
        ...(dayOfMonth !== undefined && { dayOfMonth }),
        ...(monthOfYear !== undefined && { monthOfYear }),
        ...(isShared !== undefined && { isShared }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { user: true },
    })

    return NextResponse.json(recurringExpense)
  } catch (error: any) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to update recurring expense:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Recurring expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update recurring expense' },
      { status: 500 }
    )
  }
}

// DELETE /api/recurring-expenses/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Verify recurring expense belongs to household
    const existingRecurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id,
        user: { householdId },
      },
    })

    if (!existingRecurringExpense) {
      return NextResponse.json(
        { error: 'Recurring expense not found in your household' },
        { status: 404 }
      )
    }

    // Use the expense date from query parameter as cutoff, fallback to current date
    const { searchParams } = new URL(request.url)
    const fromDateParam = searchParams.get('fromDate')
    const cutoffDate = fromDateParam ? new Date(fromDateParam) : new Date()

    // Delete all expenses >= cutoff date (from the clicked expense forward)
    // (keeps past expenses as historical records)
    const deletedExpenses = await prisma.expense.deleteMany({
      where: {
        recurringExpenseId: id,
        date: { gte: cutoffDate },
      },
    })

    // Delete the recurring expense template itself
    await prisma.recurringExpense.delete({
      where: { id },
    })

    console.log(`[Recurring Delete] Removed recurring expense ${id} and ${deletedExpenses.count} future expenses`)

    return NextResponse.json({
      success: true,
      deletedFutureExpenses: deletedExpenses.count,
    }, { status: 200 })
  } catch (error: any) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to delete recurring expense:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Recurring expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete recurring expense' },
      { status: 500 }
    )
  }
}
