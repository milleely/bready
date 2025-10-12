import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'

export async function GET() {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    // Only return users from the authenticated user's household
    const users = await prisma.user.findMany({
      where: { householdId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(users)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch users:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      )
    }

    // Check household member limit (max 4 users)
    const householdUserCount = await prisma.user.count({
      where: { householdId },
    })

    if (householdUserCount >= 4) {
      return NextResponse.json(
        { error: 'Household member limit reached (max 4 users)' },
        { status: 403 }
      )
    }

    // Check if email already exists (if provided)
    if (body.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: body.email,
          householdId,
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists in your household' },
          { status: 409 }
        )
      }
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        color: body.color,
        householdId,
        isOwner: false,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create user:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
