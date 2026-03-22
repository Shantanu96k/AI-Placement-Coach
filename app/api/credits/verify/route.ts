import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      credits,
      packageName,
      amountInr,
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 })
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment verification not configured' }, { status: 500 })
    }

    // ── Verify Razorpay signature ─────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      )
    }

    // ── Payment verified — add credits ────────────────────
    const creditsToAdd = parseInt(credits) || 0
    if (creditsToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 })
    }

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('credits_remaining, plan')
      .eq('user_id', userId)
      .single()

    if (subError || !sub) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 })
    }

    const currentCredits = sub.credits_remaining >= 999999 ? 999999 : sub.credits_remaining
    const newCredits = currentCredits >= 999999 ? 999999 : currentCredits + creditsToAdd

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ credits_remaining: newCredits })
      .eq('user_id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Payment successful but credits could not be added. Contact support with: ' + razorpay_payment_id },
        { status: 500 }
      )
    }

    // Log transaction
    try {
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        type: 'purchase',
        credits: creditsToAdd,
        amount_paid: amountInr || 0,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'completed',
        notes: packageName || 'Credit purchase',
      })
    } catch { /* table may not exist yet */ }

    // ── Check if this is user's first payment — if so, award referral ──
    let referralMessage = ''
    try {
      // Check if user has any previous completed transactions (this one just logged above)
      const { data: prevTransactions } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')

      // If only 1 transaction (the one we just inserted), this is their first payment
      const isFirstPayment = !prevTransactions || prevTransactions.length <= 1

      if (isFirstPayment) {
        // Trigger referral reward via internal API call (or inline logic)
        const referralRes = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/referrals`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'process_first_payment', userId }),
          }
        )
        const referralData = await referralRes.json()
        if (referralData.rewarded) {
          referralMessage = ' + 20 bonus referral credits added! 🎉'
        }
      }
    } catch (e) {
      // Referral processing is non-critical — don't fail the whole payment
      console.error('Referral processing error:', e)
    }

    console.log(`✅ Credits verified: user ${userId} → +${creditsToAdd} credits (payment: ${razorpay_payment_id})`)

    return NextResponse.json({
      success: true,
      message: `🎉 Payment successful! ${creditsToAdd} credits added.${referralMessage}`,
      credits: creditsToAdd,
      newBalance: newCredits,
      paymentId: razorpay_payment_id,
    })
  } catch (error: any) {
    console.error('Verify credit payment error:', error)
    return NextResponse.json({ error: 'Payment verification failed: ' + error.message }, { status: 500 })
  }
}