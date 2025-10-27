import { prisma } from '../lib/db'

async function deleteSeptemberExpenses() {
  console.log('🔍 Checking for September 2025 expenses...\n')

  // Query for September 2025 expenses
  const septemberExpenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: new Date('2025-09-01'),
        lte: new Date('2025-09-30T23:59:59'),
      },
    },
    include: {
      user: true,
    },
  })

  if (septemberExpenses.length === 0) {
    console.log('✅ No September 2025 expenses found. Database is clean!')
    return
  }

  console.log(`⚠️  Found ${septemberExpenses.length} September 2025 expenses:\n`)

  // Display expenses
  let totalAmount = 0
  septemberExpenses.forEach((expense, index) => {
    totalAmount += expense.amount
    console.log(
      `${index + 1}. ${expense.user.name} - ${expense.category} - $${expense.amount.toFixed(2)} - ${expense.date.toLocaleDateString()}`
    )
  })

  console.log(`\n💰 Total September spending: $${totalAmount.toFixed(2)}\n`)

  // Delete expenses
  console.log('🗑️  Deleting September 2025 expenses...')

  const result = await prisma.expense.deleteMany({
    where: {
      date: {
        gte: new Date('2025-09-01'),
        lte: new Date('2025-09-30T23:59:59'),
      },
    },
  })

  console.log(`✅ Deleted ${result.count} expenses from September 2025`)
  console.log('✨ Database cleaned successfully!')
}

deleteSeptemberExpenses()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
