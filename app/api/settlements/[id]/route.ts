import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Find the settlement and verify it exists
    const settlement = await prisma.settlement.findUnique({
      where: { id },
    })

    if (!settlement) {
      return NextResponse.json(
        { error: 'Settlement not found' },
        { status: 404 }
      )
    }

    // Fetch the users to verify household membership
    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: settlement.fromUserId },
        select: { householdId: true },
      }),
      prisma.user.findUnique({
        where: { id: settlement.toUserId },
        select: { householdId: true },
      }),
    ])

    if (!fromUser || !toUser) {
      return NextResponse.json(
        { error: 'Settlement users not found' },
        { status: 404 }
      )
    }

    // Verify that both users belong to the authenticated user's household
    if (
      fromUser.householdId !== householdId ||
      toUser.householdId !== householdId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this settlement' },
        { status: 403 }
      )
    }

    // Delete the settlement
    await prisma.settlement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to delete settlement:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to delete settlement' },
      { status: 500 }
    )
  }
}
