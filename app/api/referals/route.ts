import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Deterministic code from userId — always same code for same user
function generateCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seed = userId.replace(/-/g, '').substring(0, 8)
  let code = 'REF'
  for (let i = 0; i < 6; i++) {
    const charIndex = parseInt(seed[i] || '0', 16) % chars.length
    code += chars[charIndex]
  }
  return code
}

// GET — get or create referral code for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  // Check if code already exists
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existing) return NextResponse.json({ success: true, referral: existing })

  // Create new code
  const code = generateCode(userId)
  const { data, error } = await supabase
    .from('referral_codes')
    .insert({
      user_id: userId,
      code,
      total_referrals: 0,
      successful_referrals: 0,
      credits_earned: 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, referral: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, code, referredUserId, referredEmail } = body

  // ── Validate a code (preview only, no side effects) ──────
  if (action === 'validate') {
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const { data: refCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (!refCode) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })

    return NextResponse.json({
      success: true,
      valid: true,
      message: '✅ Valid code! Both you and your friend get 20 credits after your first payment.',
    })
  }

  // ── Apply a referral code at registration time ───────────
  if (action === 'apply') {
    if (!code || !referredUserId) {
      return NextResponse.json({ error: 'Missing code or userId' }, { status: 400 })
    }

    const cleanCode = code.toUpperCase().trim()

    // Find the referral code
    const { data: refCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', cleanCode)
      .single()

    if (!refCode) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })

    // Prevent self-referral
    if (refCode.user_id === referredUserId) {
      return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 })
    }

    // Check if this user has already used ANY referral code
    const { data: existingRef } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('referred_id', referredUserId)
      .single()

    if (existingRef) {
      return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 })
    }

    // Check if THIS referrer already referred this specific person
    const { data: duplicateRef } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', refCode.user_id)
      .eq('referred_id', referredUserId)
      .single()

    if (duplicateRef) {
      return NextResponse.json({ error: 'This referral code has already been used for your account' }, { status: 400 })
    }

    // Create referral record — status "signed_up", rewards NOT given yet
    const { error: insertError } = await supabase.from('referrals').insert({
      referrer_id: refCode.user_id,
      referred_id: referredUserId,
      referred_email: referredEmail || '',
      referral_code: cleanCode,
      status: 'signed_up',           // Becomes 'rewarded' after first payment
      reward_credits: 20,
      reward_given: false,            // Credits NOT added yet — only on first payment
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Update referral_codes stats (count registrations, not payments)
    await supabase
      .from('referral_codes')
      .update({ total_referrals: (refCode.total_referrals || 0) + 1 })
      .eq('id', refCode.id)

    return NextResponse.json({
      success: true,
      message: '🎉 Code applied! You and your friend will each get +20 credits after your first payment.',
    })
  }

  // ── Called from payment verification — give rewards to both ──
  if (action === 'process_first_payment') {
    const { userId } = body
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    // Find any pending referral for this user
    const { data: pendingRef } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('reward_given', false)
      .eq('status', 'signed_up')
      .single()

    if (!pendingRef) {
      // No pending referral — this user wasn't referred, or rewards already given
      return NextResponse.json({ success: true, rewarded: false, message: 'No pending referral found' })
    }

    // Give +20 credits to the REFERRED user (the one who just paid)
    const { data: referredSub } = await supabase
      .from('subscriptions')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single()

    if (referredSub) {
      const newCredits = (referredSub.credits_remaining >= 999999)
        ? 999999
        : referredSub.credits_remaining + 20
      await supabase
        .from('subscriptions')
        .update({ credits_remaining: newCredits })
        .eq('user_id', userId)
    }

    // Give +20 credits to the REFERRER
    const { data: referrerSub } = await supabase
      .from('subscriptions')
      .select('credits_remaining')
      .eq('user_id', pendingRef.referrer_id)
      .single()

    if (referrerSub) {
      const newCredits = (referrerSub.credits_remaining >= 999999)
        ? 999999
        : referrerSub.credits_remaining + 20
      await supabase
        .from('subscriptions')
        .update({ credits_remaining: newCredits })
        .eq('user_id', pendingRef.referrer_id)
    }

    // Mark referral as rewarded so it only triggers once
    await supabase
      .from('referrals')
      .update({
        reward_given: true,
        status: 'rewarded',
        rewarded_at: new Date().toISOString(),
      })
      .eq('id', pendingRef.id)

    // Update referral_codes successful count
    const { data: refCodeRow } = await supabase
      .from('referral_codes')
      .select('successful_referrals, credits_earned')
      .eq('user_id', pendingRef.referrer_id)
      .single()

    if (refCodeRow) {
      await supabase
        .from('referral_codes')
        .update({
          successful_referrals: (refCodeRow.successful_referrals || 0) + 1,
          credits_earned: (refCodeRow.credits_earned || 0) + 20,
        })
        .eq('user_id', pendingRef.referrer_id)
    }

    console.log(`✅ Referral rewards given: referrer ${pendingRef.referrer_id} and referred ${userId} each got +20 credits`)

    return NextResponse.json({
      success: true,
      rewarded: true,
      message: '🎉 Both you and your friend received +20 credits!',
      referrerId: pendingRef.referrer_id,
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}