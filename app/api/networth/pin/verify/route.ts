/**
 * POST /api/networth/pin/verify
 *
 * Verifies a PIN for a user and returns authentication status.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPin } from "@/lib/networth/pin-auth"
import { pinSchema } from "@/lib/networth/validation"

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

    // Get user's PIN from database
    const userPin = await prisma.userPin.findUnique({
      where: { userId },
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

    // Get user details for response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        color: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "PIN verified successfully",
      user,
    })
  } catch (error) {
    console.error("PIN verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify PIN" },
      { status: 500 }
    )
  }
}
