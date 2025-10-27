/**
 * PUT /api/networth/pin/update
 *
 * Updates an existing PIN for a user.
 * Requires the current PIN for verification before updating.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPin, verifyPin } from "@/lib/networth/pin-auth"
import { pinSchema } from "@/lib/networth/validation"
import { rateLimit } from "@/lib/rate-limit"
import { getHouseholdId } from "@/lib/auth"

export async function PUT(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await req.json()
    const { userId: requestedUserId, currentPin, newPin } = body

    // Validate required fields
    if (!requestedUserId || !currentPin || !newPin) {
      return NextResponse.json(
        { error: "Missing required fields: userId, currentPin, and newPin" },
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
    const rateLimitResult = rateLimit(`pin-update:${requestedUserId}`, 5, 60 * 60 * 1000)

    if (!rateLimitResult.success) {
      const resetInMinutes = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many PIN update attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? "s" : ""}.`,
          retryAfter: rateLimitResult.resetAt,
        },
        { status: 429 }
      )
    }

    // Validate new PIN format
    const validation = pinSchema.safeParse({ pin: newPin })
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Get user's current PIN from database
    const userPin = await prisma.userPin.findUnique({
      where: { userId: requestedUserId },
    })

    if (!userPin) {
      return NextResponse.json(
        { error: "No PIN set for this user" },
        { status: 404 }
      )
    }

    // Verify the current PIN
    const isValid = await verifyPin(currentPin, userPin.pin)

    if (!isValid) {
      return NextResponse.json(
        { error: "Current PIN is incorrect" },
        { status: 401 }
      )
    }

    // Hash the new PIN
    const hashedNewPin = await hashPin(newPin)

    // Update the PIN
    await prisma.userPin.update({
      where: { userId: requestedUserId },
      data: {
        pin: hashedNewPin,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "PIN updated successfully",
    })
  } catch (error) {
    console.error("PIN update error:", error)
    return NextResponse.json(
      { error: "Failed to update PIN" },
      { status: 500 }
    )
  }
}
