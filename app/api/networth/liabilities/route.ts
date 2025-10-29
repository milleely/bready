/**
 * GET /api/networth/liabilities?userId=xxx
 * POST /api/networth/liabilities
 *
 * Manage liabilities for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { liabilitySchema } from "@/lib/networth/validation"
import type { Liability, LiabilityCategory } from "@/lib/types/networth"
import { updateActivity } from "@/lib/networth/activity-tracker"

// GET - List all liabilities for a user
export async function GET(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    // Update activity timestamp to prevent inactivity timeout
    await updateActivity()

    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get("userId")

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
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

    const liabilities = await prisma.liability.findMany({
      where: { userId: requestedUserId },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    })

    // Cast Prisma string types to TypeScript union types
    const typedLiabilities: Liability[] = liabilities.map(liability => ({
      ...liability,
      category: liability.category as LiabilityCategory,
    }))

    return NextResponse.json(typedLiabilities)
  } catch (error) {
    console.error("Error fetching liabilities:", error)
    return NextResponse.json(
      { error: "Failed to fetch liabilities" },
      { status: 500 }
    )
  }
}

// POST - Create a new liability
export async function POST(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    // Update activity timestamp to prevent inactivity timeout
    await updateActivity()

    const body = await req.json()
    const { userId: requestedUserId, ...data } = body

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
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

    // Create liability
    const liability = await prisma.liability.create({
      data: {
        userId: requestedUserId,
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
