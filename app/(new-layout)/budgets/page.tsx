import { BudgetsPageContent } from "@/components/budgets-page-content"
import { MobilePageSwiper } from "@/components/mobile-page-swiper"

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return (
    <MobilePageSwiper>
      <BudgetsPageContent month={month as string | undefined} />
    </MobilePageSwiper>
  )
}
