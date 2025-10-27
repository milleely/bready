"use client"

/**
 * Assets Section Component
 *
 * Displays all assets grouped by category with add/edit/delete functionality.
 */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react"
import type { AssetsByCategory } from "@/lib/types/networth"
import type { Asset } from "@/lib/types/networth"
import { getAssetCategoryLabel } from "@/lib/networth/categories"

interface AssetsSectionProps {
  assetsByCategory: AssetsByCategory[]
  totalAssets: number
  onAdd: () => void
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
}

export function AssetsSection({
  assetsByCategory,
  totalAssets,
  onAdd,
  onEdit,
  onDelete,
}: AssetsSectionProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-semibold text-stone-900">Assets</h2>
              <p className="text-xs md:text-sm text-stone-600 truncate">
                Total: ${totalAssets.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Button
            onClick={onAdd}
            size="sm"
            className="flex items-center shrink-0 text-xs md:text-sm bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Asset
          </Button>
        </div>

        {/* Assets List (Grouped by Category) */}
        {assetsByCategory.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            <p className="text-sm">No assets added yet</p>
            <p className="text-xs mt-1">Click "Add Asset" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assetsByCategory.map((categoryGroup) => (
              <div key={categoryGroup.category}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-stone-700">
                    {getAssetCategoryLabel(categoryGroup.category)}
                  </h3>
                  <span className="text-sm font-medium text-emerald-600">
                    ${categoryGroup.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Assets in Category */}
                <div className="space-y-2 pl-4">
                  {categoryGroup.items.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-[hsl(var(--border-light-crust))] hover:border-[hsl(var(--border-golden-crust))] transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-medium text-stone-900 truncate">{asset.name}</p>
                        {asset.notes && (
                          <p className="text-xs text-stone-500 mt-1 truncate">{asset.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <span className="text-sm font-semibold text-stone-900 whitespace-nowrap">
                          ${asset.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <button
                            onClick={() => onEdit(asset)}
                            className="p-2.5 md:p-2 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                            aria-label={`Edit ${asset.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(asset.id)}
                            className="p-2.5 md:p-2 rounded-lg hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors"
                            aria-label={`Delete ${asset.name}`}
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
