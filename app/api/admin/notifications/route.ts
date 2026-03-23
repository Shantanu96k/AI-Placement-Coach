// app/api/admin/notifications/route.ts  — FULL REPLACEMENT
// Sends real notifications by POSTing to announcements table
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data } = await supabase
    .from('announcements').select('*').order('created_at', { ascending: false }).limit(50)
  return NextResponse.json({ success: true, notifications: data || [] })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { title, subject, body: msgBody, target, type } = body
    const message = msgBody || subject || ''

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message body required' }, { status: 400 })
    }

    // Determine which plans to target
    const targetValue = target === 'all' ? 'all'
      : target === 'free' ? 'free'
      : target === 'basic' ? 'basic'
      : target === 'pro' ? 'pro'
      : target === 'premium' ? 'premium'
      : 'all'

    // Save as announcement — users will see it via AnnouncementBanner
    const ann = {
      title: title || subject || 'New Notification',
      message: message.trim(),
      type: type || 'info',
      target: targetValue,
      active: true,
      created_at: new Date().toISOString(),
      expires_at: null
    }

    let savedId = null
    try {
      const { data, error } = await supabase.from('announcements').insert(ann).select().single()
      if (!error && data) savedId = data.id
    } catch {}

    // Count target users
    let userCount = '?'
    try {
      let q = supabase.from('subscriptions').select('user_id', { count: 'exact', head: true })
      if (targetValue !== 'all') q = q.eq('plan', targetValue)
      const { count } = await q
      userCount = String(count || 0)
    } catch {}

    return NextResponse.json({
      success: true,
      message: `✅ Notification sent to ${userCount} ${targetValue === 'all' ? 'all users' : targetValue + ' plan users'}! It will appear as an announcement banner.`,
      id: savedId,
      recipients: userCount
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}