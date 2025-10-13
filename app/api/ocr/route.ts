import { NextRequest, NextResponse } from 'next/server'
import { getHouseholdId } from '@/lib/auth'
import OpenAI from 'openai'
import { categories } from '@/lib/utils'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface OCRResult {
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

    const prompt = `Analyze this receipt image and extract the following information in JSON format:

{
  "amount": <total amount as number, without currency symbols>,
  "date": "<date in YYYY-MM-DD format, if visible>",
  "description": "<merchant/store name>",
  "category": "<best matching category from: ${categoryList}>",
  "confidence": "<high/medium/low based on image quality>"
}

Rules:
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

    // Validate and clean the result
    const result: OCRResult = {
      amount: ocrResult.amount ? Math.abs(Number(ocrResult.amount)) : undefined,
      date: ocrResult.date || undefined,
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
