import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    if (!month) {
      return NextResponse.json(
        { error: 'month parameter is required (format: YYYY-MM)' },
        { status: 400 }
      )
    }

    // Fetch all settlements for the given month
    const settlements = await prisma.settlement.findMany({
      where: {
        month,
      },
      orderBy: {
        date: 'desc', // Newest first
      },
    })

    // Get all users in the household to filter settlements
    const users = await prisma.user.findMany({
      where: { householdId },
    })

    const userIds = new Set(users.map(u => u.id))
    const usersMap = new Map(users.map(u => [u.id, u]))

    // Filter settlements to only include those within this household
    // and enrich with user details
    const enrichedSettlements = settlements
      .filter(s => userIds.has(s.fromUserId) && userIds.has(s.toUserId))
      .map(settlement => {
        const fromUser = usersMap.get(settlement.fromUserId)!
        const toUser = usersMap.get(settlement.toUserId)!

        return {
          id: settlement.id,
          from: {
            id: fromUser.id,
            name: fromUser.name,
            color: fromUser.color,
          },
          to: {
            id: toUser.id,
            name: toUser.name,
            color: toUser.color,
          },
          amount: settlement.amount,
          date: settlement.date.toISOString(),
          month: settlement.month,
          note: settlement.note,
        }
      })

    return NextResponse.json(enrichedSettlements)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch settlement history:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to fetch settlement history' },
      { status: 500 }
    )
  }
}
