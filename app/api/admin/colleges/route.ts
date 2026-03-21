import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, colleges: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // ✅ FIX: Proper body parsing with error handling
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { action, ...data } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    if (action === 'create') {
      const {
        name, city, state, contact_name,
        contact_email, contact_phone,
        students_count, plan, price_per_student, notes
      } = data

      if (!name) {
        return NextResponse.json({ error: 'College name is required' }, { status: 400 })
      }

      const { error } = await supabase.from('colleges').insert({
        name,
        city: city || null,
        state: state || null,
        contact_name: contact_name || null,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        students_count: parseInt(students_count) || 0,
        plan: plan || 'trial',
        price_per_student: parseFloat(price_per_student) || 99,
        notes: notes || null,
        active: true
      })

      if (error) throw error
      return NextResponse.json({ success: true, message: `✅ ${name} added successfully!` })
    }

    if (action === 'update') {
      const { id, ...updates } = data
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

      const { error } = await supabase
        .from('colleges')
        .update({
          ...updates,
          students_count: parseInt(updates.students_count) || 0,
          price_per_student: parseFloat(updates.price_per_student) || 0,
        })
        .eq('id', id)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'College updated!' })
    }

    if (action === 'delete') {
      const { id } = data
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

      const { error } = await supabase
        .from('colleges')
        .update({ active: false })
        .eq('id', id)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'College removed!' })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })

  } catch (error: any) {
    console.error('College API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}