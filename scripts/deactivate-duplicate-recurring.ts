import { prisma } from '../lib/db'

// One-off cleanup: deactivate the OLDER duplicate in each pair of recurring blueprints.
// Source of truth: scripts/diagnose-recurring.ts output run on 2026-05-02.
// Default-safe dry-run; pass --apply to write.
//
// Usage:
//   npx tsx scripts/deactivate-duplicate-recurring.ts          (dry-run)
//   npx tsx scripts/deactivate-duplicate-recurring.ts --apply  (writes)

const apply = process.argv.includes('--apply')

// IDs to deactivate (older blueprint in each pair). Comments list what's kept.
const toDeactivate: { id: string; reason: string }[] = [
  // --- Exact duplicates (same name + amount + owner) ---
  { id: 'cmhqz8kqj0001lb049qzm7dly', reason: 'Bell (Nahye) — older of 2; keeping newer "Bell" cmm26s3420009lb05rt1f3yjg' },
  { id: 'cmhwqlw8j0009l404snlr3cwd', reason: 'Beehiiv (Michael) — older of 2; keeping newer "Beehiiv" cmlcoymxj0001ji04995jj9p1' },
  { id: 'cmhiebhmf0003l8043f0axb6w', reason: 'Google Suite (Michael) — older of 2; keeping newer "Google Suite" cmlcp1k1y000pji04ur23ta3q' },
  { id: 'cmiq7vjzt0001l2043y3axz3d', reason: 'Phone bill (Michael) — older of 2; keeping newer "Phone bill" cmlcp0poc000jji04gftd8gts' },
  { id: 'cmhie8n4l0001ky049hoo4mqr', reason: 'YMCA (Michael) — older of 2; keeping newer "YMCA" cmlcp1tve000vji04ipa1o3g1' },

  // --- Fuzzy duplicates (same amount + owner, different names) ---
  { id: 'cmhqzkb3l0003kz04mz0euip1', reason: 'AMEX monthly fee (Michael) — older; keeping newer "AMEX Card" cmlcp097c000dji04mz57zzs0' },
  { id: 'cmhwqdg7f0001l404923k5n2f', reason: 'Claude.AI Max Plan (Michael) — older; keeping newer "Claude Max Plan" cmlcoy4e20007kw04vkmocdf5' },
  { id: 'cmhqzl09l0009kz0490xsvvlo', reason: 'Cursor Subscription (Michael) — older; keeping newer "Cursor" cmlcozfw40007ji042lcpwm4y' },
  { id: 'cmicam0sk0001l204flhifk28', reason: 'Spotify Plan (Michael) — older; keeping newer "Spotify" cmlcox2xh0001kw04ck2i3gsj' },
  { id: 'cmhieaqw50007ky04vbshtchm', reason: 'YMCA (Nahye) — older; keeping newer "YMCA membership" cmm26r48l0003lb05ltb3j3qn (per user request)' },
]

async function deactivateDuplicates() {
  console.log(apply ? 'APPLY MODE — writing to database.\n' : 'DRY RUN MODE — no writes. Pass --apply to write.\n')
  console.log(`Plan: deactivate ${toDeactivate.length} older duplicate blueprint(s).\n`)

  const ids = toDeactivate.map((t) => t.id)
  const records = await prisma.recurringExpense.findMany({
    where: { id: { in: ids } },
    include: { user: { select: { name: true } } },
  })

  const found = new Map(records.map((r) => [r.id, r]))
  let alreadyInactive = 0
  let willChange = 0
  let missing = 0

  for (const t of toDeactivate) {
    const r = found.get(t.id)
    if (!r) {
      console.log(`MISSING: ${t.id} not found in database — ${t.reason}`)
      missing++
      continue
    }
    if (!r.isActive) {
      console.log(`ALREADY INACTIVE: ${t.id} ("${r.description}", ${r.user.name}) — no change`)
      alreadyInactive++
      continue
    }
    const action = apply ? 'DEACTIVATING' : 'WOULD DEACTIVATE'
    console.log(`${action}: ${t.id} ("${r.description}", $${r.amount.toFixed(2)}, ${r.user.name})`)
    console.log(`    Reason: ${t.reason}`)
    willChange++
  }

  if (apply && willChange > 0) {
    const idsToWrite = toDeactivate
      .filter((t) => {
        const r = found.get(t.id)
        return r && r.isActive
      })
      .map((t) => t.id)

    const result = await prisma.recurringExpense.updateMany({
      where: { id: { in: idsToWrite } },
      data: { isActive: false },
    })
    console.log(`\nWrote isActive=false to ${result.count} record(s).`)
  }

  console.log(`\nSummary: ${willChange} ${apply ? 'changed' : 'would change'}, ${alreadyInactive} already inactive, ${missing} missing.`)
  if (!apply) {
    console.log('Re-run with --apply to commit.')
  }
}

deactivateDuplicates()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
