/**
 * GET /api/networth/liabilities/[id]
 * PUT /api/networth/liabilities/[id]
 * DELETE /api/networth/liabilities/[id]
 *
 * Manage individual liability
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { liabilitySchema } from "@/lib/networth/validation"

// GET - Get a single liability
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json(liability)
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

    // Update liability
    const liability = await prisma.liability.update({
      where: { id },
      data: validation.data,
    })

    return NextResponse.json(liability)
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
