/**
 * Send Notification Helper
 *
 * Centralized email sending logic with error handling and logging.
 */

import { resend, BREADY_FROM_EMAIL, BREADY_DEV_EMAIL } from "./resend-client"
import type { ReactElement } from "react"

export interface SendNotificationParams {
  to: string
  subject: string
  react: ReactElement
}

export interface SendNotificationResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Sends a notification email via Resend
 *
 * @param params - Email parameters (to, subject, react component)
 * @returns Result object with success status and message ID or error
 */
export async function sendNotification(
  params: SendNotificationParams
): Promise<SendNotificationResult> {
  try {
    // Use dev email in development, prod email in production
    const fromEmail =
      process.env.NODE_ENV === "production" ? BREADY_FROM_EMAIL : BREADY_DEV_EMAIL

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      react: params.react,
    })

    if (error) {
      console.error("Failed to send notification email:", error)
      return {
        success: false,
        error: error.message || "Unknown error",
      }
    }

    console.log("Notification email sent successfully:", {
      messageId: data?.id,
      to: params.to,
      subject: params.subject,
    })

    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    console.error("Exception while sending notification email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown exception",
    }
  }
}
