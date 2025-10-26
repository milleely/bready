/**
 * GET /api/networth/assets?userId=xxx
 * POST /api/networth/assets
 *
 * Manage assets for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { assetSchema } from "@/lib/networth/validation"
import type { Asset, AssetCategory } from "@/lib/types/networth"

// GET - List all assets for a user
export async function GET(req: NextRequest) {
  try {
    // Get authenticated Clerk user
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get("userId")

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      )
    }

    // Verify the authenticated user is requesting their own data
    if (clerkUserId !== requestedUserId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access other users' data" },
        { status: 403 }
      )
    }

    const assets = await prisma.asset.findMany({
      where: { userId: requestedUserId },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    })

    // Cast Prisma string types to TypeScript union types
    const typedAssets: Asset[] = assets.map(asset => ({
      ...asset,
      category: asset.category as AssetCategory,
    }))

    return NextResponse.json(typedAssets)
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    )
  }
}

// POST - Create a new asset
export async function POST(req: NextRequest) {
  try {
    // Get authenticated Clerk user
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId: requestedUserId, ...data } = body

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      )
    }

    // Verify the authenticated user is creating for their own account
    if (clerkUserId !== requestedUserId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot create assets for other users" },
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        userId: requestedUserId,
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
