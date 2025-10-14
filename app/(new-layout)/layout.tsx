import { SidebarLayout } from "@/components/sidebar-layout"

export default function NewLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <SidebarLayout>{children}</SidebarLayout>
}
