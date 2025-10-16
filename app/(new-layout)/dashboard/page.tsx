import { Suspense } from "react"
import { DashboardPageContent } from "@/components/dashboard-page-content"
import { Wallet } from "lucide-react"

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wallet className="h-12 w-12 animate-pulse mx-auto mb-4 text-amber-600" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  )
}
