import { NextRequest, NextResponse } from 'next/server'
import { getHouseholdId } from '@/lib/auth'
import OpenAI from 'openai'
import { categories } from '@/lib/utils'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface OCRResult {
  isReceipt: boolean // Receipt validation - true if it's an actual receipt
  reason?: string // Explanation if not a receipt
  amount?: number
  date?: string // YYYY-MM-DD format
  description?: string
  category?: string
  confidence?: string
}

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

    // Validate file type - only images
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are supported for OCR' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const mimeType = file.type

    // Create prompt for GPT-4o-mini Vision
    const categoryList = categories.map(c => c.value).join(', ')

    const prompt = `FIRST: Determine if this image is a valid receipt or invoice.

Valid receipts/invoices contain:
- Merchant/business name
- Purchase items or service description
- Prices and amounts
- Total amount paid
- Transaction date
- Look like actual receipts: paper receipts, digital receipts, invoices, bills

INVALID (not receipts):
- Screenshots without purchase info
- Advertisements, newsletters, marketing materials
- Memes, social media posts
- Personal photos, selfies
- Text documents, PDFs without purchase details
- Anything that doesn't show a completed transaction

IF this IS a valid receipt, extract the data in JSON format:
{
  "isReceipt": true,
  "amount": <total amount as number, without currency symbols>,
  "date": "<date in YYYY-MM-DD format, if visible>",
  "description": "<merchant/store name>",
  "category": "<best matching category from: ${categoryList}>",
  "confidence": "<high/medium/low based on image quality>"
}

IF this is NOT a valid receipt, return:
{
  "isReceipt": false,
  "reason": "<brief explanation of what this image actually is>"
}

Rules:
- Be strict: only accept actual receipts/invoices
- If you can't read something clearly, use null for that field
- For amount, only return the final total, not subtotals
- For date, today's date is: ${new Date().toISOString().split('T')[0]}
- For category, choose the BEST match from the provided list based on the merchant/items
- Return ONLY the JSON object, no additional text`

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high' // Use high detail for better accuracy
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0, // Use 0 for deterministic output
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'No response from OCR service' },
        { status: 500 }
      )
    }

    // Parse JSON response
    let ocrResult: OCRResult
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      ocrResult = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse OCR response:', content)
      return NextResponse.json(
        { error: 'Failed to parse receipt data', rawResponse: content },
        { status: 500 }
      )
    }

    // Reject non-receipt images
    if (ocrResult.isReceipt === false) {
      return NextResponse.json(
        { error: `Not a valid receipt: ${ocrResult.reason || 'Please upload an actual receipt image'}` },
        { status: 400 }
      )
    }

    // Validate and clean the result
    let validatedDate = ocrResult.date

    // Smart date validation: adjust dates that are too old or too far in future
    if (validatedDate) {
      const extractedDate = new Date(validatedDate)
      const today = new Date()
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
      const oneMonthAhead = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

      // If date is more than 1 year old, use current year instead
      if (extractedDate < oneYearAgo) {
        const month = extractedDate.getMonth()
        const day = extractedDate.getDate()
        const adjustedDate = new Date(today.getFullYear(), month, day)
        validatedDate = adjustedDate.toISOString().split('T')[0]
      }
      // If date is more than 1 month in future, use current year instead
      else if (extractedDate > oneMonthAhead) {
        const month = extractedDate.getMonth()
        const day = extractedDate.getDate()
        const adjustedDate = new Date(today.getFullYear(), month, day)
        validatedDate = adjustedDate.toISOString().split('T')[0]
      }
    }

    const result: OCRResult = {
      isReceipt: true, // Already validated above
      amount: ocrResult.amount ? Math.abs(Number(ocrResult.amount)) : undefined,
      date: validatedDate || undefined,
      description: ocrResult.description || undefined,
      category: ocrResult.category || undefined,
      confidence: ocrResult.confidence || 'medium',
    }

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process receipt' },
      { status: 500 }
    )
  }
}
