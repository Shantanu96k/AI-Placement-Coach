import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Smart local evaluator that gives answer-specific feedback
function evaluateAnswerLocally(question: string, userAnswer: string, role: string) {
  const wordCount = userAnswer.trim().split(/\s+/).length
  const lowerAnswer = userAnswer.toLowerCase()
  const lowerQuestion = question.toLowerCase()

  // Detect question type
  const isTechnical = /difference|explain|what is|how does|define|algorithm|complexity|oop|sql|api|database|stack|queue|array|linked|tree|sorting|recursion|thread|process/i.test(question)
  const isHR = /tell me about|yourself|strength|weakness|why do you|where do you see|motivat|challenge|team|leadership|failure|achievement|salary|goal/i.test(question)
  const isSituation = /tell me about a time|describe a situation|give an example|when you had/i.test(question)

  let score = 5
  let strengths: string[] = []
  let improvements: string[] = []
  let feedback = ''
  let better_answer = ''

  // Evaluate word count
  if (wordCount < 10) {
    score = 2
    improvements.push('Your answer is too short — aim for at least 3-4 complete sentences')
    improvements.push('Add specific examples or details to support your points')
  } else if (wordCount > 200) {
    score = Math.min(score + 1, 8)
    strengths.push('Good level of detail in your response')
  }

  // Check for examples/specifics
  const hasExample = /example|instance|i worked|i built|i developed|i led|i managed|i solved|at my|during|when i|project|internship|college/i.test(lowerAnswer)
  const hasNumbers = /\d+%|\d+ years?|\d+ months?|\d+ users?|\d+ team|\d+ days?/i.test(lowerAnswer)
  const hasSTAR = /(situation|task|action|result)|(because|therefore|as a result|which led to|resulting in)/i.test(lowerAnswer)

  if (isTechnical) {
    // Check if they actually answered the technical question
    const questionKeywords = question.toLowerCase().replace(/[^a-z\s]/g, '').split(' ').filter(w => w.length > 4)
    const answeredKeywords = questionKeywords.filter(kw => lowerAnswer.includes(kw))
    const relevance = answeredKeywords.length / Math.max(questionKeywords.length, 1)

    if (relevance > 0.5) {
      score += 2
      strengths.push('You addressed the core technical concept of the question')
    } else {
      score = Math.max(score - 1, 1)
      improvements.push(`Make sure to directly address "${question.substring(0, 50)}..." in your answer`)
    }

    if (hasExample) {
      score = Math.min(score + 2, 10)
      strengths.push('You provided a practical example which shows real understanding')
    } else {
      improvements.push('Add a real-world example or code scenario to demonstrate your understanding')
    }

    // Generate better answer hint
    better_answer = `For this technical question, structure your answer as: (1) Define the concept clearly in 1-2 sentences, (2) Explain the key differences or properties, (3) Give a real-world example or use-case, (4) Mention when you would use it. For "${question}" — lead with the core definition, then contrast with related concepts.`

  } else if (isSituation) {
    // STAR method check
    if (hasSTAR || (hasExample && wordCount > 50)) {
      score = Math.min(score + 3, 10)
      strengths.push('Good use of the STAR structure in your response')
    } else {
      improvements.push('Use the STAR method: Situation → Task → Action → Result')
    }

    if (hasNumbers) {
      score = Math.min(score + 1, 10)
      strengths.push('Excellent — you quantified your impact with specific numbers')
    } else {
      improvements.push('Quantify your results (e.g. "reduced time by 30%" or "team of 5 people")')
    }

    better_answer = `For situational questions, use STAR: Start with the Situation (1 sentence), describe the Task you were responsible for (1 sentence), explain the specific Actions you took (2-3 sentences — this is the most important part), and end with the measurable Result. Always end with what you learned or how it impacted the team/project.`

  } else if (isHR) {
    if (hasExample) {
      score = Math.min(score + 2, 9)
      strengths.push('You backed your points with real experiences — great credibility')
    } else if (wordCount > 30) {
      score = Math.min(score + 1, 7)
      strengths.push('Decent length response with relevant points')
      improvements.push('Add a specific real example from your experience to make it memorable')
    }

    // Check relevance to company/role
    const hasCompanyRef = /company|join|role|position|opportunity|industry|growth|team|culture/i.test(lowerAnswer)
    if (hasCompanyRef) {
      score = Math.min(score + 1, 9)
      strengths.push('You connected your answer to the role/company which shows genuine interest')
    } else {
      improvements.push('Mention why this specific role or company excites you to personalize your answer')
    }

    better_answer = `For "${question}", structure your answer as: (1) Direct answer to the question, (2) One specific example or experience that proves your point, (3) Connect it back to this role/company. Keep it under 2 minutes when speaking. Avoid generic phrases like "I am a hard worker" — show, don't tell.`
  }

  // Final scoring adjustments
  if (wordCount >= 30 && wordCount <= 150) score = Math.min(score + 1, 10)
  if (!strengths.length) strengths.push('You attempted the question with reasonable effort')
  if (!improvements.length) improvements.push('Great answer! Practice saying it out loud to sound more natural')
  if (score < 3) score = 3
  if (score > 10) score = 10

  // Set feedback based on score
  if (score >= 8) {
    feedback = `Strong answer! You demonstrated clear understanding with relevant details. ${hasExample ? 'Your example made it memorable.' : 'Adding a specific example would make it even stronger.'}`
  } else if (score >= 6) {
    feedback = `Good attempt! Your answer covers the basics but could be more specific. ${wordCount < 40 ? 'Expand your answer with more detail.' : 'Focus on adding concrete examples to increase impact.'}`
  } else if (score >= 4) {
    feedback = `Your answer touches on the right ideas but lacks depth. Interviewers want specific, detailed responses. ${isTechnical ? 'For technical questions, always include an example or use-case.' : 'Structure your answer more clearly and add real examples.'}`
  } else {
    feedback = `This answer needs significant improvement. Make sure to directly address what was asked, provide sufficient detail, and include at least one specific example from your experience.`
  }

  return { score, feedback, better_answer, strengths, improvements }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, question, userAnswer, role, sessionId } = body

    if (!userId || !question || !userAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let result: any

    // Try Claude API for richer, truly answer-specific feedback
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'add_later') {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

        const prompt = `You are a senior HR interviewer at a top Indian IT company evaluating a candidate's answer.

QUESTION ASKED: "${question}"
CANDIDATE'S ACTUAL ANSWER: "${userAnswer}"
TARGET ROLE: ${role || 'Software Engineer'}

Evaluate THIS SPECIFIC ANSWER — do not give generic advice. Your feedback must be directly about what the candidate said.

Return ONLY valid JSON:
{
  "score": <integer 1-10, based on: content quality, relevance to question, specific examples given, structure, depth>,
  "feedback": "<2-3 sentences of specific feedback about THEIR answer — mention what they actually said, what was good, what was missing>",
  "better_answer": "<A model answer showing HOW to answer this specific question better, in 3-5 sentences>",
  "strengths": ["<something specific they DID well in their answer>", "<another specific strength>"],
  "improvements": ["<specific thing they should add or change based on what they said>", "<another specific improvement>"]
}

Rules:
- Score 8-10: Well-structured, specific examples, relevant, complete
- Score 5-7: Decent but missing examples or depth  
- Score 1-4: Off-topic, too short, missing the point
- NEVER give the same generic feedback — it must reference their actual words`

        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001', // Use faster/cheaper model for feedback
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        })

        const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
        result = JSON.parse(text.replace(/```json|```/g, '').trim())
      } catch (err) {
        console.log('Claude feedback failed, using local evaluator:', err)
        result = evaluateAnswerLocally(question, userAnswer, role)
      }
    } else {
      result = evaluateAnswerLocally(question, userAnswer, role)
    }

    // Update session in Supabase
    if (sessionId) {
      try {
        const { data: session } = await supabase.from('interview_sessions').select('answers, score').eq('id', sessionId).single()
        const existingAnswers = (session?.answers as any[]) || []
        const updatedAnswers = [...existingAnswers, { question, user_answer: userAnswer, score: result.score, feedback: result.feedback }]
        const avgScore = Math.round(updatedAnswers.reduce((s, a) => s + (a.score || 0), 0) / updatedAnswers.length)
        await supabase.from('interview_sessions').update({ answers: updatedAnswers, score: avgScore }).eq('id', sessionId)
      } catch (err) {
        console.log('Session update failed:', err)
      }
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Failed to evaluate answer.' }, { status: 500 })
  }
}