/**
 * Net Worth Session Management (SECURE VERSION)
 *
 * Manages user authentication sessions for the Net Worth dashboard using httpOnly cookies.
 * Sessions are stored in secure, httpOnly cookies that are inaccessible to JavaScript (XSS protection).
 *
 * Security features:
 * - httpOnly: Cookies cannot be accessed via JavaScript
 * - Secure: Cookies only sent over HTTPS in production
 * - SameSite=Strict: CSRF protection
 * - 7-day expiration with automatic cleanup
 */

import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "networth_session"
const SESSION_TIMEOUT_DAYS = 7 // 7 days absolute expiration
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes of inactivity

export interface NetWorthSession {
  userId: string
  authenticatedAt: number // Timestamp when session was created
  expiresAt: number // Absolute expiration timestamp (7 days)
  lastActivityAt: number // Last activity timestamp (for 30-min timeout)
}

/**
 * Create a new session for a user (SERVER-SIDE ONLY)
 * Sets a secure httpOnly cookie that cannot be accessed by JavaScript
 *
 * @param userId - The user ID to create session for
 */
export async function createSession(userId: string): Promise<NetWorthSession> {
  const now = Date.now()
  const expiresAt = now + SESSION_TIMEOUT_DAYS * 24 * 60 * 60 * 1000 // 7 days

  const session: NetWorthSession = {
    userId,
    authenticatedAt: now,
    expiresAt,
    lastActivityAt: now, // Initialize activity timestamp
  }

  const cookieStore = await cookies()

  // Set httpOnly cookie with security flags
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // CSRF protection
    maxAge: SESSION_TIMEOUT_DAYS * 24 * 60 * 60, // 7 days in seconds
    path: "/", // Available across entire app
  })

  return session
}

/**
 * Get the current active session (SERVER-SIDE ONLY)
 * Reads from httpOnly cookie
 *
 * @returns The active session or null if no valid session exists
 */
export async function getSession(): Promise<NetWorthSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session: NetWorthSession = JSON.parse(sessionCookie.value)
    const now = Date.now()

    // Check if session has expired (absolute 7-day limit)
    if (now > session.expiresAt) {
      await clearSession()
      return null
    }

    // Check if session is inactive (30 minutes of inactivity)
    if (now - session.lastActivityAt > INACTIVITY_TIMEOUT_MS) {
      await clearSession()
      return null
    }

    return session
  } catch {
    // Invalid session data, clear it
    await clearSession()
    return null
  }
}

/**
 * Check if there is an active session (SERVER-SIDE ONLY)
 *
 * @returns true if session exists and is valid, false otherwise
 */
export async function hasActiveSession(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Get the authenticated user ID from the current session (SERVER-SIDE ONLY)
 *
 * @returns The user ID or null if no active session
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.userId ?? null
}

/**
 * Extend the current session by resetting the expiration time (SERVER-SIDE ONLY)
 * Useful for keeping sessions alive during active use
 */
export async function extendSession(): Promise<void> {
  const session = await getSession()
  if (!session) {
    return
  }

  const now = Date.now()

  // Update both expiration time and last activity
  session.expiresAt = now + SESSION_TIMEOUT_DAYS * 24 * 60 * 60 * 1000
  session.lastActivityAt = now

  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_TIMEOUT_DAYS * 24 * 60 * 60,
    path: "/",
  })
}

/**
 * Clear the current session (logout) (SERVER-SIDE ONLY)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Get the remaining time in the current session (in milliseconds) (SERVER-SIDE ONLY)
 *
 * @returns Remaining time or 0 if no active session
 */
export async function getSessionRemainingTime(): Promise<number> {
  const session = await getSession()
  if (!session) {
    return 0
  }

  const remaining = session.expiresAt - Date.now()
  return Math.max(0, remaining)
}

/**
 * Format remaining session time as a readable string (SERVER-SIDE ONLY)
 *
 * @returns Formatted time string like "6 days" or "Session expired"
 */
export async function formatSessionRemainingTime(): Promise<string> {
  const remaining = await getSessionRemainingTime()

  if (remaining === 0) {
    return "Session expired"
  }

  const days = Math.ceil(remaining / (24 * 60 * 60 * 1000))

  if (days > 1) {
    return `${days} days`
  }

  const hours = Math.ceil(remaining / (60 * 60 * 1000))
  return `${hours} hour${hours !== 1 ? "s" : ""}`
}
