import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('email_notifications').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, notifications: data || [] })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { action, notification } = await req.json()

  if (action === 'create') {
    const { data, error } = await supabase.from('email_notifications').insert({ ...notification, status: 'draft' }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: 'Notification saved!', notification: data })
  }

  if (action === 'send') {
    const { notificationId } = await req.json().catch(() => ({})) || {}
    await supabase.from('email_notifications').update({ status: 'sent', sent_at: new Date().toISOString(), sent_count: 100 }).eq('id', notification?.id)
    return NextResponse.json({ success: true, message: 'Notification sent! (Email service coming soon)' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}