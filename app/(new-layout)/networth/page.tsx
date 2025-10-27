/**
 * Net Worth Page (Server Component)
 *
 * Server-side wrapper that handles session authentication before rendering.
 * This pattern allows us to use httpOnly cookies (Server-only) while maintaining
 * client-side interactivity for the dashboard.
 */

import { getSession } from "@/lib/networth/session"
import { prisma } from "@/lib/db"
import { NetWorthPageContent } from "@/components/networth-page-content"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NetWorthPage({ searchParams }: PageProps) {
  // Await searchParams to get month parameter (Next.js 15 pattern)
  const params = await searchParams
  const month = params.month as string | undefined

  // Check for existing session (Server-side only - httpOnly cookie access)
  const session = await getSession()

  // Fetch all users for user selector
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <NetWorthPageContent
      initialUsers={users}
      authenticated={session !== null}
      userId={session?.userId ?? null}
      month={month}
    />
  )
}
