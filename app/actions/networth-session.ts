/**
 * Server Actions for Net Worth Session Management
 *
 * These server actions allow client components to interact with httpOnly cookies
 * through Next.js server actions (secure by default).
 */

"use server"

import { clearSession, getSession, createSession } from "@/lib/networth/session"
import { revalidatePath } from "next/cache"

/**
 * Logout action - clears the session cookie
 * Can be called from client components
 */
export async function logoutAction() {
  await clearSession()
  revalidatePath("/networth")
  return { success: true }
}

/**
 * Check if user is authenticated
 * Can be called from client components
 */
export async function checkAuthAction(): Promise<{ authenticated: boolean; userId: string | null }> {
  const session = await getSession()
  return {
    authenticated: session !== null,
    userId: session?.userId ?? null,
  }
}

/**
 * Create session action - for PIN verification flow
 * Can be called from client components after successful PIN verification
 */
export async function createSessionAction(userId: string) {
  try {
    await createSession(userId)
    revalidatePath("/networth")
    return { success: true }
  } catch (error) {
    console.error("Failed to create session:", error)
    return { success: false, error: "Failed to create session" }
  }
}
