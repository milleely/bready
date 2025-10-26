/**
 * PIN Authentication Utilities
 *
 * Provides secure PIN hashing and verification using bcrypt.
 * PINs are never stored in plaintext.
 */

import bcrypt from "bcryptjs"

/**
 * Hash a PIN using bcrypt
 * @param pin - The plaintext PIN (4-6 digits)
 * @returns Promise resolving to the hashed PIN
 */
export async function hashPin(pin: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(pin, saltRounds)
}

/**
 * Verify a PIN against a hashed PIN
 * @param pin - The plaintext PIN to verify
 * @param hashedPin - The hashed PIN from database
 * @returns Promise resolving to true if PIN matches, false otherwise
 */
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  return await bcrypt.compare(pin, hashedPin)
}

/**
 * Validate PIN format (4-6 digits, numbers only)
 * @param pin - The PIN to validate
 * @returns true if valid format, false otherwise
 */
export function isValidPinFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin)
}
