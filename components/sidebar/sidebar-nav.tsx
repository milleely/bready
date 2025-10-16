"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, Target, Brain, Settings, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick stats",
  },
  {
    title: "Settlements",
    href: "/settlements",
    icon: Scale,
    description: "Balance payments",
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
    description: "Manage transactions",
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: Target,
    description: "Track your budgets",
  },
  {
    title: "Insights",
    href: "/insights",
    icon: Brain,
    description: "AI-powered analytics",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Manage household",
  },
]

interface SidebarNavProps {
  className?: string
  collapsed?: boolean
}

export function SidebarNav({ className, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("space-y-2", className)}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-amber-100/50",
              isActive
                ? "bg-amber-200/80 text-amber-900 shadow-sm"
                : "text-gray-700 hover:text-amber-900",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-amber-700")} />
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold">{item.title}</div>
                <div className="text-xs text-gray-500 truncate">{item.description}</div>
              </div>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
