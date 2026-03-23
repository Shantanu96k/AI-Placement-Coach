// app/api/discount/validate/route.ts
// Validates a discount code and returns discount details
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { code, planId, userId } = await req.json()
    if (!code?.trim()) {
      return NextResponse.json({ valid: false, error: 'Enter a discount code' }, { status: 400 })
    }

    const upperCode = code.trim().toUpperCase()

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', upperCode)
      .single()

    if (error || !discount) {
      return NextResponse.json({ valid: false, error: '❌ Invalid discount code. Check and try again.' })
    }

    if (!discount.active) {
      return NextResponse.json({ valid: false, error: '❌ This code has been deactivated.' })
    }

    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      return NextResponse.json({ valid: false, error: '❌ This code has reached its usage limit.' })
    }

    if (discount.valid_until && new Date(discount.valid_until) < new Date()) {
      return NextResponse.json({ valid: false, error: '❌ This code has expired.' })
    }

    if (discount.plan_restriction && planId && discount.plan_restriction !== planId) {
      return NextResponse.json({ valid: false, error: `❌ This code is only valid for the ${discount.plan_restriction} plan.` })
    }

    if (discount.restricted_to_user && userId && discount.restricted_to_user !== userId) {
      return NextResponse.json({ valid: false, error: '❌ This code is not valid for your account.' })
    }

    // Code is valid!
    const discountText = discount.discount_percent > 0
      ? `${discount.discount_percent}% OFF`
      : discount.discount_amount > 0
        ? `₹${discount.discount_amount} OFF`
        : 'Discount Applied'

    return NextResponse.json({
      valid: true,
      code: upperCode,
      discount_percent: discount.discount_percent || 0,
      discount_amount:  discount.discount_amount  || 0,
      description: discount.description || '',
      message: `✅ Code applied! You save ${discountText}`,
      discount_id: discount.id
    })
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: 'Server error. Try again.' }, { status: 500 })
  }
}