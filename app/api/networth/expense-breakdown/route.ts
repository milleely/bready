import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { categorizeBudgetType } from "@/lib/networth/category-mapping"

export async function GET(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get("userId")

    if (!requestedUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Verify the userId belongs to the authenticated user's household
    const user = await prisma.user.findFirst({
      where: {
        id: requestedUserId,
        householdId,
      },
      select: { householdId: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in your household" },
        { status: 403 }
      )
    }

    // Get all household member IDs for shared expense queries
    const householdUsers = await prisma.user.findMany({
      where: { householdId: user.householdId },
      select: { id: true }
    })

    const householdUserIds = householdUsers.map(u => u.id)
    const userCount = householdUsers.length

    // Get current month boundaries
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Query 1: Your expenses (personal 100% + shared ÷ userCount)
    const userExpenses = await prisma.expense.findMany({
      where: {
        userId: requestedUserId,  // Only your expenses
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        amount: true,
        category: true,
        isShared: true,
      },
    })

    // Query 2: Other household members' SHARED expenses (÷ userCount)
    const otherSharedExpenses = await prisma.expense.findMany({
      where: {
        userId: { in: householdUserIds, not: requestedUserId },  // Other members only
        isShared: true,  // Only shared expenses
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        amount: true,
        category: true,
      },
    })

    // Calculate totals by budget category
    let needsSpent = 0
    let wantsSpent = 0
    let otherSpent = 0

    // Process YOUR expenses
    userExpenses.forEach((expense) => {
      const budgetCategory = categorizeBudgetType(expense.category)

      // Personal: 100%, Shared: your portion (÷ userCount)
      const amount = expense.isShared
        ? expense.amount / Math.max(userCount, 1)
        : expense.amount

      switch (budgetCategory) {
        case "needs":
          needsSpent += amount
          break
        case "wants":
          wantsSpent += amount
          break
        case "other":
          otherSpent += amount
          break
      }
    })

    // Process OTHER household members' SHARED expenses
    otherSharedExpenses.forEach((expense) => {
      const budgetCategory = categorizeBudgetType(expense.category)

      // Always divide by userCount (these are all shared)
      const yourShare = expense.amount / Math.max(userCount, 1)

      switch (budgetCategory) {
        case "needs":
          needsSpent += yourShare
          break
        case "wants":
          wantsSpent += yourShare
          break
        case "other":
          otherSpent += yourShare
          break
      }
    })

    return NextResponse.json({
      needsSpent: Math.round(needsSpent * 100) / 100, // Round to 2 decimals
      wantsSpent: Math.round(wantsSpent * 100) / 100,
      savingsSpent: 0, // Not tracking yet - future feature
      total: Math.round((needsSpent + wantsSpent + otherSpent) * 100) / 100,
    })
  } catch (error) {
    console.error("Error fetching expense breakdown:", error)
    return NextResponse.json(
      { error: "Failed to fetch expense breakdown" },
      { status: 500 }
    )
  }
}
