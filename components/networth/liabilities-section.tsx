"use client"

/**
 * Liabilities Section Component
 *
 * Displays all liabilities (debts) grouped by category with add/edit/delete functionality.
 */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, TrendingDown } from "lucide-react"
import type { LiabilitiesByCategory } from "@/lib/types/networth"
import type { Liability } from "@prisma/client"
import { getLiabilityCategoryLabel } from "@/lib/networth/categories"

interface LiabilitiesSectionProps {
  liabilitiesByCategory: LiabilitiesByCategory[]
  totalLiabilities: number
  onAdd: () => void
  onEdit: (liability: Liability) => void
  onDelete: (id: string) => void
}

export function LiabilitiesSection({
  liabilitiesByCategory,
  totalLiabilities,
  onAdd,
  onEdit,
  onDelete,
}: LiabilitiesSectionProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-100">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Liabilities</h2>
              <p className="text-sm text-stone-600">
                Total: ${totalLiabilities.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Button
            onClick={onAdd}
            size="sm"
            className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Liability
          </Button>
        </div>

        {/* Liabilities List (Grouped by Category) */}
        {liabilitiesByCategory.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            <p className="text-sm">No liabilities added yet</p>
            <p className="text-xs mt-1">Click "Add Liability" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {liabilitiesByCategory.map((categoryGroup) => (
              <div key={categoryGroup.category}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-stone-700">
                    {getLiabilityCategoryLabel(categoryGroup.category)}
                  </h3>
                  <span className="text-sm font-medium text-red-600">
                    ${categoryGroup.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Liabilities in Category */}
                <div className="space-y-2 ml-4">
                  {categoryGroup.items.map((liability) => (
                    <div
                      key={liability.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-[hsl(var(--border-light-crust))] hover:border-[hsl(var(--border-golden-crust))] transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-stone-900">{liability.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-stone-500">
                          {liability.interestRate != null && (
                            <span>{liability.interestRate.toFixed(2)}% APR</span>
                          )}
                          {liability.minimumPayment != null && (
                            <span>
                              ${liability.minimumPayment.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              min. payment
                            </span>
                          )}
                        </div>
                        {liability.notes && (
                          <p className="text-xs text-stone-500 mt-1">{liability.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-stone-900">
                          ${liability.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(liability)}
                            className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                            aria-label={`Edit ${liability.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(liability.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors"
                            aria-label={`Delete ${liability.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
