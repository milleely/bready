import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface RecurringReminderEmailProps {
  userName: string
  expenseName: string
  amount: number
  dueDate: string
  daysUntilDue: number
  category?: string
}

export default function RecurringReminderEmail({
  userName = 'User',
  expenseName = 'Netflix Subscription',
  amount = 15.99,
  dueDate = '2025-11-15',
  daysUntilDue = 3,
  category = 'Subscription',
}: RecurringReminderEmailProps) {
  const isDueToday = daysUntilDue === 0
  const isDueTomorrow = daysUntilDue === 1

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <Html>
      <Head />
      <Preview>
        {isDueToday
          ? `⏰ ${expenseName} is due today ($${amount.toFixed(2)})`
          : isDueTomorrow
          ? `⏰ ${expenseName} is due tomorrow ($${amount.toFixed(2)})`
          : `⏰ ${expenseName} is due in ${daysUntilDue} days ($${amount.toFixed(2)})`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>🍞 Bready</Heading>
            <Text style={tagline}>Your Household Expense Tracker</Text>
          </Section>

          {/* Alert Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Heading style={alertHeading}>
              📅 Upcoming Expense
            </Heading>

            {isDueToday ? (
              <Text style={alertText}>
                Your recurring expense <strong>{expenseName}</strong> is <strong>due today</strong>.
              </Text>
            ) : isDueTomorrow ? (
              <Text style={alertText}>
                Your recurring expense <strong>{expenseName}</strong> is <strong>due tomorrow</strong>.
              </Text>
            ) : (
              <Text style={alertText}>
                Your recurring expense <strong>{expenseName}</strong> is due in <strong>{daysUntilDue} days</strong>.
              </Text>
            )}

            {/* Expense Details Card */}
            <Section style={expenseCard}>
              <div style={expenseHeader}>
                <Text style={expenseNameStyle}>{expenseName}</Text>
                {category && (
                  <span style={categoryBadge}>{category}</span>
                )}
              </div>

              <Hr style={cardHr} />

              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={detailCell}>
                      <Text style={detailLabel}>Amount</Text>
                      <Text style={detailValue}>${amount.toFixed(2)}</Text>
                    </td>
                    <td style={detailCell}>
                      <Text style={detailLabel}>Due Date</Text>
                      <Text style={detailValue}>{formatDate(dueDate)}</Text>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{...detailCell, paddingTop: '16px'}}>
                      <Text style={detailLabel}>Days Until Due</Text>
                      <Text
                        style={{
                          ...detailValue,
                          color:
                            daysUntilDue === 0
                              ? '#dc2626'
                              : daysUntilDue <= 1
                              ? '#ea580c'
                              : '#059669',
                        }}
                      >
                        {isDueToday ? 'Today' : isDueTomorrow ? 'Tomorrow' : `${daysUntilDue} days`}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Call to Action */}
            <Section style={buttonSection}>
              <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/expenses`}
              >
                View Expense
              </Button>
            </Section>

            {/* Tip */}
            <Section style={tipSection}>
              <Text style={tipText}>
                💡 <strong>Tip:</strong> Recurring expenses are automatically created when due. You can manage them in the Expenses page.
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you enabled recurring expense reminders in your notification settings.
            </Text>
            <Text style={footerText}>
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`}
                style={link}
              >
                Manage notification preferences
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f5f5f4',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#fef3c7',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const heading = {
  color: '#78350f',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
}

const tagline = {
  color: '#92400e',
  fontSize: '14px',
  margin: '8px 0 0',
  padding: '0',
}

const content = {
  padding: '32px 24px',
}

const greeting = {
  color: '#57534e',
  fontSize: '16px',
  margin: '0 0 24px',
}

const alertHeading = {
  color: '#1c1917',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const alertText = {
  color: '#44403c',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const expenseCard = {
  backgroundColor: '#fafaf9',
  borderRadius: '12px',
  border: '2px solid #e7e5e4',
  padding: '24px',
  margin: '0 0 24px',
}

const expenseHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap' as const,
  gap: '8px',
}

const expenseNameStyle = {
  color: '#1c1917',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
  flex: '1',
}

const categoryBadge = {
  backgroundColor: '#fef3c7',
  color: '#78350f',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '16px',
  textTransform: 'uppercase' as const,
}

const cardHr = {
  borderColor: '#e7e5e4',
  margin: '16px 0',
}

const detailsTable = {
  width: '100%',
}

const detailCell = {
  padding: '8px',
  textAlign: 'center' as const,
  verticalAlign: 'top',
}

const detailLabel = {
  color: '#78716c',
  fontSize: '12px',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
}

const detailValue = {
  color: '#1c1917',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  margin: '0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const button = {
  backgroundColor: '#d97706',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '14px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const tipSection = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  border: '1px solid #fde68a',
  padding: '16px',
}

const tipText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const hr = {
  borderColor: '#e7e5e4',
  margin: '32px 0',
}

const footer = {
  padding: '0 24px 32px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#78716c',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
}

const link = {
  color: '#d97706',
  textDecoration: 'underline',
}
