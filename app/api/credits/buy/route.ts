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
      { id: 1, name: 'Starter', credits: 50, price_inr: 49, bonus_credits: 0, is_popular: false },
      { id: 2, name: 'Popular', credits: 150, price_inr: 99, bonus_credits: 25, is_popular: true },
      { id: 3, name: 'Pro Pack', credits: 300, price_inr: 199, bonus_credits: 50, is_popular: false },
      { id: 4, name: 'Mega Pack', credits: 600, price_inr: 349, bonus_credits: 100, is_popular: false },
    ]

    return NextResponse.json({
      success: true,
      packages: packages?.length ? packages : defaultPackages,
      settings: Object.keys(settings).length ? settings : {
        min_purchase_credits: '20',
        max_purchase_credits: '10000',
        credits_per_rupee: '1',
      }
    })
  } catch {
    return NextResponse.json({
      success: true,
      packages: [
        { id: 1, name: 'Starter', credits: 50, price_inr: 49, bonus_credits: 0, is_popular: false },
        { id: 2, name: 'Popular', credits: 150, price_inr: 99, bonus_credits: 25, is_popular: true },
        { id: 3, name: 'Pro Pack', credits: 300, price_inr: 199, bonus_credits: 50, is_popular: false },
        { id: 4, name: 'Mega Pack', credits: 600, price_inr: 349, bonus_credits: 100, is_popular: false },
      ],
      settings: { min_purchase_credits: '20', max_purchase_credits: '10000', credits_per_rupee: '1' }
    })
  }
}

// POST: Creates a Razorpay order — does NOT add credits directly
export async function POST(req: NextRequest) {
  try {
    const { userId, email, packageId, customCredits } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'add_later') {
      return NextResponse.json({ error: 'Payment system not configured.' }, { status: 500 })
    }

    // Resolve package details
    let credits = 0
    let amountPaise = 0
    let packageName = 'Custom'

    if (packageId) {
      const defaultPackages: Record<number, any> = {
        1: { credits: 50, price_inr: 49, bonus_credits: 0, name: 'Starter' },
        2: { credits: 150, price_inr: 99, bonus_credits: 25, name: 'Popular' },
        3: { credits: 300, price_inr: 199, bonus_credits: 50, name: 'Pro Pack' },
        4: { credits: 600, price_inr: 349, bonus_credits: 100, name: 'Mega Pack' },
      }

      let pkg = defaultPackages[packageId]
      try {
        const { data } = await supabase.from('credit_packages').select('*').eq('id', packageId).single()
        if (data) pkg = data
      } catch {}

      if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

      credits = pkg.credits + (pkg.bonus_credits || 0)
      amountPaise = Math.round(pkg.price_inr * 100) // paise
      packageName = pkg.name
    } else if (customCredits) {
      const minCredits = 20
      if (customCredits < minCredits) {
        return NextResponse.json({ error: `Minimum ${minCredits} credits required` }, { status: 400 })
      }
      credits = customCredits
      // ₹1 = 1 credit (adjust as needed)
      const priceInr = Math.ceil(customCredits)
      amountPaise = priceInr * 100
      packageName = `${customCredits} Credits`
    } else {
      return NextResponse.json({ error: 'Provide packageId or customCredits' }, { status: 400 })
    }

    // Create Razorpay order
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `credits_${Date.now()}`,
      notes: {
        userId,
        email: email || '',
        credits: credits.toString(),
        packageName,
        type: 'credit_purchase',
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amountPaise,
      amountInr: amountPaise / 100,
      currency: 'INR',
      credits,
      packageName,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error('Create credit order error:', error)
    return NextResponse.json({ error: 'Failed to create payment order: ' + error.message }, { status: 500 })
  }
}