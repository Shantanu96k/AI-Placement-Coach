import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  const { data } = await supabase
    .from('credit_packages')
    .select('*')
    .order('display_order')
  return NextResponse.json({ success: true, packages: data || [] })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, ...data } = body

  if (action === 'create') {
    const { error } = await supabase.from('credit_packages').insert({
      name: data.name,
      credits: parseInt(data.credits),
      price_inr: parseFloat(data.price_inr),
      bonus_credits: parseInt(data.bonus_credits) || 0,
      is_popular: data.is_popular || false,
      display_order: parseInt(data.display_order) || 99
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: '✅ Package created!' })
  }

  if (action === 'update') {
    const { id, ...updates } = data
    const { error } = await supabase.from('credit_packages')
      .update({
        name: updates.name,
        credits: parseInt(updates.credits),
        price_inr: parseFloat(updates.price_inr),
        bonus_credits: parseInt(updates.bonus_credits) || 0,
        is_popular: updates.is_popular || false,
        is_active: updates.is_active
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: '✅ Package updated!' })
  }

  if (action === 'delete') {
    const { error } = await supabase.from('credit_packages')
      .update({ is_active: false }).eq('id', data.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: 'Package disabled!' })
  }

  if (action === 'save_settings') {
    for (const [key, value] of Object.entries(data.settings)) {
      await supabase.from('credit_settings')
        .upsert({ setting_key: key, setting_value: String(value), updated_at: new Date().toISOString() },
          { onConflict: 'setting_key' })
    }
    return NextResponse.json({ success: true, message: '✅ Settings saved!' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}