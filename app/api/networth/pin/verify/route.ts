/**
 * POST /api/networth/pin/verify
 *
 * Verifies a PIN for a user and returns authentication status.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPin } from "@/lib/networth/pin-auth"
import { pinSchema } from "@/lib/networth/validation"
import { rateLimit, clearRateLimit } from "@/lib/rate-limit"
import { getHouseholdId } from "@/lib/auth"

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

    // Apply rate limiting: 5 attempts per 15 minutes per user
    const rateLimitResult = rateLimit(`pin-verify:${requestedUserId}`, 5, 15 * 60 * 1000)

    if (!rateLimitResult.success) {
      const resetInMinutes = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many PIN attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? "s" : ""}.`,
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

    // Get user's PIN from database
    const userPin = await prisma.userPin.findUnique({
      where: { userId: requestedUserId },
    })

    if (!userPin) {
      return NextResponse.json(
        { error: "No PIN set for this user" },
        { status: 404 }
      )
    }

    // Verify the PIN
    const isValid = await verifyPin(pin, userPin.pin)

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect PIN",
        },
        { status: 401 }
      )
    }

    // Return success response with user details already fetched
    return NextResponse.json({
      success: true,
      message: "PIN verified successfully",
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
      },
    })
  } catch (error) {
    console.error("PIN verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify PIN" },
      { status: 500 }
    )
  }
}
