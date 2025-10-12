import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from './db'

/**
 * Get the current authenticated user from Clerk
 * Returns the userId (Clerk ID) or null if not authenticated
 */
export async function getCurrentUserId() {
  const { userId } = await auth()
  return userId
}

/**
 * Require authentication for an API route
 * Returns the userId if authenticated, or a 401 response if not
 *
 * Usage in API routes:
 * ```
 * const userId = await requireAuth()
 * if (userId instanceof NextResponse) return userId // Return 401 if not authenticated
 * // Continue with authenticated logic
 * ```
 */
export async function requireAuth() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    )
  }

  return userId
}

/**
 * Get or create a household for the authenticated Clerk user
 * This ensures every Clerk user has a household on first access
 *
 * @param clerkId - The Clerk user ID
 * @returns The household record
 */
export async function getOrCreateHousehold(clerkId: string) {
  // Try to find existing household
  let household = await prisma.household.findUnique({
    where: { clerkId },
    include: { users: true },
  })

  // If no household exists, create one
  if (!household) {
    try {
      const clerkUser = await auth()

      household = await prisma.household.create({
        data: {
          clerkId,
          name: 'My Household', // Default name, user can change later
          users: {
            create: {
              name: clerkUser.sessionClaims?.email?.toString().split('@')[0] || 'User',
              email: clerkUser.sessionClaims?.email?.toString() || '',
              color: '#f59e0b', // Default amber color
              isOwner: true,
            },
          },
        },
        include: { users: true },
      })
    } catch (error: any) {
      // Handle race condition: if household was created by another request
      if (error.code === 'P2002') {
        household = await prisma.household.findUnique({
          where: { clerkId },
          include: { users: true },
        })
      } else {
        throw error
      }
    }
  }

  return household!
}

/**
 * Get the household ID for the current authenticated user
 * Creates the household if it doesn't exist
 *
 * @returns The household ID or a 401 response if not authenticated
 */
export async function getHouseholdId() {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId

  const household = await getOrCreateHousehold(userId)
  return household.id
}
