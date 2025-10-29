/**
 * Activity Tracker for Net Worth Sessions
 *
 * Updates the lastActivityAt timestamp to keep sessions alive during active use.
 * This prevents 30-minute inactivity timeout while user is actively using the dashboard.
 */

import { cookies } from "next/headers"
import type { NetWorthSession } from "./session"

const SESSION_COOKIE_NAME = "networth_session"
const SESSION_TIMEOUT_DAYS = 7 // Must match session.ts constant

/**
 * Update the last activity timestamp in the current session
 * Call this on every authenticated Net Worth API request
 *
 * @returns true if activity was updated, false if no active session
 */
export async function updateActivity(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
      return false
    }

    const session: NetWorthSession = JSON.parse(sessionCookie.value)

    // Update last activity timestamp
    session.lastActivityAt = Date.now()

    // Write updated session back to cookie
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_TIMEOUT_DAYS * 24 * 60 * 60,
      path: "/",
    })

    return true
  } catch (error) {
    console.error("Failed to update activity:", error)
    return false
  }
}
