/**
 * GET /api/networth/assets?userId=xxx
 * POST /api/networth/assets
 *
 * Manage assets for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { assetSchema } from "@/lib/networth/validation"

// GET - List all assets for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      )
    }

    const assets = await prisma.asset.findMany({
      where: { userId },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(assets)
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
    const body = await req.json()
    const { userId, ...data } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
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
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        userId,
        ...validation.data,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    )
  }
}
