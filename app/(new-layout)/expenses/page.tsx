import { ExpensesPageContent } from "@/components/expenses-page-content"

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return <ExpensesPageContent month={month as string | undefined} />
}
