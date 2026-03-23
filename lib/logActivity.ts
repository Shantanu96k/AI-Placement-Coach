import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function logActivity(
  userId: string | null,
  email: string | null,
  action: string,
  metadata: Record<string, any> = {}
) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId || null,
      email: email || null,
      action,
      metadata,
      created_at: new Date().toISOString()
    })
  } catch {
    // Non-blocking — never throws
  }
}