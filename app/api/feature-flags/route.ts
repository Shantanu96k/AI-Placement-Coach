// app/api/feature-flags/route.ts  — User-facing (no auth needed)
// Returns a flat {flagName: boolean} map for client use
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DEFAULTS: Record<string, boolean> = {
  voice_interview: true, ats_dashboard_widget: true,
  referral_program: true, ai_chat: true, buy_credits: true,
  whatsapp_coach: true, salary_coach: true,
  discount_codes: true, cover_letter_generator: true, pdf_questions: true
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('feature_flags').select('name, enabled, rollout_percent')

    if (error || !data) {
      return NextResponse.json({ flags: DEFAULTS })
    }

    const flags: Record<string, boolean> = { ...DEFAULTS }
    for (const flag of data) {
      // Respect rollout_percent: roll dice per flag
      const inRollout = Math.random() * 100 <= (flag.rollout_percent ?? 100)
      flags[flag.name] = flag.enabled && inRollout
    }

    return NextResponse.json({ flags })
  } catch {
    return NextResponse.json({ flags: DEFAULTS })
  }
}