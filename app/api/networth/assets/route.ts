/**
 * GET /api/networth/assets?userId=xxx&month=YYYY-MM
 * POST /api/networth/assets
 *
 * Manage assets for a user with month-based tracking.
 * Implements carry-forward: if no data for requested month, shows data from previous month.
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { assetSchema } from "@/lib/networth/validation"
import type { Asset, AssetCategory } from "@/lib/types/networth"

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
async function findMostRecentMonthWithAssets(
  userId: string,
  startMonth: string
): Promise<string | null> {
  let checkMonth = startMonth
  for (let i = 0; i < 12; i++) {
    checkMonth = getPreviousMonth(checkMonth)
    const count = await prisma.asset.count({
      where: { userId, month: checkMonth },
    })
    if (count > 0) return checkMonth
  }
  return null
}

// GET - List all assets for a user for a specific month (with carry-forward)
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

    // Try to find assets for the requested month
    let assets = await prisma.asset.findMany({
      where: { userId: requestedUserId, month: requestedMonth },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    })

    // Carry-forward: If no data for requested month, get from most recent previous month
    let sourceMonth = requestedMonth
    if (assets.length === 0) {
      const previousMonth = await findMostRecentMonthWithAssets(
        requestedUserId,
        requestedMonth
      )
      if (previousMonth) {
        assets = await prisma.asset.findMany({
          where: { userId: requestedUserId, month: previousMonth },
          orderBy: [{ category: "asc" }, { createdAt: "desc" }],
        })
        sourceMonth = previousMonth
      }
    }

    // Cast Prisma string types to TypeScript union types
    const typedAssets: Asset[] = assets.map(asset => ({
      ...asset,
      category: asset.category as AssetCategory,
    }))

    return NextResponse.json({
      assets: typedAssets,
      month: requestedMonth,
      sourceMonth, // Indicates where data came from (for UI to show "inherited" status)
      isInherited: sourceMonth !== requestedMonth,
    })
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    )
  }
}

// POST - Create a new asset for a specific month
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

    // Validate asset data
    const validation = assetSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Create asset for the specific month
    const asset = await prisma.asset.create({
      data: {
        userId: requestedUserId,
        month,
        ...validation.data,
      },
    })

    // Cast Prisma string type to TypeScript union type
    const typedAsset: Asset = {
      ...asset,
      category: asset.category as AssetCategory,
    }

    return NextResponse.json(typedAsset, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    )
  }
}
