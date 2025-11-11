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

interface BudgetAlertEmailProps {
  userName: string
  budgetName: string
  percentSpent: number
  amountSpent: number
  budgetLimit: number
  threshold: number
}

export default function BudgetAlertEmail({
  userName = 'User',
  budgetName = 'Groceries',
  percentSpent = 78,
  amountSpent = 780,
  budgetLimit = 1000,
  threshold = 75,
}: BudgetAlertEmailProps) {
  const remaining = budgetLimit - amountSpent
  const isOverBudget = percentSpent >= 100

  return (
    <Html>
      <Head />
      <Preview>
        {isOverBudget
          ? `⚠️ You've exceeded your ${budgetName} budget`
          : `⚠️ You've reached ${threshold}% of your ${budgetName} budget`}
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

            {isOverBudget ? (
              <>
                <Heading style={alertHeading}>
                  ⚠️ Budget Exceeded
                </Heading>
                <Text style={alertText}>
                  You've gone <strong>${Math.abs(remaining).toFixed(2)}</strong> over your <strong>{budgetName}</strong> budget.
                </Text>
              </>
            ) : (
              <>
                <Heading style={alertHeading}>
                  📊 Budget Alert
                </Heading>
                <Text style={alertText}>
                  You've reached <strong>{threshold}%</strong> of your <strong>{budgetName}</strong> budget.
                </Text>
              </>
            )}

            {/* Progress Bar */}
            <Section style={progressSection}>
              <div style={progressBarContainer}>
                <div
                  style={{
                    ...progressBar,
                    width: `${Math.min(percentSpent, 100)}%`,
                    backgroundColor:
                      percentSpent >= 100
                        ? '#dc2626'
                        : percentSpent >= 90
                        ? '#ea580c'
                        : '#f59e0b',
                  }}
                />
              </div>
              <Text style={progressText}>
                ${amountSpent.toFixed(2)} of ${budgetLimit.toFixed(2)} ({percentSpent}%)
              </Text>
            </Section>

            {/* Budget Details */}
            <Section style={detailsSection}>
              <table style={table}>
                <tbody>
                  <tr>
                    <td style={tableCell}>
                      <Text style={detailLabel}>Spent</Text>
                      <Text style={detailValue}>
                        ${amountSpent.toFixed(2)}
                      </Text>
                    </td>
                    <td style={tableCell}>
                      <Text style={detailLabel}>Budget</Text>
                      <Text style={detailValue}>
                        ${budgetLimit.toFixed(2)}
                      </Text>
                    </td>
                    <td style={tableCell}>
                      <Text style={detailLabel}>
                        {isOverBudget ? 'Over' : 'Remaining'}
                      </Text>
                      <Text
                        style={{
                          ...detailValue,
                          color: isOverBudget ? '#dc2626' : '#059669',
                        }}
                      >
                        ${Math.abs(remaining).toFixed(2)}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Call to Action */}
            <Section style={buttonSection}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/budgets`}>
                Review Budget
              </Button>
            </Section>

            {/* Tip */}
            <Section style={tipSection}>
              <Text style={tipText}>
                💡 <strong>Tip:</strong> Review your recent expenses to see where you can cut back.
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you enabled budget alerts in your notification settings.
            </Text>
            <Text style={footerText}>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`} style={link}>
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

const progressSection = {
  margin: '0 0 32px',
}

const progressBarContainer = {
  backgroundColor: '#e7e5e4',
  borderRadius: '8px',
  height: '16px',
  overflow: 'hidden',
  width: '100%',
}

const progressBar = {
  height: '100%',
  borderRadius: '8px',
  transition: 'width 0.3s ease',
}

const progressText = {
  color: '#78716c',
  fontSize: '14px',
  margin: '8px 0 0',
  textAlign: 'center' as const,
}

const detailsSection = {
  backgroundColor: '#fafaf9',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px',
}

const table = {
  width: '100%',
}

const tableCell = {
  padding: '0 8px',
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
  fontSize: '20px',
  fontWeight: 'bold',
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
