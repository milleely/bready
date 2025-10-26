import { NetWorthPageContent } from "@/components/networth-page-content"
import { prisma } from "@/lib/db"

export default async function NetWorthPage() {
  // Fetch all users for user selection (exclude placeholder users)
  const users = await prisma.user.findMany({
    where: {
      name: {
        not: "User", // Exclude generic "User" placeholders from seed data
      },
    },
    orderBy: { name: "asc" },
  })

  return <NetWorthPageContent initialUsers={users} />
}
