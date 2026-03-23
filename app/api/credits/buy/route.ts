import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest) {
  const { data: packages } = await supabase.from('credit_packages').select('*').eq('is_active',true).order('display_order')
  const { data: settingsData } = await supabase.from('credit_settings').select('*')
  const settings: Record<string, string> = {}
  settingsData?.forEach(s => { settings[s.setting_key] = s.setting_value })
  return NextResponse.json({
    success: true,
    packages: packages || [],
    settings: {
      min_purchase_credits:  settings.min_purchase_credits  || '20',
      max_purchase_credits:  settings.max_purchase_credits  || '10000',
      credits_per_rupee:     settings.credits_per_rupee     || '0.5',
    }
  })
}

export async function POST(req: NextRequest) {
  const { userId, email, packageId, customCredits } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  let credits = 0, amount = 0, packageName = 'Custom'

  if (packageId) {
    const { data: pkg } = await supabase.from('credit_packages').select('*').eq('id', packageId).single()
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    credits = pkg.credits + (pkg.bonus_credits || 0)
    amount  = pkg.price_inr
    packageName = pkg.name
  } else if (customCredits) {
    const { data: settingsData } = await supabase.from('credit_settings').select('setting_key,setting_value')
    const settings: Record<string,string> = {}
    settingsData?.forEach(s => { settings[s.setting_key] = s.setting_value })
    const rate = parseFloat(settings.credits_per_rupee || '0.5')
    credits = customCredits
    amount  = Math.ceil(credits / rate)
  }

  // Create Razorpay order
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'add_later') {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  const Razorpay = (await import('razorpay')).default
  const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
  const order = await rz.orders.create({ amount: amount * 100, currency: 'INR', receipt: `rcpt_${Date.now()}`, notes: { userId, credits: credits.toString() } })

  return NextResponse.json({ success:true, orderId:order.id, amount:amount*100, currency:'INR', credits, packageName, keyId:process.env.RAZORPAY_KEY_ID })
}