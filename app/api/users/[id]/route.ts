import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    // Validate required fields
    if (!body.name || !body.email || !body.color) {
      return NextResponse.json(
        { error: 'Name, email, and color are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is taken by another user
    const emailTaken = await prisma.user.findFirst({
      where: {
        email: body.email,
        NOT: { id },
      },
    })

    if (emailTaken) {
      return NextResponse.json(
        { error: 'Email already in use by another user' },
        { status: 409 }
      )
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
    console.error('Failed to update user:', error)
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
    const { id } = await params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
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
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
