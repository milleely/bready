/**
 * Net Worth Page (Server Component)
 *
 * Server-side wrapper that handles session authentication before rendering.
 * This pattern allows us to use httpOnly cookies (Server-only) while maintaining
 * client-side interactivity for the dashboard.
 */

import { getSession } from "@/lib/networth/session"
import { prisma } from "@/lib/db"
import { getHouseholdId } from "@/lib/auth"
import { NetWorthPageContent } from "@/components/networth-page-content"
import { NextResponse } from "next/server"

// Force dynamic rendering for cookie-based authentication
// Required for Next.js 15 async cookies() pattern
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Ensure Node.js runtime (not Edge)

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NetWorthPage({ searchParams }: PageProps) {
  try {
    // Await searchParams to get month parameter (Next.js 15 pattern)
    const params = await searchParams
    const month = params.month as string | undefined

    // Check for existing session (Server-side only - httpOnly cookie access)
    const session = await getSession()

    // Get household ID for filtering users
    // If not authenticated, getHouseholdId returns error response but middleware should handle redirects
    const householdIdOrError = await getHouseholdId()
    const householdId = householdIdOrError instanceof NextResponse ? '' : householdIdOrError

    // Fetch only users from authenticated user's household
    const users = householdId
      ? await prisma.user.findMany({
          where: { householdId },
          orderBy: { name: "asc" },
        })
      : []

    return (
      <NetWorthPageContent
        initialUsers={users}
        authenticated={session !== null}
        userId={session?.userId ?? null}
        month={month}
      />
    )
  } catch (error) {
    // Production error logging
    console.error('[NetWorth Page Error]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    // User-friendly error display
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-900 mb-4">
            Unable to Load Net Worth
          </h1>
          <p className="text-red-700 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <p className="text-sm text-red-600">
            Please try refreshing the page. If the problem persists, contact support.
          </p>
        </div>
      </div>
    )
  }
}
