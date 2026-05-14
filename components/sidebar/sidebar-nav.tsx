"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, Target, Wallet, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  kbd?: string
}

const workspaceItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, kbd: "G D" },
  { title: "Expenses", href: "/expenses", icon: Receipt, kbd: "G E" },
  { title: "Budgets", href: "/budgets", icon: Target, kbd: "G B" },
]

const moneyItems: NavItem[] = [
  { title: "Settlements", href: "/settlements", icon: Scale, kbd: "G S" },
  { title: "Net Worth", href: "/networth", icon: Wallet, kbd: "G N" },
]

interface SidebarNavProps {
  className?: string
  collapsed?: boolean
  month?: string | null
}

function NavLink({
  item,
  isActive,
  collapsed,
  month,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  month?: string | null
}) {
  const Icon = item.icon
  return (
    <Link
      href={month ? `${item.href}?month=${month}` : item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-md text-sm font-medium transition-colors",
        // Use a 2px left rule on active rows; pad the rest so contents don't shift
        isActive
          ? "border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          : "border-l-2 border-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100",
        collapsed ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2"
      )}
      title={collapsed ? item.title : undefined}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-amber-700 dark:text-amber-400")} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.kbd && (
            <kbd
              className={cn(
                "hidden lg:inline-flex items-center rounded border border-stone-200 bg-stone-50/80 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-stone-500 transition-opacity",
                "dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              aria-hidden="true"
            >
              {item.kbd}
            </kbd>
          )}
        </>
      )}
    </Link>
  )
}

function NavSection({
  label,
  items,
  collapsed,
  month,
  isActive,
}: {
  label: string
  items: NavItem[]
  collapsed: boolean
  month?: string | null
  isActive: (href: string) => boolean
}) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {label}
        </div>
      )}
      {items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          collapsed={collapsed}
          month={month}
        />
      ))}
    </div>
  )
}

export function SidebarNav({ className, collapsed = false, month }: SidebarNavProps) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <nav className={cn("space-y-5", className)} aria-label="Main navigation">
      <NavSection
        label="Workspace"
        items={workspaceItems}
        collapsed={collapsed}
        month={month}
        isActive={isActive}
      />
      <NavSection
        label="Money"
        items={moneyItems}
        collapsed={collapsed}
        month={month}
        isActive={isActive}
      />
    </nav>
  )
}
