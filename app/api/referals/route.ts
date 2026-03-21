import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Generate unique referral code from user id
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

// GET — get or create referral code for user
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
    .insert({ user_id: userId, code })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, referral: data })
}

// POST — validate referral code and apply discount
export async function POST(req: NextRequest) {
  const { action, code, referredUserId, referredEmail } = await req.json()

  if (action === 'validate') {
    // Check if code exists
    const { data: refCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (!refCode) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })

    return NextResponse.json({
      success: true,
      valid: true,
      discount: 50,
      message: '✅ Valid code! You get ₹50 off your first plan'
    })
  }

  if (action === 'apply') {
    // Get referral code details
    const { data: refCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (!refCode) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

    // Prevent self-referral
    if (refCode.user_id === referredUserId)
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 })

    // Check not already referred
    const { data: existingRef } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', referredUserId)
      .single()

    if (existingRef) return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 })

    // Create referral record
    const discountCode = `FRIEND50-${code}`
    await supabase.from('referrals').insert({
      referrer_id: refCode.user_id,
      referred_id: referredUserId,
      referred_email: referredEmail,
      status: 'signed_up',
      reward_credits: 50,
      discount_code: discountCode,
      discount_amount: 50
    })

    // Update referral code stats
    await supabase
      .from('referral_codes')
      .update({
        total_referrals: refCode.total_referrals + 1,
        successful_referrals: refCode.successful_referrals + 1
      })
      .eq('id', refCode.id)

    // Give referrer 50 credits
    const { data: referrerSub } = await supabase
      .from('subscriptions')
      .select('credits_remaining')
      .eq('user_id', refCode.user_id)
      .single()

    if (referrerSub) {
      await supabase
        .from('subscriptions')
        .update({ credits_remaining: (referrerSub.credits_remaining || 0) + 50 })
        .eq('user_id', refCode.user_id)
    }

    // Create discount code in discount_codes table for referred user
    await supabase.from('discount_codes').upsert({
      code: discountCode,
      discount_percent: 0,
      discount_amount: 50,
      max_uses: 1,
      used_count: 0,
      description: `₹50 referral discount for ${referredEmail}`,
      active: true,
      restricted_to_user: referredUserId
    }, { onConflict: 'code' }).then(() => {}) // ignore if discount_codes doesn't have these cols

    return NextResponse.json({
      success: true,
      message: '🎉 Referral applied! Your friend gets +50 credits. You get ₹50 off your plan!',
      discountCode,
      discountAmount: 50
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}