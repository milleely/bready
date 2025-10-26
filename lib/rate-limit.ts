/**
 * In-Memory Rate Limiter for PIN Operations
 *
 * Prevents brute force attacks on PIN verification by limiting attempts per IP/user.
 * Uses in-memory storage (resets on server restart).
 */

interface RateLimitRecord {
  count: number
  resetAt: number // Timestamp when the limit resets
}

const rateLimitStore = new Map<string, RateLimitRecord>()

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (userId, IP, etc.)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // If no record exists or window has expired, create new record
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(identifier, newRecord)

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: newRecord.resetAt,
    }
  }

  // Check if limit has been exceeded
  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
    }
  }

  // Increment count
  record.count += 1
  rateLimitStore.set(identifier, record)

  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  }
}

/**
 * Clear rate limit for a specific identifier (e.g., after successful PIN entry)
 * @param identifier - The identifier to clear
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Clean up expired rate limit records (should be called periodically)
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up expired records every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRecords, 10 * 60 * 1000)
}
