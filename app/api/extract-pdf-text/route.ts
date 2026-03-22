import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = file.type || 'application/pdf'

    // Use Claude to properly extract text from the PDF document
    if (
      !process.env.ANTHROPIC_API_KEY ||
      process.env.ANTHROPIC_API_KEY === 'add_later'
    ) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mimeType as 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Extract ALL readable text from this resume document. 
Return ONLY the plain text content exactly as it appears — name, contact info, skills, experience, education, projects, certifications.
Do NOT add any commentary, labels, or formatting markers.
Preserve the structure as closely as possible.`,
            },
          ],
        },
      ],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    if (!text || text.trim().length < 30) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this PDF. Try copy-pasting your resume text instead.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ success: true, text: text.trim() })
  } catch (error: any) {
    console.error('PDF extract error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from PDF: ' + error.message },
      { status: 500 }
    )
  }
}