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

interface SettlementReminderEmailProps {
  userName: string
  owedToName: string
  amount: number
  daysOverdue: number
}

export default function SettlementReminderEmail({
  userName = 'User',
  owedToName = 'John',
  amount = 125.50,
  daysOverdue = 7,
}: SettlementReminderEmailProps) {
  const isOverdue = daysOverdue > 0

  return (
    <Html>
      <Head />
      <Preview>
        {isOverdue
          ? `⏰ Payment reminder: You owe ${owedToName} $${amount.toFixed(2)}`
          : `💰 You have a pending payment to ${owedToName}`}
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

            {isOverdue ? (
              <>
                <Heading style={alertHeading}>
                  ⏰ Payment Reminder
                </Heading>
                <Text style={alertText}>
                  You have a pending payment that's <strong>{daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue</strong>.
                </Text>
              </>
            ) : (
              <>
                <Heading style={alertHeading}>
                  💰 Pending Payment
                </Heading>
                <Text style={alertText}>
                  You have a pending settlement with <strong>{owedToName}</strong>.
                </Text>
              </>
            )}

            {/* Settlement Details */}
            <Section style={settlementCard}>
              <div style={amountSection}>
                <Text style={amountLabel}>You owe</Text>
                <Text style={amountValue}>${amount.toFixed(2)}</Text>
              </div>

              <Hr style={cardHr} />

              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={detailCell}>
                      <Text style={detailLabel}>To</Text>
                      <Text style={detailText}>{owedToName}</Text>
                    </td>
                    <td style={detailCell}>
                      <Text style={detailLabel}>Status</Text>
                      <Text
                        style={{
                          ...detailText,
                          color: isOverdue ? '#dc2626' : '#f59e0b',
                          fontWeight: 'bold' as const,
                        }}
                      >
                        {isOverdue ? `${daysOverdue}d overdue` : 'Pending'}
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
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settlements`}
              >
                Settle Payment
              </Button>
            </Section>

            {/* Tip */}
            <Section style={tipSection}>
              <Text style={tipText}>
                💡 <strong>Tip:</strong> Settling payments regularly helps maintain healthy household finances and good relationships.
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you enabled settlement reminders in your notification settings.
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

const settlementCard = {
  backgroundColor: '#fafaf9',
  borderRadius: '12px',
  border: '2px solid #e7e5e4',
  padding: '24px',
  margin: '0 0 24px',
}

const amountSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px',
}

const amountLabel = {
  color: '#78716c',
  fontSize: '14px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const amountValue = {
  color: '#1c1917',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0',
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

const detailText = {
  color: '#1c1917',
  fontSize: '16px',
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
