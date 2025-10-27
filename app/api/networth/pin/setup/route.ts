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
import { rateLimit } from "@/lib/rate-limit"
import { getHouseholdId } from "@/lib/auth"

// GET - Check if user has a PIN
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

    const userPin = await prisma.userPin.findUnique({
      where: { userId: requestedUserId },
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
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await req.json()
    const { userId: requestedUserId, pin } = body

    // Validate required fields
    if (!requestedUserId || !pin) {
      return NextResponse.json(
        { error: "Missing required fields: userId and pin" },
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

    // Apply rate limiting: 5 attempts per hour per user
    const rateLimitResult = rateLimit(`pin-setup:${requestedUserId}`, 5, 60 * 60 * 1000)

    if (!rateLimitResult.success) {
      const resetInMinutes = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many PIN setup attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? "s" : ""}.`,
          retryAfter: rateLimitResult.resetAt,
        },
        { status: 429 }
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

    // Check if PIN already exists for this user
    const existingPin = await prisma.userPin.findUnique({
      where: { userId: requestedUserId },
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
        userId: requestedUserId,
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
