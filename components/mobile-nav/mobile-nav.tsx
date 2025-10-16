"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, Target, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: Target,
  },
  {
    title: "Insights",
    href: "/insights",
    icon: Brain,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px]",
              isActive
                ? "text-amber-700 bg-amber-50"
                : "text-gray-600 hover:text-amber-700 hover:bg-amber-50/50"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "text-amber-700")} />
            <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
              {item.title}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
