import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File
    const company = formData.get('company') as string
    const topic = formData.get('topic') as string
    const roundType = formData.get('roundType') as string
    const adminKey = formData.get('adminKey') as string

    // Security check
    if (adminKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid admin key.' },
        { status: 401 }
      )
    }

    if (!file || !company || !topic) {
      return NextResponse.json(
        { error: 'Missing file, company or topic' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY ||
      process.env.ANTHROPIC_API_KEY === 'add_later') {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Send to Claude to extract questions
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64
            }
          },
          {
            type: 'text',
            text: `Extract ALL interview questions from this PDF.
Company: ${company}
Topic: ${topic}
Round Type: ${roundType}

For each question found, provide:
1. The exact question
2. A detailed model answer
3. 3 key points

Return ONLY valid JSON array:
[
  {
    "question": "question text",
    "model_answer": "answer here",
    "key_points": ["point1", "point2", "point3"],
    "difficulty": "easy"
  }
]`
          }
        ]
      }]
    })

    const text = response.content[0].type === 'text'
      ? response.content[0].text : '[]'

    // Parse extracted questions
    let questions = []
    try {
      const cleaned = text.replace(/```json|```/g, '').trim()
      questions = JSON.parse(cleaned)
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to parse questions from PDF. Try a clearer PDF.' },
        { status: 500 }
      )
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found in PDF.' },
        { status: 400 }
      )
    }

    // Save all questions to Supabase
    const questionsToInsert = questions.map((q: any) => ({
      company,
      topic,
      round_type: roundType,
      question: q.question,
      model_answer: q.model_answer,
      key_points: q.key_points || [],
      difficulty: q.difficulty || 'medium',
      source_pdf: file.name,
      active: true
    }))

    const { data, error } = await supabase
      .from('pdf_questions')
      .insert(questionsToInsert)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save questions to database.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully extracted and saved ${questions.length} questions!`,
      count: questions.length,
      questions: questions.slice(0, 3) // Preview first 3
    })
  } catch (error: any) {
    console.error('Upload error full:', error?.message || error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process PDF. Please try again.' },
      { status: 500 }
    )
  }
}