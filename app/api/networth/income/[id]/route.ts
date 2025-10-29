/**
 * GET /api/networth/income/[id]
 * PUT /api/networth/income/[id]
 * DELETE /api/networth/income/[id]
 *
 * Manage individual income source
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { incomeSourceSchema } from "@/lib/networth/validation"
import type { IncomeSource, IncomeFrequency } from "@/lib/types/networth"

// GET - Get a single income source
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    const incomeSource = await prisma.incomeSource.findUnique({
      where: { id },
    })

    if (!incomeSource) {
      return NextResponse.json(
        { error: "Income source not found" },
        { status: 404 }
      )
    }

    // Verify the income source belongs to a user in the authenticated user's household
    const incomeOwner = await prisma.user.findUnique({
      where: { id: incomeSource.userId },
      select: { householdId: true },
    })

    if (!incomeOwner || incomeOwner.householdId !== householdId) {
      return NextResponse.json(
        { error: "Income source not found in your household" },
        { status: 403 }
      )
    }

    // Cast Prisma string type to TypeScript union type
    const typedIncomeSource: IncomeSource = {
      ...incomeSource,
      frequency: incomeSource.frequency as IncomeFrequency,
    }

    return NextResponse.json(typedIncomeSource)
  } catch (error) {
    console.error("Error fetching income source:", error)
    return NextResponse.json(
      { error: "Failed to fetch income source" },
      { status: 500 }
    )
  }
}

// PUT - Update an income source
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

    // Validate income source data
    const validation = incomeSourceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check if income source exists
    const existing = await prisma.incomeSource.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Income source not found" },
        { status: 404 }
      )
    }

    // Verify the income source belongs to a user in the authenticated user's household
    const incomeOwner = await prisma.user.findUnique({
      where: { id: existing.userId },
      select: { householdId: true },
    })

    if (!incomeOwner || incomeOwner.householdId !== householdId) {
      return NextResponse.json(
        { error: "Income source not found in your household" },
        { status: 403 }
      )
    }

    // Update income source
    const incomeSource = await prisma.incomeSource.update({
      where: { id },
      data: validation.data,
    })

    // Cast Prisma string type to TypeScript union type
    const typedIncomeSource: IncomeSource = {
      ...incomeSource,
      frequency: incomeSource.frequency as IncomeFrequency,
    }

    return NextResponse.json(typedIncomeSource)
  } catch (error) {
    console.error("Error updating income source:", error)
    return NextResponse.json(
      { error: "Failed to update income source" },
      { status: 500 }
    )
  }
}

// DELETE - Delete an income source
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Check if income source exists
    const existing = await prisma.incomeSource.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Income source not found" },
        { status: 404 }
      )
    }

    // Verify the income source belongs to a user in the authenticated user's household
    const incomeOwner = await prisma.user.findUnique({
      where: { id: existing.userId },
      select: { householdId: true },
    })

    if (!incomeOwner || incomeOwner.householdId !== householdId) {
      return NextResponse.json(
        { error: "Income source not found in your household" },
        { status: 403 }
      )
    }

    // Delete income source
    await prisma.incomeSource.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting income source:", error)
    return NextResponse.json(
      { error: "Failed to delete income source" },
      { status: 500 }
    )
  }
}
