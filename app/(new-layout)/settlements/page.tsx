import { SettlementsPageContent } from "@/components/settlements-page-content"

export default async function SettlementsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return <SettlementsPageContent month={month as string | undefined} />
}
