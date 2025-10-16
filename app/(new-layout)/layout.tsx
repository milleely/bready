import { MonthSelectorWrapper } from "@/components/month-selector-wrapper"

export default function NewLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <MonthSelectorWrapper>{children}</MonthSelectorWrapper>
}
