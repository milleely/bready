import { prisma } from '../lib/db'

// READ-ONLY diagnostic. Lists every active RecurringExpense blueprint,
// shows the Expense rows each has generated, and flags suspected duplicates.
// Usage: npx tsx scripts/diagnose-recurring.ts

async function diagnoseRecurring() {
  const recurring = await prisma.recurringExpense.findMany({
    where: { isActive: true },
    include: {
      user: { select: { id: true, name: true } },
      expenses: {
        select: { id: true, date: true, amount: true },
        orderBy: { date: 'asc' },
      },
    },
    orderBy: [{ userId: 'asc' }, { description: 'asc' }, { createdAt: 'asc' }],
  })

  console.log(`Found ${recurring.length} active RecurringExpense blueprint(s).\n`)
  console.log('='.repeat(80))

  for (const r of recurring) {
    const monthsGenerated = r.expenses.map((e) => {
      const y = e.date.getFullYear()
      const m = String(e.date.getMonth() + 1).padStart(2, '0')
      return `${y}-${m}`
    })

    console.log(`
Blueprint ID:    ${r.id}
Description:     "${r.description}"
Owner:           ${r.user.name} (${r.user.id})
Amount:          $${r.amount.toFixed(2)}
Frequency:       ${r.frequency}
Day of month:    ${r.dayOfMonth ?? '(none)'}
Created at:      ${r.createdAt.toISOString()}
Expenses gen'd:  ${r.expenses.length} total, months: [${monthsGenerated.join(', ') || '(none)'}]`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('\nSUSPECTED DUPLICATES (same owner + description + amount):\n')

  // Group by (userId, normalized description, amount)
  const groups = new Map<string, typeof recurring>()
  for (const r of recurring) {
    const key = `${r.userId}|${r.description.toLowerCase().trim()}|${r.amount}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  let foundDupes = false
  for (const [key, members] of groups) {
    if (members.length > 1) {
      foundDupes = true
      const [userId, desc, amount] = key.split('|')
      console.log(`* ${members[0].user.name} — "${members[0].description}" — $${members[0].amount.toFixed(2)} — ${members.length} blueprints:`)
      for (const m of members) {
        console.log(`    - ID ${m.id}  created ${m.createdAt.toISOString().slice(0, 10)}  generated ${m.expenses.length} expense(s)`)
      }
    }
  }

  if (!foundDupes) {
    console.log('(none — no exact duplicates found by owner+description+amount)')
  }

  console.log('\n' + '='.repeat(80))
  console.log('\nSUSPECTED FUZZY DUPLICATES (same owner + amount, similar description):\n')

  // Group by (userId, amount) and flag if there are 2+ with different descriptions
  const fuzzyGroups = new Map<string, typeof recurring>()
  for (const r of recurring) {
    const key = `${r.userId}|${r.amount}`
    if (!fuzzyGroups.has(key)) fuzzyGroups.set(key, [])
    fuzzyGroups.get(key)!.push(r)
  }

  let foundFuzzy = false
  for (const [key, members] of fuzzyGroups) {
    if (members.length > 1) {
      const distinctDescs = new Set(members.map((m) => m.description.toLowerCase().trim()))
      if (distinctDescs.size > 1) {
        foundFuzzy = true
        console.log(`* ${members[0].user.name} — $${members[0].amount.toFixed(2)} — ${members.length} blueprints with different names:`)
        for (const m of members) {
          console.log(`    - ID ${m.id}  "${m.description}"  created ${m.createdAt.toISOString().slice(0, 10)}  generated ${m.expenses.length} expense(s)`)
        }
      }
    }
  }

  if (!foundFuzzy) {
    console.log('(none)')
  }

  console.log('\nDone.')
}

diagnoseRecurring()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
