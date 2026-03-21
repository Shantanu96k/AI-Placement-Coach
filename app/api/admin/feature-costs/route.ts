import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

// Default costs - used if table doesn't exist yet
const DEFAULT_COSTS: Record<string, number> = {
  ai_chat: 1,
  resume_builder: 5,
  cover_letter: 4,
  salary_evaluator: 3,
  salary_counter: 4,
  salary_benchmark: 2,
  salary_roleplay: 2,
  ats_score: 3,
  interview_session: 0
}

// In-memory store as fallback
let memoryCosts: Record<string, number> = { ...DEFAULT_COSTS }

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('feature_credit_costs')
      .select('*')

    if (error || !data) {
      // Table doesn't exist — return memory costs
      const costs = Object.entries(memoryCosts).map(([feature, cost]) => ({
        feature, cost
      }))
      return NextResponse.json({ success: true, costs })
    }

    return NextResponse.json({ success: true, costs: data })

  } catch {
    const costs = Object.entries(memoryCosts).map(([feature, cost]) => ({
      feature, cost
    }))
    return NextResponse.json({ success: true, costs })
  }
}

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

    // Always update memory first
    memoryCosts[feature] = cost

    // Try to save to Supabase
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      await supabase
        .from('feature_credit_costs')
        .upsert(
          { feature, cost, updated_at: new Date().toISOString() },
          { onConflict: 'feature' }
        )
    } catch {
      // Table doesn't exist yet — memory save is enough for now
      console.log('Saved to memory (table not created yet):', feature, cost)
    }

    return NextResponse.json({
      success: true,
      message: `✅ ${feature} set to ${cost} credits`
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}