/**
 * GET /api/networth/assets/[id]
 * PUT /api/networth/assets/[id]
 * DELETE /api/networth/assets/[id]
 *
 * Manage individual asset
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { assetSchema } from "@/lib/networth/validation"
import type { Asset, AssetCategory } from "@/lib/types/networth"

// GET - Get a single asset
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated Clerk user
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const asset = await prisma.asset.findUnique({
      where: { id },
    })

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Verify the authenticated user owns this asset
    if (clerkUserId !== asset.userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access other users' assets" },
        { status: 403 }
      )
    }

    // Cast Prisma string type to TypeScript union type
    const typedAsset: Asset = {
      ...asset,
      category: asset.category as AssetCategory,
    }

    return NextResponse.json(typedAsset)
  } catch (error) {
    console.error("Error fetching asset:", error)
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    )
  }
}

// PUT - Update an asset
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated Clerk user
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Validate asset data
    const validation = assetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check if asset exists
    const existing = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Verify the authenticated user owns this asset
    if (clerkUserId !== existing.userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot update other users' assets" },
        { status: 403 }
      )
    }

    // Update asset
    const asset = await prisma.asset.update({
      where: { id },
      data: validation.data,
    })

    // Cast Prisma string type to TypeScript union type
    const typedAsset: Asset = {
      ...asset,
      category: asset.category as AssetCategory,
    }

    return NextResponse.json(typedAsset)
  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    )
  }
}

// DELETE - Delete an asset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated Clerk user
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if asset exists
    const existing = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Verify the authenticated user owns this asset
    if (clerkUserId !== existing.userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot delete other users' assets" },
        { status: 403 }
      )
    }

    // Delete asset
    await prisma.asset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    )
  }
}
