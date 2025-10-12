import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import { validateAmount } from '@/lib/utils'

// PUT /api/budgets/[id]
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
    const { category, amount, month, userId } = body

    // Verify budget belongs to household
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        householdId, // Verify householdId matches
      },
    })

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found in your household' },
        { status: 404 }
      )
    }

    // If updating userId, verify it belongs to household
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

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(amount && { amount: validateAmount(amount) }),
        ...(month && { month }),
        ...(userId !== undefined && { userId: userId || null }),
      },
    })

    return NextResponse.json(budget)
  } catch (error: any) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to update budget:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

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
      { error: error instanceof Error ? error.message : 'Failed to update budget' },
      { status: 500 }
    )
  }
}

// DELETE /api/budgets/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Verify budget belongs to household
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        householdId, // Verify householdId matches
      },
    })

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found in your household' },
        { status: 404 }
      )
    }

    await prisma.budget.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to delete budget:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

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
