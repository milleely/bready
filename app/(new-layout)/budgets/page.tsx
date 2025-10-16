import { Suspense } from "react"
import { BudgetsPageContent } from "@/components/budgets-page-content"

export default function BudgetsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 bg-amber-200 rounded-full mx-auto"></div>
          </div>
          <p className="text-muted-foreground">Loading budgets...</p>
        </div>
      </div>
    }>
      <BudgetsPageContent />
    </Suspense>
  )
}
