"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, Target, Brain, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileMoreMenu } from "./mobile-more-menu"

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
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          // Show nav when scrolling up or at top (within 50px)
          if (currentScrollY < 50) {
            setIsVisible(true)
          } else if (currentScrollY < lastScrollY - 20) {
            // Scrolling up - show nav
            setIsVisible(true)
          } else if (currentScrollY > lastScrollY + 50) {
            // Scrolling down - hide nav
            setIsVisible(false)
          }

          setLastScrollY(currentScrollY)
          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Check if current page is in More menu
  const moreMenuPages = ["/settlements", "/settings"]
  const isMoreMenuActive = moreMenuPages.some(page => pathname === page || pathname.startsWith(page + '/'))

  return (
    <>
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-[hsl(var(--border-golden-crust))] px-4 py-2 safe-area-inset-bottom md:hidden transition-transform duration-300 ease-in-out",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
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

        {/* More Button */}
        <button
          onClick={() => setMoreMenuOpen(true)}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px]",
            isMoreMenuActive
              ? "text-amber-700 bg-amber-50"
              : "text-gray-600 hover:text-amber-700 hover:bg-amber-50/50"
          )}
          aria-label="More menu"
          aria-expanded={moreMenuOpen}
        >
          <MoreHorizontal className={cn("h-5 w-5", isMoreMenuActive && "text-amber-700")} />
          <span className={cn("text-[10px] font-medium", isMoreMenuActive && "font-semibold")}>
            More
          </span>
        </button>
      </nav>

      {/* More Menu Bottom Sheet */}
      <MobileMoreMenu
        isOpen={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
      />
    </>
  )
}
