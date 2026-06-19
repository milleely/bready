import { prisma } from '../lib/db'

// Reassign expenses/recurring blueprints on removed categories to 'other'.
// Decision date: 2026-06-19. Categories personal-care, gifts, pets, and
// home-maintenance were removed from the picker (lib/utils.ts); this migrates
// the historical rows so they keep a clean label/color/icon instead of
// rendering the raw value.
// Reversible only from a backup (the original category is overwritten).
// Default-safe dry-run; pass --apply to write.
//
// Usage:
//   npx tsx scripts/reassign-removed-categories.ts          (dry-run)
//   npx tsx scripts/reassign-removed-categories.ts --apply  (writes)

const apply = process.argv.includes('--apply')
const REMOVED = ['personal-care', 'gifts', 'pets', 'home-maintenance']

async function reassign() {
  console.log(apply ? 'APPLY MODE — writing to database.\n' : 'DRY RUN MODE — no writes. Pass --apply to write.\n')

  const expenseCount = await prisma.expense.count({ where: { category: { in: REMOVED } } })
  const recurringCount = await prisma.recurringExpense.count({ where: { category: { in: REMOVED } } })

  console.log(`Expense rows to reassign:          ${expenseCount}`)
  console.log(`RecurringExpense rows to reassign: ${recurringCount}\n`)

  if (expenseCount === 0 && recurringCount === 0) {
    console.log('Nothing to do.')
    return
  }

  if (apply) {
    const e = await prisma.expense.updateMany({
      where: { category: { in: REMOVED } },
      data: { category: 'other' },
    })
    const r = await prisma.recurringExpense.updateMany({
      where: { category: { in: REMOVED } },
      data: { category: 'other' },
    })
    console.log(`✔ Reassigned ${e.count} expense(s) and ${r.count} recurring blueprint(s) to 'other'.`)
  } else {
    console.log("Re-run with --apply to reassign these rows to 'other'.")
  }
}

reassign()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
