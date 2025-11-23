/**
 * GET /api/networth/income?userId=xxx&month=YYYY-MM
 * POST /api/networth/income
 *
 * Manage income sources for a user with month-based tracking.
 * Implements carry-forward: if no data for requested month, shows data from previous month.
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { incomeSourceSchema } from "@/lib/networth/validation"
import type { IncomeSource, IncomeFrequency } from "@/lib/types/networth"

// Helper: Get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

// Helper: Get previous month in YYYY-MM format
function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split("-").map(Number)
  const prevMonth = monthNum === 1 ? 12 : monthNum - 1
  const prevYear = monthNum === 1 ? year - 1 : year
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`
}

// Helper: Find most recent month with data, going back up to 12 months
async function findMostRecentMonthWithIncome(
  userId: string,
  startMonth: string
): Promise<string | null> {
  let checkMonth = startMonth
  for (let i = 0; i < 12; i++) {
    checkMonth = getPreviousMonth(checkMonth)
    const count = await prisma.incomeSource.count({
      where: { userId, month: checkMonth },
    })
    if (count > 0) return checkMonth
  }
  return null
}

// GET - List all income sources for a user for a specific month (with carry-forward)
export async function GET(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get("userId")
    const requestedMonth = searchParams.get("month") || getCurrentMonth()

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      )
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(requestedMonth)) {
      return NextResponse.json(
        { error: "Invalid month format. Use YYYY-MM" },
        { status: 400 }
      )
    }

    // Verify the userId belongs to the authenticated user's household
    const user = await prisma.user.findFirst({
      where: {
        id: requestedUserId,
        householdId,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in your household" },
        { status: 403 }
      )
    }

    // Try to find income sources for the requested month
    let incomeSources = await prisma.incomeSource.findMany({
      where: { userId: requestedUserId, month: requestedMonth },
      orderBy: { createdAt: "desc" },
    })

    // Carry-forward: If no data for requested month, get from most recent previous month
    let sourceMonth = requestedMonth
    if (incomeSources.length === 0) {
      const previousMonth = await findMostRecentMonthWithIncome(
        requestedUserId,
        requestedMonth
      )
      if (previousMonth) {
        incomeSources = await prisma.incomeSource.findMany({
          where: { userId: requestedUserId, month: previousMonth },
          orderBy: { createdAt: "desc" },
        })
        sourceMonth = previousMonth
      }
    }

    // Cast Prisma string types to TypeScript union types
    const typedIncomeSources: IncomeSource[] = incomeSources.map(income => ({
      ...income,
      frequency: income.frequency as IncomeFrequency,
    }))

    return NextResponse.json({
      incomeSources: typedIncomeSources,
      month: requestedMonth,
      sourceMonth,
      isInherited: sourceMonth !== requestedMonth,
    })
  } catch (error) {
    console.error("Error fetching income sources:", error)
    return NextResponse.json(
      { error: "Failed to fetch income sources" },
      { status: 500 }
    )
  }
}

// POST - Create a new income source for a specific month
export async function POST(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await req.json()
    const { userId: requestedUserId, month: requestedMonth, ...data } = body
    const month = requestedMonth || getCurrentMonth()

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      )
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Invalid month format. Use YYYY-MM" },
        { status: 400 }
      )
    }

    // Verify the userId belongs to the authenticated user's household
    const user = await prisma.user.findFirst({
      where: {
        id: requestedUserId,
        householdId,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in your household" },
        { status: 403 }
      )
    }

    // Validate income source data
    const validation = incomeSourceSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Create income source for the specific month
    const incomeSource = await prisma.incomeSource.create({
      data: {
        userId: requestedUserId,
        month,
        ...validation.data,
      },
    })

    // Cast Prisma string type to TypeScript union type
    const typedIncomeSource: IncomeSource = {
      ...incomeSource,
      frequency: incomeSource.frequency as IncomeFrequency,
    }

    return NextResponse.json(typedIncomeSource, { status: 201 })
  } catch (error) {
    console.error("Error creating income source:", error)
    return NextResponse.json(
      { error: "Failed to create income source" },
      { status: 500 }
    )
  }
}
