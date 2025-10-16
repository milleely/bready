import { ExpensesPageContent } from "@/components/expenses-page-content"
import { MobilePageSwiper } from "@/components/mobile-page-swiper"

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return (
    <MobilePageSwiper>
      <ExpensesPageContent month={month as string | undefined} />
    </MobilePageSwiper>
  )
}
