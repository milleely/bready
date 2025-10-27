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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Assets</h2>
              <p className="text-sm text-stone-600">
                Total: ${totalAssets.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Button
            onClick={onAdd}
            size="sm"
            className="flex items-center bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
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
                <div className="space-y-2 ml-4">
                  {categoryGroup.items.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-[hsl(var(--border-light-crust))] hover:border-[hsl(var(--border-golden-crust))] transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-stone-900">{asset.name}</p>
                        {asset.notes && (
                          <p className="text-xs text-stone-500 mt-1">{asset.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-stone-900">
                          ${asset.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <div className="flex items-center gap-2">
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
