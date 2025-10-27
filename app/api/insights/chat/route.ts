import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import { getOpenAIClient, isOpenAIConfigured } from '@/lib/openai'

/**
 * POST /api/insights/chat
 *
 * AI-powered chat endpoint for financial insights.
 * Uses GPT-4o to answer questions about spending, budgets, and trends.
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          error: 'OpenAI not configured',
          message:
            'Add your OpenAI API key to .env.local to enable AI chat. Get a key from https://platform.openai.com/api-keys',
        },
        { status: 503 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { message, month } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get current month if not provided
    const selectedMonth =
      month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

    // Parse month
    const [year, monthNum] = selectedMonth.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59)

    // Fetch data in parallel
    const [expenses, budgets, users] = await Promise.all([
      prisma.expense.findMany({
        where: {
          user: { householdId },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { user: true },
        orderBy: { date: 'desc' },
      }),
      prisma.budget.findMany({
        where: {
          householdId,
          month: selectedMonth,
        },
      }),
      prisma.user.findMany({
        where: { householdId },
      }),
    ])

    // Calculate stats
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const sharedExpenses = expenses
      .filter((exp) => exp.isShared)
      .reduce((sum, exp) => sum + exp.amount, 0)

    // Spending by category
    const categoryMap = new Map<string, number>()
    expenses.forEach((exp) => {
      categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount)
    })

    const spendingByCategory = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    // Spending per person
    const spendingPerPerson = users.map((user) => {
      const userExpenses = expenses.filter((exp) => exp.userId === user.id)
      const total = userExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const shared = userExpenses
        .filter((exp) => exp.isShared)
        .reduce((sum, exp) => sum + exp.amount, 0)
      const personal = total - shared

      return {
        name: user.name,
        total,
        shared,
        personal,
      }
    })

    // Budget status
    const budgetStatus = budgets.map((budget) => {
      let spent = 0
      if (budget.userId) {
        // Personal budget
        spent = expenses
          .filter((exp) => exp.userId === budget.userId && exp.category === budget.category)
          .reduce((sum, exp) => sum + exp.amount, 0)
      } else {
        // Shared budget
        spent = categoryMap.get(budget.category) || 0
      }

      const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      const user = users.find((u) => u.id === budget.userId)

      return {
        category: budget.category,
        owner: user ? user.name : 'Shared',
        budgeted: budget.amount,
        spent,
        percentUsed: Math.round(percentUsed),
        status:
          percentUsed > 100 ? 'over' : percentUsed >= 80 ? 'approaching' : 'on-track',
      }
    })

    // Build context for AI
    const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })

    const context = `
You are Toasty 🍞, a friendly financial assistant helping a household manage their budget.

**Current Month:** ${monthName}

**Household Members:** ${users.map((u) => u.name).join(', ')}

**Total Spending:** $${totalSpent.toFixed(2)}
- Shared expenses: $${sharedExpenses.toFixed(2)}
- Personal expenses: $${(totalSpent - sharedExpenses).toFixed(2)}

**Top Spending Categories:**
${spendingByCategory
  .slice(0, 5)
  .map((c) => `- ${c.category}: $${c.amount.toFixed(2)}`)
  .join('\n')}

**Spending by Person:**
${spendingPerPerson
  .map(
    (p) =>
      `- ${p.name}: $${p.total.toFixed(2)} total ($${p.personal.toFixed(2)} personal + $${p.shared.toFixed(2)} shared)`
  )
  .join('\n')}

**Budget Status:**
${budgetStatus
  .map(
    (b) =>
      `- ${b.owner} ${b.category}: $${b.spent.toFixed(2)} / $${b.budgeted.toFixed(2)} (${b.percentUsed}% used) - ${b.status}`
  )
  .join('\n')}

---

Answer the user's question based on this data. Be friendly, concise (2-3 sentences), and use emojis sparingly. If asked about saving opportunities, look for categories with high spending or over-budget items. If asked about trends, note that you only have current month data (no historical comparison available yet).
`.trim()

    // Call OpenAI
    const openai = getOpenAIClient()
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI client initialization failed' },
        { status: 500 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: context,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const answer = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'

    return NextResponse.json({
      answer,
      conversationId: crypto.randomUUID(), // For future multi-turn conversations
    })
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to process chat:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        {
          error: 'Invalid API key',
          message: 'Check that your OPENAI_API_KEY is valid and has credits available.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
