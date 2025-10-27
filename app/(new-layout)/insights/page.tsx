import { NetWorthPageContent } from "@/components/networth-page-content"
import { prisma } from "@/lib/db"

export default async function NetWorthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Fetch all users for user selection (exclude placeholder users)
  const users = await prisma.user.findMany({
    where: {
      name: {
        not: "User", // Exclude generic "User" placeholders from seed data
      },
    },
    orderBy: { name: "asc" },
  })

  // Get month from URL params
  const { month } = await searchParams

  return <NetWorthPageContent initialUsers={users} month={month as string | undefined} />
}
