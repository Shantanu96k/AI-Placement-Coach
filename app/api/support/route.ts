import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { userId, email, subject, message, priority } = await req.json()
    if (!email || !subject || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { data, error } = await supabase.from('support_tickets').insert({
      user_id: userId, email, subject, message,
      priority: priority || 'medium', status: 'open'
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, message: 'Ticket submitted! We will reply within 24 hours.', ticket: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}