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

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NetWorthPage({ searchParams }: PageProps) {
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
}
