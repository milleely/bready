import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT /api/budgets/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { category, amount, month, userId } = body

    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        ...(category && { category }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(month && { month }),
        ...(userId !== undefined && { userId: userId || null }),
      },
    })

    return NextResponse.json(budget)
  } catch (error: any) {
    console.error('Failed to update budget:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Budget already exists for this category and month' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}

// DELETE /api/budgets/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.budget.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Failed to delete budget:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
}
