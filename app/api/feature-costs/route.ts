import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('feature_credit_costs')
    .select('id, credit_cost, is_free')
    .eq('active', true)

  if (error) {
    // Return defaults if table not ready
    return NextResponse.json({
      costs: {
        ai_chat: 2, resume_builder: 5, cover_letter: 4,
        ats_checker: 2, mock_interview: 3, salary_evaluator: 3,
        salary_script: 4, market_benchmark: 2,
        interview_questions: 0, whatsapp_setup: 0
      }
    })
  }

  const costs: Record<string, number> = {}
  data?.forEach(f => { costs[f.id] = f.credit_cost })

  return NextResponse.json({ success: true, costs })
}