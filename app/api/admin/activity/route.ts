// ============================================================
// FILE 1: app/api/admin/activity/route.ts  (Fix #5)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ADMIN = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100')
  const userId = req.nextUrl.searchParams.get('userId')
  let q = sb.from('activity_logs').select('*').order('created_at', { ascending:false }).limit(limit)
  if (userId) q = q.eq('user_id', userId)
  const { data, error } = await q
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ success:true, logs: data||[] })
}

// POST — client pages call this to log actions (no auth needed)
export async function POST(req: NextRequest) {
  try {
    const { userId, email, action, metadata } = await req.json()
    if (!action) return NextResponse.json({ error:'action required' }, { status:400 })
    await sb.from('activity_logs').insert({ user_id:userId||null, email:email||null, action, metadata:metadata||{} })
    return NextResponse.json({ success:true })
  } catch (e:any) { return NextResponse.json({ error:e.message }, { status:500 }) }
}


