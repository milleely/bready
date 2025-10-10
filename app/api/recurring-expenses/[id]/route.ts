import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT /api/recurring-expenses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
    } = body

    const recurringExpense = await prisma.recurringExpense.update({
      where: { id: params.id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(description && { description }),
        ...(frequency && { frequency }),
        ...(dayOfMonth !== undefined && { dayOfMonth }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(monthOfYear !== undefined && { monthOfYear }),
        ...(isShared !== undefined && { isShared }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { user: true },
    })

    return NextResponse.json(recurringExpense)
  } catch (error: any) {
    console.error('Failed to update recurring expense:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Recurring expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update recurring expense' },
      { status: 500 }
    )
  }
}

// DELETE /api/recurring-expenses/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.recurringExpense.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Failed to delete recurring expense:', error)

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
