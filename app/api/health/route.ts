/**
 * Health Check Endpoint
 *
 * Lightweight endpoint for keep-warm pings to prevent serverless cold starts.
 * This endpoint does NOT query the database or perform any heavy operations.
 *
 * Used by: Vercel Cron (every 5 minutes)
 * Purpose: Keep serverless functions warm for faster user responses
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: Date.now(),
    message: 'Bready is warm and ready! 🍞',
  })
}
