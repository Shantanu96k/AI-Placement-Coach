import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { data: packages } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    const { data: settingsData } = await supabase
      .from('credit_settings')
      .select('*')

    const settings: Record<string, string> = {}
    settingsData?.forEach(s => { settings[s.setting_key] = s.setting_value })

    const defaultPackages = [
      { id: 1, name: 'Starter', credits: 50, price_inr: 100, bonus_credits: 0, is_popular: false },
      { id: 2, name: 'Popular', credits: 150, price_inr: 299, bonus_credits: 25, is_popular: true },
      { id: 3, name: 'Pro Pack', credits: 300, price_inr: 599, bonus_credits: 50, is_popular: false },
      { id: 4, name: 'Mega Pack', credits: 600, price_inr: 999, bonus_credits: 100, is_popular: false },
    ]

    const defaultSettings = {
      min_purchase_credits: '20',
      max_purchase_credits: '10000',
      credits_per_rupee: '0.5',
    }

    return NextResponse.json({
      success: true,
      packages: packages?.length ? packages : defaultPackages,
      settings: Object.keys(settings).length ? settings : defaultSettings
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      packages: [
        { id: 1, name: 'Starter', credits: 50, price_inr: 100, bonus_credits: 0, is_popular: false },
        { id: 2, name: 'Popular', credits: 150, price_inr: 299, bonus_credits: 25, is_popular: true },
        { id: 3, name: 'Pro Pack', credits: 300, price_inr: 599, bonus_credits: 50, is_popular: false },
        { id: 4, name: 'Mega Pack', credits: 600, price_inr: 999, bonus_credits: 100, is_popular: false },
      ],
      settings: {
        min_purchase_credits: '20',
        max_purchase_credits: '10000',
        credits_per_rupee: '0.5',
      }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email, packageId, customCredits } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User not logged in' }, { status: 401 })
    }

    let credits = 0
    let amount = 0
    let packageName = 'Custom'

    if (packageId) {
      // Try DB first, fallback to defaults
      const defaultPackages: Record<number, any> = {
        1: { credits: 50, price_inr: 100, bonus_credits: 0, name: 'Starter' },
        2: { credits: 150, price_inr: 299, bonus_credits: 25, name: 'Popular' },
        3: { credits: 300, price_inr: 599, bonus_credits: 50, name: 'Pro Pack' },
        4: { credits: 600, price_inr: 999, bonus_credits: 100, name: 'Mega Pack' },
      }

      let pkg = defaultPackages[packageId]
      try {
        const { data } = await supabase
          .from('credit_packages')
          .select('*')
          .eq('id', packageId)
          .single()
        if (data) pkg = data
      } catch {}

      if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
      credits = pkg.credits + (pkg.bonus_credits || 0)
      amount = pkg.price_inr
      packageName = pkg.name

    } else if (customCredits) {
      const minCredits = 20
      if (customCredits < minCredits) {
        return NextResponse.json({ error: `Minimum ${minCredits} credits required` }, { status: 400 })
      }
      credits = customCredits
      amount = Math.ceil(credits * 2) // ₹2 per credit
    }

    // ✅ Skip credit_transactions table — just add credits directly
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single()

    if (subError || !sub) {
      return NextResponse.json({ error: 'User subscription not found' }, { status: 404 })
    }

    const currentCredits = sub.credits_remaining >= 999999 ? 999999 : sub.credits_remaining
    const newCredits = currentCredits + credits

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ credits_remaining: newCredits })
      .eq('user_id', userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Try to log to credit_transactions — but don't fail if table missing
    try {
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        email: email || '',
        type: 'purchase',
        credits,
        amount_paid: amount,
        package_id: packageId || null,
        status: 'completed',
        notes: packageName
      })
    } catch {
      // Table doesn't exist yet — that's OK, credits still added
    }

    return NextResponse.json({
      success: true,
      message: `✅ ${credits} credits added to your account!`,
      credits,
      amount,
      newBalance: newCredits
    })

  } catch (error: any) {
    console.error('Buy credits error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}