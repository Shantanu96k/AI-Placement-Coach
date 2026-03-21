import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [
      { count: totalUsers },
      { count: totalResumes },
      { count: totalSessions },
      { count: totalWhatsapp },
      { data: planData },
      { data: recentActivity },
      { data: revenue },
      { data: recentUsers },
    ] = await Promise.all([
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('resumes').select('*', { count: 'exact', head: true }),
      supabase.from('interview_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('whatsapp_users').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('subscriptions').select('plan, created_at'),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('revenue_transactions').select('amount, created_at, plan').order('created_at', { ascending: false }).limit(50),
      supabase.from('subscriptions').select('created_at').order('created_at', { ascending: false }).limit(30),
    ])

    const planCounts = (planData || []).reduce((acc: any, row: any) => {
      acc[row.plan] = (acc[row.plan] || 0) + 1
      return acc
    }, {})

    const totalRevenue = (revenue || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

    // Daily signups last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const signupsByDay = last7Days.map(day => ({
      date: day,
      count: (recentUsers || []).filter((u: any) =>
        u.created_at?.startsWith(day)
      ).length
    }))

    return NextResponse.json({
      success: true,
      analytics: {
        totalUsers: totalUsers || 0,
        totalResumes: totalResumes || 0,
        totalSessions: totalSessions || 0,
        totalWhatsapp: totalWhatsapp || 0,
        planCounts,
        totalRevenue,
        recentActivity: recentActivity || [],
        signupsByDay,
        recentTransactions: revenue || [],
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}