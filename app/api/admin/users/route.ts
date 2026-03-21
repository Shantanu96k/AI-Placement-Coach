import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Separate admin client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

function checkAdmin(key: string) {
  return key === ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (!checkAdmin(adminKey || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Try to get emails — may fail without service role
    let authUsers: any[] = []
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers()
      authUsers = data?.users || []
    } catch {
      console.log('Could not fetch auth users — service role key may be missing')
    }

    const users = (subscriptions || []).map(sub => {
      const authUser = authUsers.find((u: any) => u.id === sub.user_id)
      return {
        ...sub,
        email: authUser?.email || `user_${sub.user_id?.substring(0, 8)}`,
        last_sign_in: authUser?.last_sign_in_at,
      }
    })

    return NextResponse.json({ success: true, users })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (!checkAdmin(adminKey || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, userId, credits, plan, reason } = await req.json()

    if (action === 'add_credits') {
      const { data: current } = await supabase
        .from('subscriptions')
        .select('credits_remaining')
        .eq('user_id', userId)
        .single()

      const newCredits = (current?.credits_remaining || 0) + credits

      const { error } = await supabase
        .from('subscriptions')
        .update({ credits_remaining: newCredits })
        .eq('user_id', userId)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: `Added ${credits} credits successfully`,
        new_total: newCredits
      })
    }

    if (action === 'change_plan') {
      const planCredits: Record<string, number> = {
        free: 10, basic: 50, pro: 200, premium: 999999
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan,
          credits_remaining: planCredits[plan] || 10,
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: `Plan changed to ${plan} successfully`
      })
    }

    if (action === 'ban_user') {
      const { error } = await supabase
        .from('subscriptions')
        .update({ active: false, credits_remaining: 0 })
        .eq('user_id', userId)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'User banned' })
    }

    if (action === 'unban_user') {
      const { error } = await supabase
        .from('subscriptions')
        .update({ active: true })
        .eq('user_id', userId)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'User unbanned' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}