/**
 * Email Template Preview Script
 *
 * Usage:
 * npx tsx scripts/preview-email.tsx budget
 * npx tsx scripts/preview-email.tsx settlement
 * npx tsx scripts/preview-email.tsx recurring
 *
 * Outputs HTML to console - copy and paste into a .html file to view in browser
 */

import { render } from '@react-email/components'
import BudgetAlertEmail from '../lib/email/templates/budget-alert'
import SettlementReminderEmail from '../lib/email/templates/settlement-reminder'
import RecurringReminderEmail from '../lib/email/templates/recurring-reminder'

const templateType = process.argv[2] || 'budget'

async function previewEmail() {
  let html = ''

  switch (templateType) {
    case 'budget':
      html = await render(
        BudgetAlertEmail({
          userName: 'Michael',
          budgetName: 'Groceries',
          percentSpent: 92,
          amountSpent: 920,
          budgetLimit: 1000,
          threshold: 90,
        })
      )
      console.log('📊 Budget Alert Email (90% threshold)\n')
      break

    case 'settlement':
      html = await render(
        SettlementReminderEmail({
          userName: 'Michael',
          owedToName: 'Sarah',
          amount: 125.50,
          daysOverdue: 7,
        })
      )
      console.log('💰 Settlement Reminder Email (7 days overdue)\n')
      break

    case 'recurring':
      html = await render(
        RecurringReminderEmail({
          userName: 'Michael',
          expenseName: 'Netflix Subscription',
          amount: 15.99,
          dueDate: '2025-11-10',
          daysUntilDue: 3,
          category: 'Subscription',
        })
      )
      console.log('📅 Recurring Expense Reminder (3 days before due)\n')
      break

    default:
      console.error('❌ Invalid template type. Use: budget, settlement, or recurring')
      process.exit(1)
  }

  console.log(html)
  console.log('\n✅ Copy the HTML above and save to a .html file to preview in browser')
}

previewEmail()
