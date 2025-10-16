import { DashboardPageContent } from "@/components/dashboard-page-content"
import { MobilePageSwiper } from "@/components/mobile-page-swiper"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { month } = await searchParams

  return (
    <MobilePageSwiper>
      <DashboardPageContent month={month as string | undefined} />
    </MobilePageSwiper>
  )
}
