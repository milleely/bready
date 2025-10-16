"use client"

import { useRouter, usePathname } from "next/navigation"
import { useSwipeable } from "react-swipeable"
import { ReactNode, useState } from "react"
import { cn } from "@/lib/utils"

interface MobilePageSwiperProps {
  children: ReactNode
}

// Page navigation order
const PAGE_ORDER = ["/dashboard", "/expenses", "/budgets", "/insights"]

export function MobilePageSwiper({ children }: MobilePageSwiperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)

  const getCurrentPageIndex = () => {
    return PAGE_ORDER.findIndex(path => pathname === path || pathname.startsWith(path + '/'))
  }

  const navigateToPage = (direction: "left" | "right") => {
    const currentIndex = getCurrentPageIndex()
    if (currentIndex === -1) return // Not a swipeable page

    let newIndex: number
    if (direction === "left") {
      // Swipe left = go to next page
      newIndex = currentIndex + 1
    } else {
      // Swipe right = go to previous page
      newIndex = currentIndex - 1
    }

    // Boundary checks
    if (newIndex < 0 || newIndex >= PAGE_ORDER.length) return

    // Set animation direction and navigate
    setSwipeDirection(direction)

    // Small delay to allow animation to start before navigation
    setTimeout(() => {
      router.push(PAGE_ORDER[newIndex])
      // Reset animation after navigation
      setTimeout(() => setSwipeDirection(null), 300)
    }, 50)
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => navigateToPage("left"),
    onSwipedRight: () => navigateToPage("right"),
    trackMouse: false, // Only track touch, not mouse
    trackTouch: true,
    delta: 50, // Minimum swipe distance (px)
    preventScrollOnSwipe: false, // Allow vertical scrolling while detecting horizontal swipes
    swipeDuration: 500, // Maximum swipe duration (ms)
  })

  return (
    <div
      {...handlers}
      className={cn(
        "transition-transform duration-300 ease-out md:transform-none",
        swipeDirection === "left" && "mobile-swipe-left",
        swipeDirection === "right" && "mobile-swipe-right"
      )}
    >
      {children}
    </div>
  )
}
