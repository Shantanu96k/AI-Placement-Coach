import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const company = req.nextUrl.searchParams.get('company')
    const topic = req.nextUrl.searchParams.get('topic')
    const roundType = req.nextUrl.searchParams.get('roundType')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')

    let query = supabase
      .from('pdf_questions')
      .select('*')
      .eq('active', true)

    if (company && company !== 'General') {
      query = query.eq('company', company)
    }
    if (topic) {
      query = query.eq('topic', topic)
    }
    if (roundType) {
      query = query.eq('round_type', roundType)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      questions: data,
      count: data.length
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// Delete question
export async function DELETE(req: NextRequest) {
  try {
    const { id, adminKey } = await req.json()

    if (adminKey !== (process.env.ADMIN_SECRET || 'admin123')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase
      .from('pdf_questions')
      .update({ active: false })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    )
  }
}