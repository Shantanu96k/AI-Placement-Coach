import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Plan details
const PLANS = {
  basic: {
    name: 'Basic Plan',
    amount: 9900,       // ₹99 in paise
    credits: 50,
    plan: 'basic'
  },
  pro: {
    name: 'Pro Plan',
    amount: 29900,      // ₹299 in paise
    credits: 200,
    plan: 'pro'
  },
  premium: {
    name: 'Premium Plan',
    amount: 49900,      // ₹499 in paise
    credits: 999999,    // Unlimited
    plan: 'premium'
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, planId } = body

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'Missing userId or planId' },
        { status: 400 }
      )
    }

    const plan = PLANS[planId as keyof typeof PLANS]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID === 'add_later') {
      return NextResponse.json(
        { error: 'Payment system not configured yet.' },
        { status: 500 }
      )
    }

    console.log('KEY ID:', process.env.RAZORPAY_KEY_ID)
    console.log('SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET)
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    })

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId,
        planId,
        credits: plan.credits.toString()
      }
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: plan.amount,
      currency: 'INR',
      planName: plan.name,
      keyId: process.env.RAZORPAY_KEY_ID
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order.' },
      { status: 500 }
    )
  }
}