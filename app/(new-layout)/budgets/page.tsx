import { BudgetsPageContent } from "@/components/budgets-page-content"

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return <BudgetsPageContent month={month as string | undefined} />
}
