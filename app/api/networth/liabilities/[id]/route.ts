/**
 * GET /api/networth/liabilities/[id]
 * PUT /api/networth/liabilities/[id]
 * DELETE /api/networth/liabilities/[id]
 *
 * Manage individual liability
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { liabilitySchema } from "@/lib/networth/validation"
import type { Liability, LiabilityCategory } from "@/lib/types/networth"

// GET - Get a single liability
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    const liability = await prisma.liability.findUnique({
      where: { id },
    })

    if (!liability) {
      return NextResponse.json(
        { error: "Liability not found" },
        { status: 404 }
      )
    }

    // Verify the liability belongs to a user in the authenticated user's household
    const liabilityOwner = await prisma.user.findUnique({
      where: { id: liability.userId },
      select: { householdId: true },
    })

    if (!liabilityOwner || liabilityOwner.householdId !== householdId) {
      return NextResponse.json(
        { error: "Liability not found in your household" },
        { status: 403 }
      )
    }

    // Cast Prisma string type to TypeScript union type
    const typedLiability: Liability = {
      ...liability,
      category: liability.category as LiabilityCategory,
    }

    return NextResponse.json(typedLiability)
  } catch (error) {
    console.error("Error fetching liability:", error)
    return NextResponse.json(
      { error: "Failed to fetch liability" },
      { status: 500 }
    )
  }
}

// PUT - Update a liability
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params
    const body = await req.json()

    // Validate liability data
    const validation = liabilitySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check if liability exists
    const existing = await prisma.liability.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Liability not found" },
        { status: 404 }
      )
    }

    // Verify the liability belongs to a user in the authenticated user's household
    const liabilityOwner = await prisma.user.findUnique({
      where: { id: existing.userId },
      select: { householdId: true },
    })

    if (!liabilityOwner || liabilityOwner.householdId !== householdId) {
      return NextResponse.json(
        { error: "Liability not found in your household" },
        { status: 403 }
      )
    }

    // Update liability
    const liability = await prisma.liability.update({
      where: { id },
      data: validation.data,
    })

    // Cast Prisma string type to TypeScript union type
    const typedLiability: Liability = {
      ...liability,
      category: liability.category as LiabilityCategory,
    }

    return NextResponse.json(typedLiability)
  } catch (error) {
    console.error("Error updating liability:", error)
    return NextResponse.json(
      { error: "Failed to update liability" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a liability
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Check if liability exists
    const existing = await prisma.liability.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Liability not found" },
        { status: 404 }
      )
    }

    // Verify the liability belongs to a user in the authenticated user's household
    const liabilityOwner = await prisma.user.findUnique({
      where: { id: existing.userId },
      select: { householdId: true },
    })

    if (!liabilityOwner || liabilityOwner.householdId !== householdId) {
      return NextResponse.json(
        { error: "Liability not found in your household" },
        { status: 403 }
      )
    }

    // Delete liability
    await prisma.liability.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting liability:", error)
    return NextResponse.json(
      { error: "Failed to delete liability" },
      { status: 500 }
    )
  }
}
