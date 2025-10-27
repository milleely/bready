/**
 * Server Actions for Net Worth Session Management
 *
 * These server actions allow client components to interact with httpOnly cookies
 * through Next.js server actions (secure by default).
 */

"use server"

import { clearSession, getSession } from "@/lib/networth/session"
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
