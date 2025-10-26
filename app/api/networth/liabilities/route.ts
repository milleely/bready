/**
 * GET /api/networth/liabilities?userId=xxx
 * POST /api/networth/liabilities
 *
 * Manage liabilities for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { liabilitySchema } from "@/lib/networth/validation"

// GET - List all liabilities for a user
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

    const liabilities = await prisma.liability.findMany({
      where: { userId },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(liabilities)
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
    const body = await req.json()
    const { userId, ...data } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create liability
    const liability = await prisma.liability.create({
      data: {
        userId,
        ...validation.data,
      },
    })

    return NextResponse.json(liability, { status: 201 })
  } catch (error) {
    console.error("Error creating liability:", error)
    return NextResponse.json(
      { error: "Failed to create liability" },
      { status: 500 }
    )
  }
}
