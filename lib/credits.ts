import { supabase } from './supabase'

export async function checkAndDeductCredits(
  userId: string,
  creditsNeeded: number
): Promise<boolean> {

  const { data, error } = await supabase
    .from('subscriptions')
    .select('credits_remaining')
    .eq('user_id', userId)
    .single()

  if (error || !data) return false
  if (data.credits_remaining < creditsNeeded) return false

  await supabase
    .from('subscriptions')
    .update({
      credits_remaining: data.credits_remaining - creditsNeeded
    })
    .eq('user_id', userId)

  return true
}

export async function getCredits(userId: string): Promise<number> {
  const { data } = await supabase
    .from('subscriptions')
    .select('credits_remaining')
    .eq('user_id', userId)
    .single()

  return data?.credits_remaining ?? 0
}