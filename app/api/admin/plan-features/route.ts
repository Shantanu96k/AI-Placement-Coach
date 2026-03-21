import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabase.from('plan_features').select('*').order('category')
  return NextResponse.json({ success: true, features: data || [] })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { feature_key, free_access, basic_access, pro_access, premium_access,
    free_credits, basic_credits, pro_credits, premium_credits } = body
  const { error } = await supabase.from('plan_features')
    .update({ free_access, basic_access, pro_access, premium_access,
      free_credits, basic_credits, pro_credits, premium_credits,
      updated_at: new Date().toISOString() })
    .eq('feature_key', feature_key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: `✅ ${feature_key} updated!` })
}