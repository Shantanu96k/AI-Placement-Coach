import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

// Get all discount codes
export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ discounts: [] })
  }

  return NextResponse.json({ success: true, discounts: data })
}

// Create discount code
export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      code, discount_percent, max_uses,
      valid_until, plan_restriction, description
    } = await req.json()

    const { data, error } = await supabase
      .from('discount_codes')
      .insert({
        code: code.toUpperCase(),
        discount_percent,
        max_uses: max_uses || 100,
        used_count: 0,
        valid_until,
        plan_restriction,
        description,
        active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `Discount code ${code.toUpperCase()} created!`,
      discount: data
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Delete/deactivate discount
export async function DELETE(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()

  await supabase
    .from('discount_codes')
    .update({ active: false })
    .eq('id', id)

  return NextResponse.json({ success: true })
}