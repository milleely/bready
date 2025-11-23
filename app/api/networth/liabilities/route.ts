/**
 * GET /api/networth/liabilities?userId=xxx&month=YYYY-MM
 * POST /api/networth/liabilities
 *
 * Manage liabilities for a user with month-based tracking.
 * Implements carry-forward: if no data for requested month, shows data from previous month.
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { liabilitySchema } from "@/lib/networth/validation"
import type { Liability, LiabilityCategory } from "@/lib/types/networth"

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
async function findMostRecentMonthWithLiabilities(
  userId: string,
  startMonth: string
): Promise<string | null> {
  let checkMonth = startMonth
  for (let i = 0; i < 12; i++) {
    checkMonth = getPreviousMonth(checkMonth)
    const count = await prisma.liability.count({
      where: { userId, month: checkMonth },
    })
    if (count > 0) return checkMonth
  }
  return null
}

// GET - List all liabilities for a user for a specific month (with carry-forward)
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

    // Try to find liabilities for the requested month
    let liabilities = await prisma.liability.findMany({
      where: { userId: requestedUserId, month: requestedMonth },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    })

    // Carry-forward: If no data for requested month, get from most recent previous month
    let sourceMonth = requestedMonth
    if (liabilities.length === 0) {
      const previousMonth = await findMostRecentMonthWithLiabilities(
        requestedUserId,
        requestedMonth
      )
      if (previousMonth) {
        liabilities = await prisma.liability.findMany({
          where: { userId: requestedUserId, month: previousMonth },
          orderBy: [{ category: "asc" }, { createdAt: "desc" }],
        })
        sourceMonth = previousMonth
      }
    }

    // Cast Prisma string types to TypeScript union types
    const typedLiabilities: Liability[] = liabilities.map(liability => ({
      ...liability,
      category: liability.category as LiabilityCategory,
    }))

    return NextResponse.json({
      liabilities: typedLiabilities,
      month: requestedMonth,
      sourceMonth,
      isInherited: sourceMonth !== requestedMonth,
    })
  } catch (error) {
    console.error("Error fetching liabilities:", error)
    return NextResponse.json(
      { error: "Failed to fetch liabilities" },
      { status: 500 }
    )
  }
}

// POST - Create a new liability for a specific month
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

    // Validate liability data
    const validation = liabilitySchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Create liability for the specific month
    const liability = await prisma.liability.create({
      data: {
        userId: requestedUserId,
        month,
        ...validation.data,
      },
    })

    // Cast Prisma string type to TypeScript union type
    const typedLiability: Liability = {
      ...liability,
      category: liability.category as LiabilityCategory,
    }

    return NextResponse.json(typedLiability, { status: 201 })
  } catch (error) {
    console.error("Error creating liability:", error)
    return NextResponse.json(
      { error: "Failed to create liability" },
      { status: 500 }
    )
  }
}
