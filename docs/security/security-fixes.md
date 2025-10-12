# Security Fixes - Implementation Guide

## 1. Rate Limiting Implementation

### Install Dependencies
```bash
npm install @upstash/ratelimit @upstash/redis
```

### Create Rate Limiting Middleware
```typescript
// app/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Create Redis instance (use Upstash Redis for production)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create rate limiter: 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
})

export async function rateLimit(request: NextRequest) {
  const ip = headers().get('x-forwarded-for') ?? '127.0.0.1'

  const { success, limit, reset, remaining } = await ratelimit.limit(
    `api_${ip}`
  )

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      }
    )
  }

  return null // Continue with request
}
```

### Apply to API Routes
```typescript
// app/api/expenses/route.ts
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request)
  if (rateLimitResult) return rateLimitResult

  // ... rest of your code
}
```

## 2. Input Validation with Zod

### Install Zod
```bash
npm install zod
```

### Create Validation Schemas
```typescript
// app/lib/validations.ts
import { z } from 'zod'
import { categories } from '@/lib/utils'

const categoryValues = categories.map(c => c.value) as [string, ...string[]]

export const expenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum allowed'),
  category: z.enum(categoryValues, {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description too long'),
  date: z.string().datetime(),
  isShared: z.boolean(),
  userId: z.string().uuid(),
})

export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Name contains invalid characters'),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
})
```

### Apply Validation in API Routes
```typescript
// app/api/expenses/route.ts
import { expenseSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = expenseSchema.parse(body)

    // Use validatedData instead of body
    const expense = await prisma.expense.create({
      data: validatedData,
      include: { user: true },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    // ... handle other errors
  }
}
```

## 3. Security Headers Configuration

### Update next.config.ts
```typescript
// next.config.ts
import type { NextConfig } from "next"

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com;
      style-src 'self' 'unsafe-inline';
      font-src 'self' data:;
      img-src 'self' data: https: blob:;
      connect-src 'self' https://api.clerk.com https://clerk.com wss://;
      frame-src https://clerk.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\n/g, ' ').trim()
  }
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
```

## 4. CSRF Protection

### Create CSRF Middleware
```typescript
// app/lib/csrf.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CSRF_HEADER = 'X-CSRF-Token'
const CSRF_COOKIE = 'csrf-token'

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function validateCSRF(request: NextRequest) {
  // Skip CSRF check for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null
  }

  const token = request.headers.get(CSRF_HEADER)
  const cookie = request.cookies.get(CSRF_COOKIE)?.value

  if (!token || !cookie || token !== cookie) {
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 403 }
    )
  }

  return null
}

// Add to middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Set CSRF token if not present
  if (!request.cookies.has(CSRF_COOKIE)) {
    response.cookies.set(CSRF_COOKIE, generateCSRFToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })
  }

  return response
}
```

## 5. Secure Error Handling

### Create Error Handler
```typescript
// app/lib/error-handler.ts
import { NextResponse } from 'next/server'

interface ErrorResponse {
  error: string
  code?: string
  requestId?: string
}

export function handleApiError(error: unknown, context?: string): NextResponse {
  // Generate request ID for tracking
  const requestId = crypto.randomUUID()

  // Log full error details server-side
  console.error(`[${requestId}] API Error in ${context}:`, error)

  // Determine error type and response
  if (error instanceof z.ZodError) {
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        requestId,
      },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Resource already exists',
          code: 'DUPLICATE_ENTRY',
          requestId,
        },
        { status: 409 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Resource not found',
          code: 'NOT_FOUND',
          requestId,
        },
        { status: 404 }
      )
    }
  }

  // Generic error response for production
  const isDevelopment = process.env.NODE_ENV === 'development'

  return NextResponse.json<ErrorResponse>(
    {
      error: isDevelopment && error instanceof Error
        ? error.message
        : 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      requestId,
    },
    { status: 500 }
  )
}
```

## 6. Environment Variables Security

### Create .env.local (for local development only)
```bash
# .env.local
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### Update .gitignore
```bash
# Environment variables
.env
.env.local
.env.production
.env.*.local
```

### Set Production Variables in Vercel
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add all production environment variables
3. Never commit production secrets to git

## 7. API Request Size Limits

### Configure in API Routes
```typescript
// app/api/expenses/route.ts
export const runtime = 'nodejs'
export const maxDuration = 10 // 10 seconds max

// Configure body parser
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Limit request body to 1MB
    },
  },
}
```

## 8. Security Monitoring

### Create Audit Logger
```typescript
// app/lib/audit-logger.ts
import { prisma } from '@/lib/db'

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACCESS_DENIED = 'ACCESS_DENIED',
  RATE_LIMITED = 'RATE_LIMITED',
}

export async function logAuditEvent(
  userId: string | null,
  action: AuditAction,
  resource: string,
  details?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        details: details ? JSON.stringify(details) : null,
        ipAddress: headers().get('x-forwarded-for') ?? 'unknown',
        userAgent: headers().get('user-agent') ?? 'unknown',
        timestamp: new Date(),
      },
    })
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Audit logging failed:', error)
  }
}
```

## Testing Security Fixes

### 1. Test Rate Limiting
```bash
# Send multiple requests quickly
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/expenses \
    -H "Content-Type: application/json" \
    -d '{"amount": 100}'
done
```

### 2. Test Input Validation
```bash
# Test with invalid data
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount": -100, "category": "invalid"}'
```

### 3. Test Security Headers
```bash
# Check response headers
curl -I https://your-app.vercel.app
```

### 4. Test CSRF Protection
```bash
# Try request without CSRF token
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

## Security Checklist

- [ ] Rotate Clerk API keys immediately
- [ ] Implement rate limiting on all endpoints
- [ ] Add input validation with Zod
- [ ] Configure security headers
- [ ] Implement CSRF protection
- [ ] Set up secure error handling
- [ ] Configure environment variables properly
- [ ] Set request size limits
- [ ] Implement audit logging
- [ ] Enable HTTPS everywhere
- [ ] Review and test all changes