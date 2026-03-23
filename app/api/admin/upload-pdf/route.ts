// app/api/admin/upload-pdf/route.ts
// Fixed: properly extracts text from PDF without binary garbage
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

// Clean readable text from buffer — removes non-printable chars
function cleanPdfText(buffer: Buffer): string {
  // Try to extract readable ASCII/UTF8 text from raw PDF bytes
  const raw = buffer.toString('latin1')
  // Extract text between BT/ET markers (PDF text blocks)
  const textBlocks: string[] = []
  const btEtRegex = /BT([\s\S]*?)ET/g
  let match
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1]
    // Extract strings inside parentheses (PDF text operators)
    const strRegex = /\(([^)]{2,200})\)/g
    let strMatch
    while ((strMatch = strRegex.exec(block)) !== null) {
      const str = strMatch[1]
        .replace(/\\n/g, '\n').replace(/\\r/g, '\r')
        .replace(/\\t/g, ' ').replace(/\\\\/g, '\\')
        .replace(/[^\x20-\x7E\n]/g, ' ').trim()
      if (str.length > 3) textBlocks.push(str)
    }
  }

  // Also try hex strings <...>
  const hexRegex = /<([0-9A-Fa-f]{4,})>/g
  while ((match = hexRegex.exec(raw)) !== null) {
    try {
      const hex = match[1]
      let str = ''
      for (let i = 0; i < hex.length - 1; i += 2) {
        const code = parseInt(hex.substr(i, 2), 16)
        if (code >= 32 && code < 127) str += String.fromCharCode(code)
      }
      if (str.length > 3) textBlocks.push(str)
    } catch {}
  }

  return textBlocks.join(' ')
}

// Parse cleaned text into Q&A pairs
function extractQuestionsFromCleanText(
  text: string, company: string, topic: string, roundType: string
): any[] {
  const questions: any[] = []
  const lines = text.split(/[\n.?!]/).map(l => l.trim()).filter(l => l.length > 15)

  const questionPatterns = [
    /^(Q\d+[.:)]?\s*)/i,
    /^\d+[.):]\s+/,
    /^(What|How|Why|Explain|Describe|Define|Tell|Can you|Could|Would|Is|Are|Do|Does|When|Where|Which|Who)/i,
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isQuestion = questionPatterns.some(p => p.test(line))
    if (!isQuestion || line.length < 10 || line.length > 400) continue

    const questionText = line.replace(/^(Q\d+[.:)]\s*|\d+[.)]\s*)/, '').trim()
    if (questionText.length < 8) continue

    // Collect next 1-3 lines as answer
    const answerLines: string[] = []
    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      if (questionPatterns.some(p => p.test(lines[j]))) break
      if (lines[j].length > 10) answerLines.push(lines[j])
    }

    questions.push({
      company, topic, round_type: roundType,
      question: questionText,
      model_answer: answerLines.join(' ') || `Refer to ${topic} study material for ${roundType} round.`,
      key_points: ['Understand the concept', 'Give a real example', 'Keep it concise'],
      difficulty: 'medium',
      active: true
    })

    if (questions.length >= 50) break
  }
  return questions
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file     = formData.get('pdf') as File
    const company  = (formData.get('company')   as string) || 'General'
    const topic    = (formData.get('topic')     as string) || 'General'
    const roundType= (formData.get('roundType') as string) || 'Technical'
    const adminKey = (formData.get('adminKey')  as string) ||
                     req.headers.get('x-admin-key') || ''

    if (adminKey !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    let questions: any[] = []
    let extractionMethod = 'local'

    // --- Try Claude API first (best quality) ---
    const apiKey = process.env.ANTHROPIC_API_KEY
    const hasValidKey = apiKey && apiKey.startsWith('sk-ant-') && apiKey.length > 20

    if (hasValidKey) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const client = new Anthropic({ apiKey })

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data: base64 }
              } as any,
              {
                type: 'text',
                text: `Extract ALL interview questions from this PDF.
Company: ${company}, Topic: ${topic}, Round: ${roundType}

Return ONLY valid JSON array, no markdown:
[{"question":"...","model_answer":"...","key_points":["...","...","..."],"difficulty":"easy|medium|hard"}]`
              }
            ]
          }]
        })

        const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
        const cleaned = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed) && parsed.length > 0) {
          questions = parsed.map(q => ({ ...q, company, topic, round_type: roundType, active: true }))
          extractionMethod = 'claude'
        }
      } catch (claudeErr: any) {
        console.error('Claude extraction failed:', claudeErr.message)
        // Fall through to local extraction
      }
    }

    // --- Local text extraction fallback ---
    if (questions.length === 0) {
      const cleanText = cleanPdfText(buffer)
      if (cleanText.length > 100) {
        questions = extractQuestionsFromCleanText(cleanText, company, topic, roundType)
        extractionMethod = 'local_text'
      }
    }

    if (questions.length === 0) {
      return NextResponse.json({
        error: hasValidKey
          ? 'No questions found in PDF. Make sure the PDF contains readable text (not scanned images).'
          : 'No ANTHROPIC_API_KEY configured. For best results, add your Claude API key to .env.local. The local extractor found no questions in this PDF.',
        hint: 'Try a PDF with text you can select/copy, not a scanned image.'
      }, { status: 400 })
    }

    // --- Save to Supabase ---
    let savedCount = 0
    try {
      const { data, error } = await supabase
        .from('pdf_questions')
        .insert(questions)
        .select()

      if (!error && data) savedCount = data.length
      else {
        // Table might not exist yet
        console.error('Supabase insert error:', error?.message)
        return NextResponse.json({
          error: `DB error: ${error?.message}. Please run SUPABASE_RUN_THIS.sql first.`
        }, { status: 500 })
      }
    } catch (dbErr: any) {
      return NextResponse.json({
        error: `DB error: ${dbErr.message}. Please run SUPABASE_RUN_THIS.sql first.`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `✅ Extracted and saved ${savedCount} questions from "${file.name}" using ${extractionMethod === 'claude' ? 'Claude AI' : 'local text extraction'}`,
      count: savedCount,
      method: extractionMethod,
      preview: questions.slice(0, 2).map(q => ({ question: q.question }))
    })

  } catch (error: any) {
    console.error('Upload PDF error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}