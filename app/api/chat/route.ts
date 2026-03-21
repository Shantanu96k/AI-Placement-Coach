import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, userContext } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY ||
        process.env.ANTHROPIC_API_KEY === 'add_later') {
      // Return demo response if no API key
      const demoResponses = [
        "I'm your AI Placement Coach! Once your Claude API key is configured, I'll give you expert career advice. For now, try building your resume or practicing interview questions!",
        "Great question! Add your ANTHROPIC_API_KEY to .env.local to unlock full AI coaching powered by Claude.",
        "I can help with resume writing, interview prep, salary negotiation, and career advice. Configure your API key to get started!"
      ]
      const demo = demoResponses[Math.floor(Math.random() * demoResponses.length)]
      return NextResponse.json({ response: demo })
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const systemPrompt = `You are an expert AI Placement Coach specializing in Indian job market.
You help students and freshers with:
- Resume writing and ATS optimization for Indian companies
- Interview preparation for TCS, Infosys, Wipro, Accenture, Amazon, Google etc.
- Career guidance and job search strategies
- Salary negotiation tactics
- Cover letter writing
- LinkedIn and Naukri profile optimization

User context: ${userContext || 'Indian fresher/student seeking placement help'}

Rules:
- Be friendly, encouraging and practical
- Give specific, actionable advice
- Use Indian context (rupees, Indian companies, Indian job market)
- Keep responses concise but complete
- Use emojis occasionally to make responses engaging
- Format with bullet points when listing multiple items`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    })

    const text = response.content[0].type === 'text'
      ? response.content[0].text : ''

    return NextResponse.json({ response: text })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get response. Please try again.' },
      { status: 500 }
    )
  }
}