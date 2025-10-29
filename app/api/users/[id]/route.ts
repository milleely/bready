import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const body = await request.json()
    const { id } = await params

    // Validate required fields
    if (!body.name || !body.color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      )
    }

    // Check if user exists and belongs to household
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        householdId,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found in your household' },
        { status: 404 }
      )
    }

    // Check if email is taken by another user in household
    if (body.email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: body.email,
          householdId,
          NOT: { id },
        },
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email already in use by another user in your household' },
          { status: 409 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        color: body.color,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to update user:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const { id } = await params

    // Check if user exists and belongs to household
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        householdId,
      },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found in your household' },
        { status: 404 }
      )
    }

    // Delete user (expenses will be cascade deleted due to schema)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `User deleted successfully. ${existingUser._count.expenses} associated expenses were also deleted.`,
    })
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to delete user:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
