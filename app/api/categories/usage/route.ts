import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'

// Returns how many times each category has been used by this household.
// Powers the adaptive ordering of the category picker (most-used floats to top).
export async function GET() {
  try {
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const grouped = await prisma.expense.groupBy({
      by: ['category'],
      where: { user: { householdId } },
      _count: { _all: true },
    })

    const usage: Record<string, number> = {}
    for (const row of grouped) {
      usage[row.category] = row._count._all
    }

    return NextResponse.json(usage)
  } catch (error) {
    console.error('[categories/usage] Failed to compute usage:', error)
    // Non-critical: return empty usage so the picker falls back to default order.
    return NextResponse.json({})
  }
}
