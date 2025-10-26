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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, currentPin, newPin } = body

    // Validate required fields
    if (!userId || !currentPin || !newPin) {
      return NextResponse.json(
        { error: "Missing required fields: userId, currentPin, and newPin" },
        { status: 400 }
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
      where: { userId },
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
      where: { userId },
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
