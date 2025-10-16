import { Suspense } from "react"
import { InsightsPageContent } from "@/components/insights-page-content"
import { Brain } from "lucide-react"

export default function InsightsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Brain className="h-12 w-12 text-purple-600 mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    }>
      <InsightsPageContent />
    </Suspense>
  )
}
