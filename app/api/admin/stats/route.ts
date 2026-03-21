import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== (process.env.ADMIN_SECRET || 'admin123')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      { count: totalUsers },
      { data: planData },
      { count: totalResumes },
      { count: totalSessions },
      { count: whatsappUsers },
      { data: recentUsers }
    ] = await Promise.all([
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('plan'),
      supabase.from('resumes').select('*', { count: 'exact', head: true }),
      supabase.from('interview_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('whatsapp_users').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(5)
    ])

    const planCounts = (planData || []).reduce((acc: any, row: any) => {
      acc[row.plan] = (acc[row.plan] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalResumes: totalResumes || 0,
        totalSessions: totalSessions || 0,
        whatsappUsers: whatsappUsers || 0,
        planCounts,
        recentUsers: recentUsers || []
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}