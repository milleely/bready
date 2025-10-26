/**
 * GET /api/networth/pin/setup?userId=xxx
 * POST /api/networth/pin/setup
 *
 * GET: Check if user has a PIN set up
 * POST: Creates a new PIN for a user who doesn't have one yet
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPin } from "@/lib/networth/pin-auth"
import { pinSchema } from "@/lib/networth/validation"

// GET - Check if user has a PIN
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

    const userPin = await prisma.userPin.findUnique({
      where: { userId },
    })

    return NextResponse.json({ hasPin: !!userPin })
  } catch (error) {
    console.error("PIN check error:", error)
    return NextResponse.json(
      { error: "Failed to check PIN status" },
      { status: 500 }
    )
  }
}

// POST - Create new PIN
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, pin } = body

    // Validate required fields
    if (!userId || !pin) {
      return NextResponse.json(
        { error: "Missing required fields: userId and pin" },
        { status: 400 }
      )
    }

    // Validate PIN format
    const validation = pinSchema.safeParse({ pin })
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if PIN already exists for this user
    const existingPin = await prisma.userPin.findUnique({
      where: { userId },
    })

    if (existingPin) {
      return NextResponse.json(
        { error: "PIN already exists for this user. Use update endpoint instead." },
        { status: 409 }
      )
    }

    // Hash the PIN
    const hashedPin = await hashPin(pin)

    // Create PIN record
    const userPin = await prisma.userPin.create({
      data: {
        userId,
        pin: hashedPin,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "PIN created successfully",
        userId: userPin.userId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("PIN setup error:", error)
    return NextResponse.json(
      { error: "Failed to create PIN" },
      { status: 500 }
    )
  }
}
