// app/api/admin/plan-pricing/route.ts — graceful fallback version
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

const DEFAULT_PLANS = [
  { plan_key:'free',    plan_name:'Free Plan',    price_monthly:0,   price_yearly:0,    credits_included:10     },
  { plan_key:'basic',   plan_name:'Basic Plan',   price_monthly:99,  price_yearly:990,  credits_included:50     },
  { plan_key:'pro',     plan_name:'Pro Plan',     price_monthly:299, price_yearly:2990, credits_included:200    },
  { plan_key:'premium', plan_name:'Premium Plan', price_monthly:499, price_yearly:4990, credits_included:999999 },
]

export async function GET() {
  try {
    const { data, error } = await supabase.from('plan_pricing').select('*').order('price_monthly')
    if (error || !data?.length) return NextResponse.json({ success: true, plans: DEFAULT_PLANS })
    return NextResponse.json({ success: true, plans: data })
  } catch {
    return NextResponse.json({ success: true, plans: DEFAULT_PLANS })
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { plan_key, price_monthly, price_yearly, credits_included } = await req.json()

    const updates = {
      price_monthly:    parseFloat(price_monthly)    || 0,
      price_yearly:     parseFloat(price_yearly)     || 0,
      credits_included: parseInt(credits_included)   || 0,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase.from('plan_pricing').update(updates).eq('plan_key', plan_key)

    if (error) {
      // Try upsert
      const { error: upsertErr } = await supabase.from('plan_pricing').upsert({
        plan_key, plan_name: plan_key + ' Plan', ...updates
      }, { onConflict: 'plan_key' })

      if (upsertErr) {
        return NextResponse.json({
          error: `Table missing. Please run SUPABASE_RUN_THIS.sql in Supabase first.`
        }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: `✅ ${plan_key} pricing updated!` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}