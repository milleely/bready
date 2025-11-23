/**
 * POST /api/networth/carry-forward
 *
 * Bulk copy all net worth records from source month to target month.
 * Used for:
 * 1. Automatic copy-all when first editing inherited data
 * 2. Manual "Copy to Next Month" button
 *
 * Skips duplicates based on [userId, month, name] unique constraint.
 */

import { NextRequest, NextResponse } from "next/server"
import { getHouseholdId } from "@/lib/auth"
import { prisma } from "@/lib/db"

type DataType = "assets" | "liabilities" | "income"

interface CarryForwardRequest {
  userId: string
  sourceMonth: string
  targetMonth: string
  dataTypes: DataType[]
}

interface CopiedCounts {
  assets: number
  liabilities: number
  income: number
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body: CarryForwardRequest = await req.json()
    const { userId, sourceMonth, targetMonth, dataTypes } = body

    // Validate required fields
    if (!userId || !sourceMonth || !targetMonth || !dataTypes?.length) {
      return NextResponse.json(
        { error: "Missing required fields: userId, sourceMonth, targetMonth, dataTypes" },
        { status: 400 }
      )
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/
    if (!monthRegex.test(sourceMonth) || !monthRegex.test(targetMonth)) {
      return NextResponse.json(
        { error: "Invalid month format. Use YYYY-MM" },
        { status: 400 }
      )
    }

    // Don't allow copying to the same month
    if (sourceMonth === targetMonth) {
      return NextResponse.json(
        { error: "Source and target months must be different" },
        { status: 400 }
      )
    }

    // Verify the userId belongs to the authenticated user's household
    const user = await prisma.user.findFirst({
      where: { id: userId, householdId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in your household" },
        { status: 403 }
      )
    }

    const copiedCounts: CopiedCounts = {
      assets: 0,
      liabilities: 0,
      income: 0,
    }

    // Copy assets if requested
    if (dataTypes.includes("assets")) {
      const sourceAssets = await prisma.asset.findMany({
        where: { userId, month: sourceMonth },
      })

      for (const asset of sourceAssets) {
        // Check if already exists in target month
        const existing = await prisma.asset.findFirst({
          where: { userId, month: targetMonth, name: asset.name },
        })

        if (!existing) {
          await prisma.asset.create({
            data: {
              userId,
              month: targetMonth,
              category: asset.category,
              name: asset.name,
              value: asset.value,
              notes: asset.notes,
            },
          })
          copiedCounts.assets++
        }
      }
    }

    // Copy liabilities if requested
    if (dataTypes.includes("liabilities")) {
      const sourceLiabilities = await prisma.liability.findMany({
        where: { userId, month: sourceMonth },
      })

      for (const liability of sourceLiabilities) {
        // Check if already exists in target month
        const existing = await prisma.liability.findFirst({
          where: { userId, month: targetMonth, name: liability.name },
        })

        if (!existing) {
          await prisma.liability.create({
            data: {
              userId,
              month: targetMonth,
              category: liability.category,
              name: liability.name,
              balance: liability.balance,
              interestRate: liability.interestRate,
              minimumPayment: liability.minimumPayment,
              notes: liability.notes,
            },
          })
          copiedCounts.liabilities++
        }
      }
    }

    // Copy income sources if requested
    if (dataTypes.includes("income")) {
      const sourceIncome = await prisma.incomeSource.findMany({
        where: { userId, month: sourceMonth },
      })

      for (const income of sourceIncome) {
        // Check if already exists in target month
        const existing = await prisma.incomeSource.findFirst({
          where: { userId, month: targetMonth, name: income.name },
        })

        if (!existing) {
          await prisma.incomeSource.create({
            data: {
              userId,
              month: targetMonth,
              name: income.name,
              amount: income.amount,
              frequency: income.frequency,
            },
          })
          copiedCounts.income++
        }
      }
    }

    const totalCopied = copiedCounts.assets + copiedCounts.liabilities + copiedCounts.income

    return NextResponse.json({
      success: true,
      copiedCounts,
      totalCopied,
      message: totalCopied > 0
        ? `Copied ${totalCopied} records from ${sourceMonth} to ${targetMonth}`
        : `No new records to copy (all already exist in ${targetMonth})`,
    })
  } catch (error) {
    console.error("Error in carry-forward:", error)
    return NextResponse.json(
      { error: "Failed to carry forward data" },
      { status: 500 }
    )
  }
}
