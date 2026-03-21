import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const status = req.nextUrl.searchParams.get('status')
  let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  const { data, error } = await query.limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, tickets: data })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { ticketId, status, priority, adminReply } = await req.json()
  const updates: any = { updated_at: new Date().toISOString() }
  if (status) updates.status = status
  if (priority) updates.priority = priority
  if (adminReply) updates.admin_reply = adminReply
  const { error } = await supabase.from('support_tickets').update(updates).eq('id', ticketId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: 'Ticket updated' })
}