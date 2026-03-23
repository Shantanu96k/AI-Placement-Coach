// app/api/admin/feature-costs/route.ts
// Fix #1: Admin saves → Supabase → user pages read from same table = always in sync
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

const DEFAULTS: Record<string, number> = {
  ai_chat: 1, resume_builder: 5, cover_letter: 4,
  salary_evaluator: 3, salary_counter: 4, salary_benchmark: 2,
  salary_roleplay: 2, ats_score: 3, interview_session: 0
}

// GET — called by BOTH admin panel AND user pages
// ?feature=ai_chat → single cost | no params → all costs
export async function GET(req: NextRequest) {
  const feature = req.nextUrl.searchParams.get('feature')
  const adminKey = req.headers.get('x-admin-key')

  try {
    if (feature) {
      // Single feature — used by ai-coach, resume, cover-letter pages
      const { data } = await supabase
        .from('feature_credit_costs')
        .select('cost')
        .eq('feature', feature)
        .single()
      return NextResponse.json({ feature, cost: data?.cost ?? DEFAULTS[feature] ?? 1 })
    }

    // All features — used by admin panel
    if (adminKey !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('feature_credit_costs')
      .select('*')
      .order('feature')

    if (error || !data?.length) {
      // Seed defaults if table empty
      const rows = Object.entries(DEFAULTS).map(([f, c]) => ({ feature: f, cost: c }))
      await supabase.from('feature_credit_costs').upsert(rows, { onConflict: 'feature' })
      return NextResponse.json({
        success: true,
        costs: rows.map(r => ({ ...r, updated_at: new Date().toISOString() }))
      })
    }
    return NextResponse.json({ success: true, costs: data })
  } catch (err: any) {
    const costs = Object.entries(DEFAULTS).map(([f, c]) => ({ feature: f, cost: c }))
    return NextResponse.json({ success: true, costs })
  }
}

// POST — admin saves a new cost (persists to DB, immediately visible to users)
export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { feature, cost } = await req.json()
    if (!feature || cost === undefined) {
      return NextResponse.json({ error: 'Missing feature or cost' }, { status: 400 })
    }

    const numCost = parseInt(String(cost))

    const { error } = await supabase
      .from('feature_credit_costs')
      .upsert({ feature, cost: numCost, updated_at: new Date().toISOString() }, { onConflict: 'feature' })

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `✅ ${feature} updated to ${numCost} credit${numCost !== 1 ? 's' : ''}`
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}