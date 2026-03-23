// app/api/announcements/route.ts  — User-facing + admin POST
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

// In-memory fallback when table doesn't exist
let memAnnouncements: any[] = []

// GET — fetches active announcements for users
export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get('plan') || 'free'
  try {
    let query = supabase.from('announcements')
      .select('*').eq('active', true)
      .or(`target.eq.all,target.eq.${plan}`)
      .order('created_at', { ascending: false }).limit(5)

    const now = new Date().toISOString()
    const { data, error } = await query

    if (error) {
      // Table missing — return in-memory
      const active = memAnnouncements.filter(a =>
        a.active && (!a.expires_at || a.expires_at > now) &&
        (a.target === 'all' || a.target === plan)
      )
      return NextResponse.json({ announcements: active })
    }

    const active = (data || []).filter(a => !a.expires_at || a.expires_at > now)
    return NextResponse.json({ announcements: active })
  } catch {
    return NextResponse.json({ announcements: memAnnouncements.slice(0, 3) })
  }
}

// POST — admin creates announcement
export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { title, message, type, target, expires_at } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const ann = {
      id: crypto.randomUUID(),
      title: title || '',
      message, type: type || 'info',
      target: target || 'all',
      active: true,
      created_at: new Date().toISOString(),
      expires_at: expires_at || null
    }

    try {
      const { data, error } = await supabase.from('announcements').insert(ann).select().single()
      if (!error && data) {
        return NextResponse.json({ success: true, announcement: data, message: '✅ Announcement sent!' })
      }
    } catch {}

    // Fallback to in-memory
    memAnnouncements.unshift(ann)
    if (memAnnouncements.length > 20) memAnnouncements.pop()
    return NextResponse.json({ success: true, announcement: ann, message: '✅ Announcement active (in-memory)!' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — deactivate
export async function PATCH(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json()
  try {
    await supabase.from('announcements').update({ active: false }).eq('id', id)
    memAnnouncements = memAnnouncements.filter(a => a.id !== id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}