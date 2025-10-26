/**
 * GET /api/networth/expense-override?userId=xxx
 * PUT /api/networth/expense-override
 *
 * Manage monthly expense override for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { expenseOverrideSchema } from "@/lib/networth/validation"

// GET - Get expense override for a user
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

    const expenseOverride = await prisma.monthlyExpenseOverride.findUnique({
      where: { userId: requestedUserId },
    })

    // Return null if not found (user hasn't set an override yet)
    return NextResponse.json(expenseOverride)
  } catch (error) {
    console.error("Error fetching expense override:", error)
    return NextResponse.json(
      { error: "Failed to fetch expense override" },
      { status: 500 }
    )
  }
}

// PUT - Create or update expense override
export async function PUT(req: NextRequest) {
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

    // Verify the authenticated user is updating their own data
    if (clerkUserId !== requestedUserId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot update other users' data" },
        { status: 403 }
      )
    }

    // Validate expense override data
    const validation = expenseOverrideSchema.safeParse(data)
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

    // Upsert (create or update) expense override
    const expenseOverride = await prisma.monthlyExpenseOverride.upsert({
      where: { userId: requestedUserId },
      update: validation.data,
      create: {
        userId: requestedUserId,
        ...validation.data,
      },
    })

    return NextResponse.json(expenseOverride)
  } catch (error) {
    console.error("Error updating expense override:", error)
    return NextResponse.json(
      { error: "Failed to update expense override" },
      { status: 500 }
    )
  }
}
