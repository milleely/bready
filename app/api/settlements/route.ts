import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import { validateAmount } from '@/lib/utils'

interface Settlement {
  from: {
    id: string
    name: string
    color: string
  }
  to: {
    id: string
    name: string
    color: string
  }
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromUserId, toUserId, amount, month, note } = body

    if (!fromUserId || !toUserId || !amount || !month) {
      return NextResponse.json(
        { error: 'fromUserId, toUserId, amount, and month are required' },
        { status: 400 }
      )
    }

    // Verify both users belong to the authenticated user's household
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const users = await prisma.user.findMany({
      where: {
        id: { in: [fromUserId, toUserId] },
        householdId,
      },
    })

    if (users.length !== 2) {
      return NextResponse.json(
        { error: 'One or both users not found in your household' },
        { status: 403 }
      )
    }

    // Create settlement record
    const settlement = await prisma.settlement.create({
      data: {
        fromUserId,
        toUserId,
        amount: validateAmount(amount),
        month,
        note: note || null,
      },
    })

    return NextResponse.json(settlement)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create settlement:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create settlement' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    // Get all shared expenses in the date range from user's household
    const expenses = await prisma.expense.findMany({
      where: {
        isShared: true,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z'),
        },
        user: { householdId },
      },
      include: {
        user: true,
      },
    })

    // Get all users from the household
    const users = await prisma.user.findMany({
      where: { householdId },
    })
    const userCount = users.length

    if (userCount === 0) {
      return NextResponse.json([])
    }

    // Get the month from the date range for settlement lookups
    const monthStr = startDate.substring(0, 7) // "YYYY-MM"

    // Only get existing settlement payments if there are expenses in this month
    // This prevents old settlements from affecting calculations when all expenses are deleted
    const existingSettlements = expenses.length > 0
      ? await prisma.settlement.findMany({
          where: {
            month: monthStr,
          },
        })
      : []

    // Calculate net balance for each user
    // Positive balance = user is owed money
    // Negative balance = user owes money
    const balances = new Map<string, number>()

    // Initialize all users with 0 balance
    users.forEach(user => {
      balances.set(user.id, 0)
    })

    // Calculate balances
    expenses.forEach(expense => {
      const amountPerPerson = expense.amount / userCount

      // The person who paid should receive money
      balances.set(
        expense.userId,
        (balances.get(expense.userId) || 0) + expense.amount - amountPerPerson
      )

      // Everyone else owes their share
      users.forEach(user => {
        if (user.id !== expense.userId) {
          balances.set(
            user.id,
            (balances.get(user.id) || 0) - amountPerPerson
          )
        }
      })
    })

    // Subtract existing settlement payments from balances
    existingSettlements.forEach(settlement => {
      // The person who paid (fromUserId) has reduced their debt (increased balance)
      balances.set(
        settlement.fromUserId,
        (balances.get(settlement.fromUserId) || 0) + settlement.amount
      )

      // The person who received (toUserId) has received payment (decreased balance)
      balances.set(
        settlement.toUserId,
        (balances.get(settlement.toUserId) || 0) - settlement.amount
      )
    })

    // Simplify settlements using greedy algorithm
    const settlements: Settlement[] = []
    const creditors: Array<{ userId: string; amount: number }> = []
    const debtors: Array<{ userId: string; amount: number }> = []

    // Separate creditors (owed money) and debtors (owe money)
    balances.forEach((balance, userId) => {
      if (balance > 0.01) { // Small threshold to avoid floating point issues
        creditors.push({ userId, amount: balance })
      } else if (balance < -0.01) {
        debtors.push({ userId, amount: -balance })
      }
    })

    // Sort by amount (largest first) for optimal matching
    creditors.sort((a, b) => b.amount - a.amount)
    debtors.sort((a, b) => b.amount - a.amount)

    // Match debtors with creditors
    let i = 0
    let j = 0

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]
      const settlementAmount = Math.min(debtor.amount, creditor.amount)

      const debtorUser = users.find(u => u.id === debtor.userId)!
      const creditorUser = users.find(u => u.id === creditor.userId)!

      settlements.push({
        from: {
          id: debtorUser.id,
          name: debtorUser.name,
          color: debtorUser.color,
        },
        to: {
          id: creditorUser.id,
          name: creditorUser.name,
          color: creditorUser.color,
        },
        amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimal places
      })

      debtor.amount -= settlementAmount
      creditor.amount -= settlementAmount

      if (debtor.amount < 0.01) i++
      if (creditor.amount < 0.01) j++
    }

    return NextResponse.json(settlements)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to calculate settlements:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to calculate settlements' },
      { status: 500 }
    )
  }
}
