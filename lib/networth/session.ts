/**
 * Net Worth Session Management
 *
 * Manages user authentication sessions for the Net Worth dashboard.
 * Sessions are stored in localStorage with a 30-minute timeout.
 */

const SESSION_KEY = "networth_session"
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export interface NetWorthSession {
  userId: string
  authenticatedAt: number // Timestamp
  expiresAt: number // Timestamp
}

/**
 * Create a new session for a user
 * @param userId - The user ID to create session for
 */
export function createSession(userId: string): NetWorthSession {
  const now = Date.now()
  const session: NetWorthSession = {
    userId,
    authenticatedAt: now,
    expiresAt: now + SESSION_TIMEOUT_MS,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  return session
}

/**
 * Get the current active session
 * @returns The active session or null if no valid session exists
 */
export function getSession(): NetWorthSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const sessionData = localStorage.getItem(SESSION_KEY)
  if (!sessionData) {
    return null
  }

  try {
    const session: NetWorthSession = JSON.parse(sessionData)

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearSession()
      return null
    }

    return session
  } catch {
    // Invalid session data, clear it
    clearSession()
    return null
  }
}

/**
 * Check if there is an active session
 * @returns true if session exists and is valid, false otherwise
 */
export function hasActiveSession(): boolean {
  return getSession() !== null
}

/**
 * Get the authenticated user ID from the current session
 * @returns The user ID or null if no active session
 */
export function getAuthenticatedUserId(): string | null {
  const session = getSession()
  return session?.userId ?? null
}

/**
 * Extend the current session by resetting the expiration time
 * Useful for keeping sessions alive during active use
 */
export function extendSession(): void {
  const session = getSession()
  if (!session) {
    return
  }

  session.expiresAt = Date.now() + SESSION_TIMEOUT_MS

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
}

/**
 * Clear the current session (logout)
 */
export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY)
  }
}

/**
 * Get the remaining time in the current session (in milliseconds)
 * @returns Remaining time or 0 if no active session
 */
export function getSessionRemainingTime(): number {
  const session = getSession()
  if (!session) {
    return 0
  }

  const remaining = session.expiresAt - Date.now()
  return Math.max(0, remaining)
}

/**
 * Format remaining session time as a readable string
 * @returns Formatted time string like "25 minutes" or "Session expired"
 */
export function formatSessionRemainingTime(): string {
  const remaining = getSessionRemainingTime()

  if (remaining === 0) {
    return "Session expired"
  }

  const minutes = Math.ceil(remaining / 60000)
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`
}
