/**
 * GET /api/networth/income?userId=xxx
 * POST /api/networth/income
 *
 * Manage income sources for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { incomeSourceSchema } from "@/lib/networth/validation"

// GET - List all income sources for a user
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

    const incomeSources = await prisma.incomeSource.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(incomeSources)
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
    const body = await req.json()
    const { userId, ...data } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create income source
    const incomeSource = await prisma.incomeSource.create({
      data: {
        userId,
        ...validation.data,
      },
    })

    return NextResponse.json(incomeSource, { status: 201 })
  } catch (error) {
    console.error("Error creating income source:", error)
    return NextResponse.json(
      { error: "Failed to create income source" },
      { status: 500 }
    )
  }
}
