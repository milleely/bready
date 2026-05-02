import { prisma } from '../lib/db'

// Usage:
//   npx tsx scripts/backfill-recurring.ts 2026-05           (dry-run, no writes)
//   npx tsx scripts/backfill-recurring.ts 2026-05 --apply   (actually writes)
const args = process.argv.slice(2)
const targetMonth = args.find((a) => /^\d{4}-\d{2}$/.test(a)) || '2026-05'
const apply = args.includes('--apply')

async function backfillRecurring() {
  if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
    console.error(`Invalid targetMonth "${targetMonth}". Use YYYY-MM format.`)
    process.exit(1)
  }

  if (!apply) {
    console.log('DRY RUN MODE — no database writes will occur. Pass --apply to write.\n')
  } else {
    console.log('APPLY MODE — writing to database.\n')
  }

  const [year, month] = targetMonth.split('-').map(Number)
  const targetMonthStart = new Date(year, month - 1, 1)
  const targetMonthEnd = new Date(year, month, 0)

  console.log(`Backfilling recurring expenses for ${targetMonth}`)
  console.log(`Date range: ${targetMonthStart.toDateString()} - ${targetMonthEnd.toDateString()}\n`)

  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: { isActive: true },
    include: { user: true },
  })

  if (recurringExpenses.length === 0) {
    console.log('No active recurring expenses found.')
    return
  }

  console.log(`Found ${recurringExpenses.length} active recurring expense(s)\n`)

  const recurringIds = recurringExpenses.map((r) => r.id)
  const existingExpenses = await prisma.expense.findMany({
    where: {
      recurringExpenseId: { in: recurringIds },
      date: { gte: targetMonthStart, lte: targetMonthEnd },
    },
    select: { recurringExpenseId: true },
  })

  const existingRecurringIds = new Set(existingExpenses.map((e) => e.recurringExpenseId))

  const created: { description: string; amount: number; date: Date; user: string }[] = []
  let skipped = 0

  for (const recurring of recurringExpenses) {
    if (existingRecurringIds.has(recurring.id)) {
      console.log(`SKIP: "${recurring.description}" (${recurring.user.name}) already has expense for ${targetMonth}`)
      skipped++
      continue
    }

    let expenseDate: Date | null = null

    if (recurring.frequency === 'monthly') {
      const lastDay = targetMonthEnd.getDate()
      const day =
        recurring.dayOfMonth === -1
          ? lastDay
          : Math.min(recurring.dayOfMonth || 1, lastDay)
      expenseDate = new Date(year, month - 1, day)
    } else if (recurring.frequency === 'yearly') {
      const recurringMonth = recurring.monthOfYear || 1
      if (recurringMonth !== month) {
        console.log(`SKIP: "${recurring.description}" is yearly (month ${recurringMonth}), not for ${targetMonth}`)
        skipped++
        continue
      }
      const day = recurring.dayOfMonth || 1
      expenseDate = new Date(year, month - 1, day)
    } else {
      console.log(`SKIP: "${recurring.description}" has unsupported frequency "${recurring.frequency}"`)
      skipped++
      continue
    }

    const action = apply ? 'CREATE' : 'WOULD CREATE'
    console.log(`${action}: "${recurring.description}" - $${recurring.amount.toFixed(2)} on ${expenseDate.toDateString()} (${recurring.user.name})`)

    if (apply) {
      const expense = await prisma.expense.create({
        data: {
          amount: recurring.amount,
          category: recurring.category,
          description: recurring.description,
          date: expenseDate,
          isShared: recurring.isShared,
          userId: recurring.userId,
          recurringExpenseId: recurring.id,
        },
        include: { user: true },
      })
      created.push({
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        user: expense.user.name,
      })
    } else {
      created.push({
        description: recurring.description,
        amount: recurring.amount,
        date: expenseDate,
        user: recurring.user.name,
      })
    }
  }

  if (apply) {
    console.log(`\nDone. Created ${created.length} expense(s), skipped ${skipped}.`)
  } else {
    console.log(`\nDry-run complete. Would create ${created.length} expense(s), skip ${skipped}.`)
    console.log('Re-run with --apply to actually write these expenses.')
  }
}

backfillRecurring()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
