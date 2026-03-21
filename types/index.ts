export type Plan = 'free' | 'basic' | 'pro' | 'premium'

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  credits_remaining: number
  razorpay_sub_id?: string
  expires_at?: string
  active: boolean
}

export interface Resume {
  id: string
  user_id: string
  job_role: string
  target_company?: string
  resume_content: string
  ats_score: number
  created_at: string
}

export interface Question {
  question: string
  model_answer: string
  key_points: string[]
}

export interface InterviewSession {
  id: string
  user_id: string
  company: string
  role: string
  round_type: string
  questions: Question[]
  score: number
  created_at: string
}

export interface Profile {
  id: string
  full_name?: string
  college?: string
  branch?: string
  graduation_year?: number
  target_companies?: string[]
}

export interface WhatsAppUser {
  id: string
  user_id: string
  phone: string
  job_role: string
  experience_level: string
  active: boolean
}