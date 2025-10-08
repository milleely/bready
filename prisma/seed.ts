import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create 4 users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alex',
        email: 'alex@example.com',
        color: '#3b82f6',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jordan',
        email: 'jordan@example.com',
        color: '#10b981',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Morgan',
        email: 'morgan@example.com',
        color: '#8b5cf6',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Casey',
        email: 'casey@example.com',
        color: '#f59e0b',
      },
    }),
  ])

  // Create sample expenses
  const now = new Date()
  const expenses = [
    {
      amount: 156.43,
      category: 'groceries',
      description: 'Weekly grocery shopping',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      isShared: true,
      userId: users[0].id,
    },
    {
      amount: 89.99,
      category: 'utilities',
      description: 'Electricity bill',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      isShared: true,
      userId: users[1].id,
    },
    {
      amount: 14.99,
      category: 'subscriptions',
      description: 'Netflix',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      isShared: true,
      userId: users[2].id,
    },
    {
      amount: 42.50,
      category: 'dining',
      description: 'Lunch at cafe',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      isShared: false,
      userId: users[0].id,
    },
    {
      amount: 65.00,
      category: 'transportation',
      description: 'Gas',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4),
      isShared: false,
      userId: users[3].id,
    },
    {
      amount: 120.00,
      category: 'groceries',
      description: 'Costco run',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      isShared: true,
      userId: users[1].id,
    },
    {
      amount: 35.00,
      category: 'entertainment',
      description: 'Movie tickets',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
      isShared: false,
      userId: users[2].id,
    },
  ]

  for (const expense of expenses) {
    await prisma.expense.create({ data: expense })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
