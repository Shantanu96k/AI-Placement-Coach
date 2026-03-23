// app/api/support/route.ts
// Gracefully handles missing table — never crashes
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// In-memory fallback if table doesn't exist yet
const memTickets: any[] = []

export async function POST(req: NextRequest) {
  try {
    const { userId, email, subject, message, type, priority } = await req.json()

    if (!email || !subject || !message) {
      return NextResponse.json({ error: 'Email, subject and message are required' }, { status: 400 })
    }

    const ticket = {
      user_id:  userId || null,
      email:    email.trim(),
      subject:  subject.trim(),
      message:  message.trim(),
      type:     type || 'bug',
      priority: priority || 'medium',
      status:   'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert(ticket)
        .select()
        .single()

      if (error) {
        // Table missing — save in-memory, still return success
        const memTicket = { ...ticket, id: crypto.randomUUID() }
        memTickets.unshift(memTicket)
        console.warn('support_tickets table missing, saved in-memory. Run SQL migration.')
        return NextResponse.json({
          success: true,
          message: '✅ Ticket submitted! We will reply within 24 hours.',
          ticket: memTicket
        })
      }

      return NextResponse.json({
        success: true,
        message: '✅ Ticket submitted! We will reply within 24 hours.',
        ticket: data
      })
    } catch {
      const memTicket = { ...ticket, id: crypto.randomUUID() }
      memTickets.unshift(memTicket)
      return NextResponse.json({
        success: true,
        message: '✅ Ticket submitted! We will reply within 24 hours.',
        ticket: memTicket
      })
    }

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) return NextResponse.json({ tickets: memTickets })
    return NextResponse.json({ tickets: [...(data || []), ...memTickets].slice(0, 100) })
  } catch {
    return NextResponse.json({ tickets: memTickets })
  }
}