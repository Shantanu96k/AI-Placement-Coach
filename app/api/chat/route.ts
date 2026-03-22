import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, userContext } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'add_later') {
      const demos = [
        "Add your ANTHROPIC_API_KEY to unlock full AI coaching. For now: focus on quantifying your resume achievements (e.g. 'improved load time by 40%')!",
        "Configure your API key to get personalized advice. Quick tip: practice the STAR method for behavioral interview questions!",
        "API key needed for full coaching. Quick win: research the company before your interview — know their products and recent news!"
      ]
      return NextResponse.json({ response: demos[Math.floor(Math.random() * demos.length)] })
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Cost optimization: only keep last 6 messages for context
    const recentMessages = messages.slice(-6)

    const systemPrompt = `You are an expert AI Placement Coach for Indian job market. Be concise, specific, and actionable.

CRITICAL RULE: Your reply MUST be 80 words or fewer. Count carefully.

User: ${userContext || 'Indian fresher/student seeking placement help'}

Guidelines:
- Be direct and practical
- Use Indian context (₹, Indian companies like TCS/Infosys/Wipro)
- Give ONE key actionable tip per response
- Use emojis sparingly (max 2)
- If listing items, max 3 bullet points
- No fluff or padding words`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', // Use Haiku for cost optimization
      max_tokens: 200, // Hard cap to enforce 80-word limit
      system: systemPrompt,
      messages: recentMessages.map((m: any) => ({ role: m.role, content: m.content }))
    })

    let text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Enforce 80-word limit as a safety net
    const words = text.trim().split(/\s+/)
    if (words.length > 80) {
      text = words.slice(0, 80).join(' ') + '...'
    }

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to get response. Please try again.' }, { status: 500 })
  }
}