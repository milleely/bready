import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getHouseholdId } from '@/lib/auth'

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf']

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.substring(file.name.lastIndexOf('.'))

    // Validate extension matches allowed list
    if (!ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file extension.' },
        { status: 400 }
      )
    }

    const filename = `receipts/receipt-${householdId}-${timestamp}${extension}`

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      receiptUrl: blob.url,
      message: 'File uploaded successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}
