import { InsightsPageContent } from "@/components/insights-page-content"
import { MobilePageSwiper } from "@/components/mobile-page-swiper"

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return (
    <MobilePageSwiper>
      <InsightsPageContent month={month as string | undefined} />
    </MobilePageSwiper>
  )
}
