import { NextRequest, NextResponse } from 'next/server'

// Webhook verification — Meta calls this when you set up webhook
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'myverifytoken123'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified!')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Receive incoming WhatsApp messages from students
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Check if this is a WhatsApp message
    if (
      body.object === 'whatsapp_business_account' &&
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0]
      const from = message.from // Student's phone number
      const text = message.text?.body // Student's answer

      if (text) {
        console.log(`Message from ${from}: ${text}`)
        // For now just log — Claude API feedback will be added later
        // when API key is configured
      }
    }

    // Always return 200 to Meta so they don't retry
    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ status: 'ok' })
  }
}