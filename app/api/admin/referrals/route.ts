import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [{ data: referrals }, { data: codes }] = await Promise.all([
    supabase.from('referrals').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('referral_codes').select('*').order('total_referrals', { ascending: false }).limit(50)
  ])
  return NextResponse.json({ success: true, referrals: referrals || [], codes: codes || [] })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { action, userId, rewardCredits } = await req.json()

  if (action === 'update_reward') {
    await supabase.from('referral_codes').update({ total_credits_earned: rewardCredits }).eq('user_id', userId)
    return NextResponse.json({ success: true, message: 'Reward updated' })
  }

  if (action === 'set_reward_credits') {
    await supabase.from('referrals').update({ reward_credits: rewardCredits }).eq('status', 'pending')
    return NextResponse.json({ success: true, message: `All pending referrals set to ${rewardCredits} credits` })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}