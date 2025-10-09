"use client"

import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#f43f5e' },
]

export function ColorPicker({ value, onChange, label = "Color" }: ColorPickerProps) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`
              h-10 w-10 rounded-lg border-2 transition-all hover:scale-110
              ${value === color.value ? 'border-foreground ring-2 ring-offset-2 ring-foreground' : 'border-border'}
            `}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={`Select ${color.name}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div
          className="h-4 w-4 rounded border border-border"
          style={{ backgroundColor: value }}
        />
        <span>Selected: {PRESET_COLORS.find(c => c.value === value)?.name || 'Custom'}</span>
      </div>
    </div>
  )
}
