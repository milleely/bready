import { InsightsPageContent } from "@/components/insights-page-content"

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return <InsightsPageContent month={month as string | undefined} />
}
