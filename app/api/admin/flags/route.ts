import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('feature_flags').select('*').order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, flags: data || [] })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { action, flagId, updates, flag } = await req.json()

  if (action === 'create') {
    const { data, error } = await supabase.from('feature_flags').insert(flag).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: 'Flag created!', flag: data })
  }

  if (action === 'update') {
    const { error } = await supabase.from('feature_flags').update(updates).eq('id', flagId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: 'Flag updated!' })
  }

  if (action === 'toggle') {
    const { data: current } = await supabase.from('feature_flags').select('enabled').eq('id', flagId).single()
    const { error } = await supabase.from('feature_flags').update({ enabled: !current?.enabled }).eq('id', flagId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: `Flag ${!current?.enabled ? 'enabled' : 'disabled'}` })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}