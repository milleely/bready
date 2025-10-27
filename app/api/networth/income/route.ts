/**
 * GET /api/networth/income?userId=xxx
 * POST /api/networth/income
 *
 * Manage income sources for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { incomeSourceSchema } from "@/lib/networth/validation"
import type { IncomeSource, IncomeFrequency } from "@/lib/types/networth"

// GET - List all income sources for a user
export async function GET(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

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

    const incomeSources = await prisma.incomeSource.findMany({
      where: { userId: requestedUserId },
      orderBy: { createdAt: "desc" },
    })

    // Cast Prisma string types to TypeScript union types
    const typedIncomeSources: IncomeSource[] = incomeSources.map(income => ({
      ...income,
      frequency: income.frequency as IncomeFrequency,
    }))

    return NextResponse.json(typedIncomeSources)
  } catch (error) {
    console.error("Error fetching income sources:", error)
    return NextResponse.json(
      { error: "Failed to fetch income sources" },
      { status: 500 }
    )
  }
}

// POST - Create a new income source
export async function POST(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

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

    // Validate income source data
    const validation = incomeSourceSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Create income source
    const incomeSource = await prisma.incomeSource.create({
      data: {
        userId: requestedUserId,
        ...validation.data,
      },
    })

    // Cast Prisma string type to TypeScript union type
    const typedIncomeSource: IncomeSource = {
      ...incomeSource,
      frequency: incomeSource.frequency as IncomeFrequency,
    }

    return NextResponse.json(typedIncomeSource, { status: 201 })
  } catch (error) {
    console.error("Error creating income source:", error)
    return NextResponse.json(
      { error: "Failed to create income source" },
      { status: 500 }
    )
  }
}
