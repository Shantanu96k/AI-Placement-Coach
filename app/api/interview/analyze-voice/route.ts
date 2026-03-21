import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { question, transcript, duration, wordCount, company, round } = await req.json()

    if (!transcript || transcript.trim().length < 5) {
      return NextResponse.json({ error: 'No speech detected' }, { status: 400 })
    }

    // Count filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'right', 'okay']
    const lowerTranscript = transcript.toLowerCase()
    const fillerCounts: Record<string, number> = {}
    let totalFillers = 0
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = lowerTranscript.match(regex)
      if (matches && matches.length > 0) {
        fillerCounts[word] = matches.length
        totalFillers += matches.length
      }
    })

    // Calculate speaking pace (words per minute)
    const wpm = duration > 0 ? Math.round((wordCount / duration) * 60) : 0

    const prompt = `You are an expert interview coach analyzing a candidate's mock interview response for Indian IT companies.

INTERVIEW CONTEXT:
- Company Type: ${company}
- Round Type: ${round}
- Question Asked: "${question}"
- Candidate's Answer (speech transcript): "${transcript}"
- Duration: ${duration} seconds
- Words Spoken: ${wordCount}
- Speaking Pace: ${wpm} words per minute
- Filler Words Used: ${JSON.stringify(fillerCounts)} (total: ${totalFillers})

Analyze this interview response and provide detailed feedback. Return ONLY valid JSON in this exact format:
{
  "scores": {
    "overall": <0-100>,
    "confidence": <0-100>,
    "clarity": <0-100>,
    "relevance": <0-100>,
    "communication": <0-100>,
    "pace": <0-100>
  },
  "tone": "<Professional/Nervous/Confident/Monotone/Enthusiastic/Hesitant>",
  "paceAnalysis": "<Too Fast/Perfect/Too Slow>",
  "paceAdvice": "<one line specific advice>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "fillerAnalysis": "<brief analysis of filler word usage>",
  "contentFeedback": "<2-3 sentences on answer quality and relevance>",
  "betterAnswer": "<A model answer in 2-3 sentences showing how to answer this question better>",
  "eyeContactTip": "<one practical tip about body language/eye contact for this type of question>",
  "overallVerdict": "<Excellent/Good/Average/Needs Work>",
  "encouragement": "<one motivating sentence personalized to their performance>"
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const analysis = JSON.parse(clean)

    return NextResponse.json({
      success: true,
      analysis,
      meta: { wpm, totalFillers, fillerCounts, duration, wordCount }
    })

  } catch (error: any) {
    console.error('Voice analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}