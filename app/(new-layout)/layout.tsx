import { MonthSelectorWrapper } from "@/components/month-selector-wrapper"
import { getHouseholdId } from "@/lib/auth"

export default async function NewLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Prefetch household creation to ensure it exists before any page loads
  // This eliminates race conditions where UI renders before household creation completes
  // For first-time users, this adds ~500-900ms to initial load but prevents empty state bugs
  await getHouseholdId()

  return <MonthSelectorWrapper>{children}</MonthSelectorWrapper>
}
