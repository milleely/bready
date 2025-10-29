/**
 * Resend Email Client
 *
 * Singleton client for sending transactional emails via Resend API.
 * Requires RESEND_API_KEY environment variable.
 */

import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing required environment variable: RESEND_API_KEY")
}

export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Default "from" email address for all Bready notifications
 * Replace with your verified domain email once set up in Resend
 */
export const BREADY_FROM_EMAIL = "Bready Notifications <notifications@bready.app>"

/**
 * Fallback email for development/testing (using Resend's test domain)
 * This will work without domain verification for testing purposes
 */
export const BREADY_DEV_EMAIL = "onboarding@resend.dev"
