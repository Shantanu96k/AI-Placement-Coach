// app/api/admin/credit-packages/route.ts — graceful fallback version
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

const DEFAULT_PACKAGES = [
  { id:'pkg1', name:'Starter Pack', credits:50,  price_inr:49,  bonus_credits:0,   is_popular:false, is_active:true, display_order:1 },
  { id:'pkg2', name:'Popular Pack', credits:150, price_inr:99,  bonus_credits:25,  is_popular:true,  is_active:true, display_order:2 },
  { id:'pkg3', name:'Pro Pack',     credits:300, price_inr:199, bonus_credits:50,  is_popular:false, is_active:true, display_order:3 },
  { id:'pkg4', name:'Mega Pack',    credits:600, price_inr:349, bonus_credits:100, is_popular:false, is_active:true, display_order:4 },
]

export async function GET(req: NextRequest) {
  try {
    const { data } = await supabase.from('credit_packages').select('*').eq('is_active',true).order('display_order')
    return NextResponse.json({ success: true, packages: data?.length ? data : DEFAULT_PACKAGES })
  } catch {
    return NextResponse.json({ success: true, packages: DEFAULT_PACKAGES })
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { action, ...data } = body

    if (action === 'create') {
      const { error } = await supabase.from('credit_packages').insert({
        name:          data.name,
        credits:       parseInt(data.credits),
        price_inr:     parseFloat(data.price_inr),
        bonus_credits: parseInt(data.bonus_credits) || 0,
        is_popular:    data.is_popular || false,
        display_order: parseInt(data.display_order) || 99
      })
      if (error) return NextResponse.json({ error: `Table missing. Run SUPABASE_RUN_THIS.sql first.` }, { status: 500 })
      return NextResponse.json({ success: true, message: '✅ Package created!' })
    }

    if (action === 'update') {
      const { id, ...updates } = data
      const { error } = await supabase.from('credit_packages').update({
        name:          updates.name,
        credits:       parseInt(updates.credits),
        price_inr:     parseFloat(updates.price_inr),
        bonus_credits: parseInt(updates.bonus_credits) || 0,
        is_popular:    updates.is_popular || false,
        is_active:     updates.is_active !== false
      }).eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: '✅ Package updated!' })
    }

    if (action === 'delete') {
      const { error } = await supabase.from('credit_packages').update({ is_active: false }).eq('id', data.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Package disabled!' })
    }

    if (action === 'save_settings') {
      for (const [key, value] of Object.entries(data.settings || {})) {
        await supabase.from('credit_settings').upsert(
          { setting_key: key, setting_value: String(value), updated_at: new Date().toISOString() },
          { onConflict: 'setting_key' }
        )
      }
      return NextResponse.json({ success: true, message: '✅ Settings saved!' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
// ============================================================
// FILE 2: app/api/credits/buy/route.ts  (Fix #10 — user page)
// Reads from credit_packages table (set by admin) so changes sync
// ============================================================
/*
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
*/