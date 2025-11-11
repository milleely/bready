/**
 * GET /api/notifications/preferences?userId=xxx
 * PUT /api/notifications/preferences
 *
 * Manage notification preferences for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Validation helper
function validatePreferences(data: any): boolean {
  // Validate budget thresholds (must be comma-separated numbers)
  if (data.budgetAlertThresholds) {
    const thresholds = data.budgetAlertThresholds.split(",").map((t: string) => parseInt(t.trim()))
    if (thresholds.some((t: number) => isNaN(t) || t < 0 || t > 100)) {
      return false
    }
  }

  // Validate settlement reminder days (CSV: "first", "last", "first,last", or empty)
  if (data.settlementReminderDays !== undefined) {
    const days = data.settlementReminderDays.split(",").map((d: string) => d.trim())
    const validDays = ["first", "last", ""]
    if (!days.every((d: string) => validDays.includes(d))) {
      return false
    }
  }

  // Validate recurring reminder days (CSV: "1", "3", "7", or combinations)
  if (data.recurringReminderDays !== undefined) {
    const days = data.recurringReminderDays.split(",").map((d: string) => d.trim())
    const validDays = ["1", "3", "7", ""]
    if (!days.every((d: string) => validDays.includes(d))) {
      return false
    }
  }

  return true
}

// GET - Fetch notification preferences for a user
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

    // Fetch preferences (may be null if not set yet)
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: requestedUserId },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    )
  }
}

// PUT - Create or update notification preferences
export async function PUT(req: NextRequest) {
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

    // Validate data
    if (!validatePreferences(data)) {
      return NextResponse.json(
        { error: "Invalid notification preferences data" },
        { status: 400 }
      )
    }

    // Upsert (create or update) preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: requestedUserId },
      update: {
        budgetAlertsEnabled: data.budgetAlertsEnabled ?? undefined,
        budgetAlertThresholds: data.budgetAlertThresholds ?? undefined,
        settlementRemindersEnabled: data.settlementRemindersEnabled ?? undefined,
        settlementReminderDays: data.settlementReminderDays ?? undefined,
        recurringRemindersEnabled: data.recurringRemindersEnabled ?? undefined,
        recurringReminderDays: data.recurringReminderDays ?? undefined,
        emailEnabled: data.emailEnabled ?? undefined,
      },
      create: {
        userId: requestedUserId,
        budgetAlertsEnabled: data.budgetAlertsEnabled ?? true,
        budgetAlertThresholds: data.budgetAlertThresholds ?? "75,90,100",
        settlementRemindersEnabled: data.settlementRemindersEnabled ?? true,
        settlementReminderDays: data.settlementReminderDays ?? "first,last",
        recurringRemindersEnabled: data.recurringRemindersEnabled ?? true,
        recurringReminderDays: data.recurringReminderDays ?? "1,3,7",
        emailEnabled: data.emailEnabled ?? true,
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    )
  }
}
