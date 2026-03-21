import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PLAN_CREDITS = {
  basic: 50,
  pro: 200,
  premium: 999999
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId
    } = body

    if (!razorpay_order_id || !razorpay_payment_id ||
        !razorpay_signature || !userId || !planId) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      )
    }

    // Payment verified — update user plan and credits
    const credits = PLAN_CREDITS[planId as keyof typeof PLAN_CREDITS] || 50

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan: planId,
        credits_remaining: credits,
        active: true,
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        ).toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { error: 'Payment received but failed to update plan.' },
        { status: 500 }
      )
    }

    console.log(`✅ Payment verified! User ${userId} upgraded to ${planId}`)

    return NextResponse.json({
      success: true,
      message: `Payment successful! You are now on ${planId} plan.`,
      credits,
      plan: planId
    })

  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed.' },
      { status: 500 }
    )
  }
}