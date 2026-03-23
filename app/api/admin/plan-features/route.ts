// app/api/admin/plan-features/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

const DEFAULT_FEATURES = [
  { feature_key:'ai_chat',          feature_name:'AI Coach Chat',         feature_icon:'🤖', category:'ai',        free_access:true,  basic_access:true,  pro_access:true,  premium_access:true,  free_credits:1, basic_credits:1, pro_credits:1, premium_credits:0 },
  { feature_key:'resume_builder',   feature_name:'Resume Builder',        feature_icon:'📄', category:'resume',    free_access:true,  basic_access:true,  pro_access:true,  premium_access:true,  free_credits:5, basic_credits:5, pro_credits:3, premium_credits:0 },
  { feature_key:'cover_letter',     feature_name:'Cover Letter',          feature_icon:'✍️', category:'resume',    free_access:false, basic_access:true,  pro_access:true,  premium_access:true,  free_credits:0, basic_credits:4, pro_credits:2, premium_credits:0 },
  { feature_key:'ats_score',        feature_name:'ATS Scorer',            feature_icon:'🎯', category:'resume',    free_access:false, basic_access:true,  pro_access:true,  premium_access:true,  free_credits:0, basic_credits:3, pro_credits:2, premium_credits:0 },
  { feature_key:'interview_session',feature_name:'Mock Interview',        feature_icon:'🎤', category:'interview', free_access:false, basic_access:false, pro_access:true,  premium_access:true,  free_credits:0, basic_credits:0, pro_credits:0, premium_credits:0 },
  { feature_key:'whatsapp_coach',   feature_name:'WhatsApp Coach',        feature_icon:'📱', category:'coaching',  free_access:false, basic_access:false, pro_access:true,  premium_access:true,  free_credits:0, basic_credits:0, pro_credits:0, premium_credits:0 },
  { feature_key:'salary_evaluator', feature_name:'Salary Evaluator',      feature_icon:'📊', category:'salary',    free_access:false, basic_access:false, pro_access:true,  premium_access:true,  free_credits:0, basic_credits:0, pro_credits:3, premium_credits:0 },
  { feature_key:'salary_counter',   feature_name:'Salary Counter Script', feature_icon:'💬', category:'salary',    free_access:false, basic_access:false, pro_access:true,  premium_access:true,  free_credits:0, basic_credits:0, pro_credits:4, premium_credits:0 },
  { feature_key:'salary_benchmark', feature_name:'Market Benchmark',      feature_icon:'📈', category:'salary',    free_access:false, basic_access:false, pro_access:true,  premium_access:true,  free_credits:0, basic_credits:0, pro_credits:2, premium_credits:0 },
]

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { data, error } = await supabase
      .from('plan_features').select('*').order('category')
    if (error || !data?.length) {
      return NextResponse.json({ success: true, features: DEFAULT_FEATURES })
    }
    return NextResponse.json({ success: true, features: data })
  } catch {
    return NextResponse.json({ success: true, features: DEFAULT_FEATURES })
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const {
      feature_key, feature_name, feature_icon, category,
      free_access, basic_access, pro_access, premium_access,
      free_credits, basic_credits, pro_credits, premium_credits
    } = body

    if (!feature_key) {
      return NextResponse.json({ error: 'feature_key is required' }, { status: 400 })
    }

    const row = {
      feature_key,
      feature_name:    feature_name    || feature_key,
      feature_icon:    feature_icon    || '⚡',
      category:        category        || 'general',
      free_access:     free_access     ?? false,
      basic_access:    basic_access    ?? false,
      pro_access:      pro_access      ?? true,
      premium_access:  premium_access  ?? true,
      free_credits:    Number(free_credits)    || 0,
      basic_credits:   Number(basic_credits)   || 0,
      pro_credits:     Number(pro_credits)     || 0,
      premium_credits: Number(premium_credits) || 0,
      updated_at: new Date().toISOString()
    }

    // Use UPSERT — works whether row exists or not
    const { error } = await supabase
      .from('plan_features')
      .upsert(row, { onConflict: 'feature_key' })

    if (error) {
      console.error('plan_features upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `✅ ${feature_key} saved!` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}