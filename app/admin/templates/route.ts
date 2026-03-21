import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, templateId } = await req.json()

    if (!userId || !templateId) {
      return NextResponse.json(
        { error: 'Missing userId or templateId' },
        { status: 400 }
      )
    }

    // Get template details
    const { data: template, error: tError } = await supabase
      .from('resume_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (tError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // If free template — allow directly
    if (template.is_free || template.credit_cost === 0) {
      return NextResponse.json({
        success: true,
        message: 'Free template — enjoy!',
        credits_deducted: 0,
        credits_remaining: null
      })
    }

    // Check user credits
    const { data: sub, error: sError } = await supabase
      .from('subscriptions')
      .select('credits_remaining, plan')
      .eq('user_id', userId)
      .single()

    if (sError || !sub) {
      return NextResponse.json(
        { error: 'User subscription not found' },
        { status: 404 }
      )
    }

    // Premium users get all templates free
    if (sub.plan === 'premium' || sub.credits_remaining >= 999999) {
      return NextResponse.json({
        success: true,
        message: 'Premium access — all templates unlocked!',
        credits_deducted: 0,
        credits_remaining: sub.credits_remaining
      })
    }

    // Check if enough credits
    if (sub.credits_remaining < template.credit_cost) {
      return NextResponse.json({
        error: `Not enough credits. This template costs ${template.credit_cost} credits. You have ${sub.credits_remaining}.`,
        credits_needed: template.credit_cost,
        credits_have: sub.credits_remaining,
        needs_upgrade: true
      }, { status: 402 })
    }

    // Deduct credits
    const newCredits = sub.credits_remaining - template.credit_cost

    const { error: uError } = await supabase
      .from('subscriptions')
      .update({ credits_remaining: newCredits })
      .eq('user_id', userId)

    if (uError) throw uError

    return NextResponse.json({
      success: true,
      message: `${template.credit_cost} credits used for ${template.name} template`,
      credits_deducted: template.credit_cost,
      credits_remaining: newCredits
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}