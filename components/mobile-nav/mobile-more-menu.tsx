"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Scale, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MoreMenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const moreMenuItems: MoreMenuItem[] = [
  {
    title: "Settlements",
    href: "/settlements",
    icon: Scale,
    description: "Balance and settle shared expenses",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Manage household and preferences",
  },
]

interface MobileMoreMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMoreMenu({ isOpen, onClose }: MobileMoreMenuProps) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl md:hidden transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="More menu"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-amber-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-[hsl(var(--border-golden-crust))]">
          <h2 className="text-lg font-semibold text-amber-900">More</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-amber-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-amber-700" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 pb-6">
          {moreMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-xl transition-all",
                  isActive
                    ? "bg-amber-50 text-amber-900 toast-texture-subtle"
                    : "text-amber-800 hover:bg-amber-50"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-lg",
                  isActive ? "bg-amber-100" : "bg-amber-50"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-amber-700" : "text-amber-600"
                  )} />
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "font-semibold text-sm",
                    isActive && "text-amber-900"
                  )}>
                    {item.title}
                  </div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Safe area spacer for iPhones */}
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </>
  )
}
