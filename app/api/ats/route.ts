import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function checkATSLocally(resumeText: string, jobDescription: string) {
  const resumeLower = resumeText.toLowerCase()
  const jdLower = jobDescription.toLowerCase()

  // Extract words from JD
  const jdWords = jdLower
    .split(/[\s,.\-\/()]+/)
    .filter(w => w.length > 3)
    .filter(w => !['with', 'that', 'this', 'will', 'have',
      'from', 'your', 'they', 'been', 'were', 'what',
      'when', 'where', 'which', 'their', 'about'].includes(w))

  const uniqueJdWords = Array.from(new Set(jdWords))

  const matched: string[] = []
  const missing: string[] = []

  uniqueJdWords.forEach(word => {
    if (resumeLower.includes(word)) {
      matched.push(word)
    } else {
      missing.push(word)
    }
  })

  const score = Math.min(
    100,
    Math.round((matched.length / uniqueJdWords.length) * 100)
  )

  return {
    score,
    matched_keywords: matched.slice(0, 15),
    missing_keywords: missing.slice(0, 10),
    suggestions: [
      'Add the missing keywords naturally in your resume',
      'Match your skills section with the exact words from the job description',
      'Use the same job title mentioned in the JD in your summary',
      'Quantify your achievements with numbers and percentages',
      'Add a strong professional summary targeting this specific role'
    ]
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, resumeText, jobDescription, resumeId } = body

    if (!userId || !resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check credits
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single()

    if (!sub || sub.credits_remaining < 2) {
      return NextResponse.json(
        { error: 'Not enough credits. You need 2 credits.' },
        { status: 402 }
      )
    }

    // Deduct 2 credits
    await supabase
      .from('subscriptions')
      .update({ credits_remaining: sub.credits_remaining - 2 })
      .eq('user_id', userId)

    let result

    // Try Claude if available
    if (process.env.ANTHROPIC_API_KEY &&
        process.env.ANTHROPIC_API_KEY !== 'add_later') {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const client = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        })
        const prompt = `
You are an ATS system used by Indian companies like TCS, Infosys, Wipro.

RESUME: ${resumeText}
JOB DESCRIPTION: ${jobDescription}

Return ONLY valid JSON — no extra text:
{
  "score": <0-100>,
  "matched_keywords": ["word1", "word2"],
  "missing_keywords": ["word1", "word2"],
  "suggestions": ["tip1", "tip2", "tip3"]
}
`
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }]
        })
        const text = response.content[0].type === 'text'
          ? response.content[0].text : '{}'
        result = JSON.parse(text.replace(/```json|```/g, '').trim())
      } catch {
        result = checkATSLocally(resumeText, jobDescription)
      }
    } else {
      result = checkATSLocally(resumeText, jobDescription)
    }

    // Update ATS score in DB
    if (resumeId) {
      await supabase
        .from('resumes')
        .update({ ats_score: result.score })
        .eq('id', resumeId)
    }

    return NextResponse.json({ success: true, ...result })

  } catch (error) {
    console.error('ATS error:', error)
    return NextResponse.json(
      { error: 'Failed to check ATS score.' },
      { status: 500 }
    )
  }
}