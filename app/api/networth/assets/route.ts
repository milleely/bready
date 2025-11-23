/**
 * GET /api/networth/assets?userId=xxx&month=YYYY-MM
 * POST /api/networth/assets
 *
 * Manage assets for a user with month-based tracking.
 * Each month is independent - no automatic carry-forward.
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

// GET - List all assets for a user for a specific month
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

    // Fetch assets for the requested month only (no carry-forward)
    const assets = await prisma.asset.findMany({
      where: { userId: requestedUserId, month: requestedMonth },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    })

    // Cast Prisma string types to TypeScript union types
    const typedAssets: Asset[] = assets.map(asset => ({
      ...asset,
      category: asset.category as AssetCategory,
    }))

    return NextResponse.json({
      assets: typedAssets,
      month: requestedMonth,
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
