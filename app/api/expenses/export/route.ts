import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateExpensesCSV } from '@/lib/csv-utils'
import { getHouseholdId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      user: { householdId }, // Only export expenses from user's household
    }

    if (userId) where.userId = userId
    if (category) where.category = category
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { user: true },
      orderBy: { date: 'desc' },
    })

    const csv = generateExpensesCSV(expenses)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bready-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('CSV export error:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to export expenses' },
      { status: 500 }
    )
  }
}
