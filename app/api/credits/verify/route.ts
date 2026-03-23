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

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json(
        { error: 'Missing payment verification details' },
        { status: 400 }
      )
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment verification not configured' },
        { status: 500 }
      )
    }

    // ── Verify Razorpay signature ─────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature. Please contact support.' },
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

    // Don't change unlimited credits
    const currentCredits = sub.credits_remaining >= 999999 ? 999999 : sub.credits_remaining
    const newCredits = currentCredits >= 999999 ? 999999 : currentCredits + creditsToAdd

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ credits_remaining: newCredits })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Failed to update credits after payment:', updateError)
      return NextResponse.json(
        { error: 'Payment successful but credits could not be added. Please contact support with payment ID: ' + razorpay_payment_id },
        { status: 500 }
      )
    }

    // Try to log the transaction (ignore errors if table doesn't exist)
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
    } catch {
      // Table may not exist yet — credits still added successfully
    }

    console.log(`✅ Credits verified: user ${userId} → +${creditsToAdd} credits (payment: ${razorpay_payment_id})`)

    return NextResponse.json({
      success: true,
      message: `🎉 Payment successful! ${creditsToAdd} credits added to your account.`,
      credits: creditsToAdd,
      newBalance: newCredits,
      paymentId: razorpay_payment_id,
    })
  } catch (error: any) {
    console.error('Verify credit payment error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed: ' + error.message },
      { status: 500 }
    )
  }
}