/**
 * GET /api/networth/liabilities?userId=xxx&month=YYYY-MM
 * POST /api/networth/liabilities
 *
 * Manage liabilities for a user with month-based tracking.
 * Each month is independent - no automatic carry-forward.
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

// GET - List all liabilities for a user for a specific month
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

    // Fetch liabilities for the requested month only (no carry-forward)
    const liabilities = await prisma.liability.findMany({
      where: { userId: requestedUserId, month: requestedMonth },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    })

    // Cast Prisma string types to TypeScript union types
    const typedLiabilities: Liability[] = liabilities.map(liability => ({
      ...liability,
      category: liability.category as LiabilityCategory,
    }))

    return NextResponse.json({
      liabilities: typedLiabilities,
      month: requestedMonth,
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
