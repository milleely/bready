import { DashboardPageContent } from "@/components/dashboard-page-content"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return <DashboardPageContent month={month as string | undefined} />
}
