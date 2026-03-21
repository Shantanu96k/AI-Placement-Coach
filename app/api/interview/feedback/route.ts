import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function evaluateAnswerLocally(
  question: string,
  userAnswer: string
): {
  score: number
  feedback: string
  better_answer: string
  strengths: string[]
  improvements: string[]
} {
  const wordCount = userAnswer.trim().split(/\s+/).length
  const hasExample = userAnswer.toLowerCase().includes('example') ||
    userAnswer.toLowerCase().includes('instance') ||
    userAnswer.toLowerCase().includes('i worked') ||
    userAnswer.toLowerCase().includes('i built') ||
    userAnswer.toLowerCase().includes('i developed')
  const isDetailed = wordCount > 30
  const isTooShort = wordCount < 10

  let score = 5
  if (isTooShort) score = 3
  else if (isDetailed && hasExample) score = 8
  else if (isDetailed) score = 7
  else if (hasExample) score = 6

  return {
    score,
    feedback: isTooShort
      ? 'Your answer is too short. Try to elaborate more with examples and details.'
      : isDetailed
        ? 'Good answer! You gave a detailed response. Adding specific examples will make it even stronger.'
        : 'Decent answer. Try to be more specific and add real examples from your experience.',
    better_answer: `A strong answer to "${question}" should include: a clear direct response, a specific example or experience that proves your point, and a brief conclusion tying it back to the role you are applying for. Aim for 1-2 minutes when speaking.`,
    strengths: isDetailed
      ? ['Good length and detail', 'Clear structure']
      : ['Attempted the answer', 'On the right track'],
    improvements: isTooShort
      ? ['Add more detail', 'Include specific examples', 'Aim for at least 3-4 sentences']
      : ['Add more specific examples', 'Mention how it relates to the job role']
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, question, userAnswer, role, sessionId } = body

    if (!userId || !question || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Evaluate locally until Claude API key is added
    const feedback = evaluateAnswerLocally(question, userAnswer)

    // Update session in Supabase
    if (sessionId) {
      const { data: session } = await supabase
        .from('interview_sessions')
        .select('answers, score')
        .eq('id', sessionId)
        .single()

      const existingAnswers = (session?.answers as any[]) || []
      const updatedAnswers = [
        ...existingAnswers,
        {
          question,
          user_answer: userAnswer,
          score: feedback.score,
          feedback: feedback.feedback
        }
      ]

      const avgScore = Math.round(
        updatedAnswers.reduce((sum, a) => sum + (a.score || 0), 0) /
        updatedAnswers.length
      )

      await supabase
        .from('interview_sessions')
        .update({ answers: updatedAnswers, score: avgScore })
        .eq('id', sessionId)
    }

    return NextResponse.json({ success: true, ...feedback })

  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate answer.' },
      { status: 500 }
    )
  }
}