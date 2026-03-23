// components/FeatureFlagProvider.tsx
// Wraps the whole app — check flags via useFeatureFlag() hook in any component
'use client'
import { createContext, useContext, useEffect, useState } from 'react'

interface FlagMap { [key: string]: boolean }
const FlagContext = createContext<FlagMap>({})

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FlagMap>({
    // Safe defaults — everything on until DB says otherwise
    voice_interview: true, ats_dashboard_widget: true, referral_program: true,
    ai_chat: true, buy_credits: true, whatsapp_coach: true,
    salary_coach: true, discount_codes: true, cover_letter_generator: true,
    pdf_questions: true
  })

  useEffect(() => {
    fetch('/api/feature-flags')
      .then(r => r.json())
      .then(d => { if (d.flags) setFlags(d.flags) })
      .catch(() => {}) // keep defaults on error
  }, [])

  return <FlagContext.Provider value={flags}>{children}</FlagContext.Provider>
}

export function useFeatureFlag(name: string): boolean {
  const flags = useContext(FlagContext)
  return flags[name] ?? true // default ON if unknown
}

// ============================================================
// HOW TO USE:
// 1. Wrap your app in app/layout.tsx:
//    import { FeatureFlagProvider } from '@/components/FeatureFlagProvider'
//    <FeatureFlagProvider>{children}</FeatureFlagProvider>
//
// 2. In any component:
//    import { useFeatureFlag } from '@/components/FeatureFlagProvider'
//    const showVoiceInterview = useFeatureFlag('voice_interview')
//    {showVoiceInterview && <Link href="/mock-interview">Voice Interview</Link>}
// ============================================================