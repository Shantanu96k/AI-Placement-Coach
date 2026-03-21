import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  const { data } = await supabase
    .from('plan_pricing')
    .select('*')
    .order('price_monthly')
  return NextResponse.json({ success: true, plans: data || [] })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { plan_key, price_monthly, price_yearly, credits_included } = body

  const { error } = await supabase.from('plan_pricing')
    .update({
      price_monthly: parseFloat(price_monthly),
      price_yearly: parseFloat(price_yearly) || null,
      credits_included: parseInt(credits_included) || 0,
      updated_at: new Date().toISOString()
    })
    .eq('plan_key', plan_key)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: `✅ ${plan_key} pricing updated!` })
}