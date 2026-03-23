'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import AdminSuperWidget from '@/components/AdminSuperWidget'
import ReferralSection from '@/components/ReferralSection'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import { useActivityLogger } from '@/hooks/useActivityLogger'
import SupportWidget from '@/components/SupportWidget'
import { useFeatureFlag } from '@/components/FeatureFlagProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function CreditBadge({ credits, plan }: { credits: number; plan: string }) {
  const [displayed, setDisplayed] = useState(0)
  const [pulse, setPulse] = useState(false)
  const isUnlimited = credits >= 999999
  const isLow = !isUnlimited && credits <= 5

  useEffect(() => {
    if (isUnlimited) return
    let start = 0
    const target = credits
    const step = Math.max(1, Math.floor(target / 40))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setDisplayed(target); clearInterval(timer) }
      else setDisplayed(start)
    }, 30)
    return () => clearInterval(timer)
  }, [credits])

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex', alignItems: 'center', gap: '10px',
      background: isLow ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${isLow ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
      borderRadius: '16px', padding: '10px 20px',
      boxShadow: pulse
        ? `0 0 20px ${isLow ? 'rgba(239,68,68,0.3)' : 'rgba(37,99,235,0.3)'}`
        : `0 0 8px ${isLow ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)'}`,
      transition: 'box-shadow 1s ease'
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: isLow ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', flexShrink: 0,
        animation: 'coinSpin 3s ease-in-out infinite',
        boxShadow: `0 0 12px ${isLow ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)'}`
      }}>⚡</div>
      <div>
        <div style={{ fontSize: '15px', fontWeight: '800', color: isLow ? '#fca5a5' : 'white', lineHeight: '1' }}>
          {isUnlimited ? '∞ Unlimited' : displayed.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', fontWeight: '600' }}>
          {isLow ? 'LOW CREDITS ⚠️' : 'CREDITS'}
        </div>
      </div>
    </div>
  )
}

function AnimatedIcon({ emoji, color, size = 40, animation = 'bounce' }: any) {
  const [hovered, setHovered] = useState(false)
  const animations: Record<string, string> = {
    bounce: 'iconBounce 2s ease-in-out infinite',
    spin: 'iconSpin 4s linear infinite',
    pulse: 'iconPulse 2s ease-in-out infinite',
    shake: 'iconShake 3s ease-in-out infinite',
    float: 'iconFloat 3s ease-in-out infinite',
  }
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: size, height: size, borderRadius: size * 0.4,
        background: `linear-gradient(135deg, ${color}30, ${color}15)`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.5,
        animation: hovered ? 'iconPop 0.3s ease' : animations[animation],
        transform: hovered ? 'scale(1.2) rotate(-5deg)' : 'scale(1)',
        transition: 'transform 0.2s, background 0.2s',
        cursor: 'default',
        boxShadow: hovered ? `0 8px 20px ${color}40` : 'none'
      }}>
      {emoji}
    </div>
  )
}

function ATSScoreCircle({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    let s = 0
    const step = score / 50
    const t = setInterval(() => {
      s += step; if (s >= score) { setDisplayed(score); clearInterval(t) }
      else setDisplayed(Math.floor(s))
    }, 20)
    return () => clearInterval(t)
  }, [score])

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const dash = (2 * Math.PI * 54) * (1 - displayed / 100)

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
      <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={2 * Math.PI * 54} strokeDashoffset={dash}
        strokeLinecap="round" transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 0.02s linear', filter: `drop-shadow(0 0 8px ${color}80)` }} />
      <text x="70" y="67" textAnchor="middle" dominantBaseline="central" fill={color} fontSize="26" fontWeight="800" fontFamily="system-ui">{displayed}</text>
      <text x="70" y="87" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="system-ui">/ 100</text>
    </svg>
  )
}

function ATSCheckerWidget({ userId, credits, onCreditsUpdate }: any) {
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowed = ['txt', 'pdf', 'doc', 'docx']
    if (!ext || !allowed.includes(ext)) { setError('Upload .txt, .pdf, .doc, or .docx file'); return }
    setFileName(file.name)
    setError('')

    if (ext === 'txt') {
      const reader = new FileReader()
      reader.onload = e => setResumeText(e.target?.result as string || '')
      reader.readAsText(file)
      return
    }

    // PDF/DOC — send to Claude for proper extraction
    setExtracting(true)
    setResumeText('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/extract-pdf-text', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Could not extract text. Paste your resume text below instead.')
        setFileName('')
      } else {
        setResumeText(data.text.trim())
      }
    } catch {
      setError('Failed to process file. Paste your resume text manually below.')
      setFileName('')
    } finally {
      setExtracting(false)
    }
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError('Upload your resume first'); return }
    if (!jobDesc.trim()) { setError('Paste job description'); return }
    if (!userId) { setError('Please login'); return }
    if (credits < 2) { setError('Need 2 credits for ATS check'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/ats', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, resumeText, jobDescription: jobDesc })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Analysis failed'); return }
      setResult(data)
      onCreditsUpdate(credits - 2)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', marginTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <AnimatedIcon emoji="🎯" color="#7c3aed" size={44} animation="pulse" />
        <div>
          <h3 style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>ATS Resume Checker</h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>Upload your resume to check ATS compatibility — costs 2 credits</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px' }}>⚠️ {error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <div
            onClick={() => !extracting && fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={e => e.preventDefault()}
            style={{
              border: `2px dashed ${fileName && resumeText ? 'rgba(16,185,129,0.4)' : extracting ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '14px', padding: '24px', textAlign: 'center',
              cursor: extracting ? 'wait' : 'pointer', marginBottom: '12px',
              background: fileName && resumeText ? 'rgba(16,185,129,0.06)' : extracting ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s',
              animation: extracting ? 'iconPulse 1.5s ease-in-out infinite' : 'none'
            }}
          >
            <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {extracting ? (
              <>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                <div style={{ color: '#60a5fa', fontWeight: '700', fontSize: '14px' }}>Extracting text from PDF...</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>AI is reading your resume</div>
              </>
            ) : fileName && resumeText ? (
              <>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                <div style={{ color: '#4ade80', fontWeight: '700', fontSize: '14px' }}>{fileName}</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{resumeText.split(/\s+/).length} words · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                <div style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px' }}>Drop resume here</div>
                <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>.txt, .pdf, .doc, .docx</div>
              </>
            )}
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Or paste resume text</label>
            <textarea
              value={resumeText} onChange={e => { setResumeText(e.target.value); if (e.target.value) setFileName('') }}
              rows={4} placeholder="Paste your resume text here..."
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Description *</label>
            <textarea
              value={jobDesc} onChange={e => setJobDesc(e.target.value)}
              rows={7} placeholder="Paste the full job description from Naukri, LinkedIn, etc..."
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const }}
            />
          </div>
          <button onClick={handleAnalyze} disabled={loading || extracting || !resumeText.trim() || !jobDesc.trim()}
            style={{
              padding: '13px', background: (loading || extracting) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
              border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700',
              cursor: (loading || extracting || !resumeText.trim() || !jobDesc.trim()) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', boxShadow: (loading || extracting) ? 'none' : '0 8px 20px rgba(124,58,237,0.4)'
            }}>
            {loading ? '🔍 Analyzing...' : extracting ? '⏳ Extracting PDF...' : '🎯 Check ATS Score — 2 Credits'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
            <ATSScoreCircle score={result.score} />
            <div style={{
              marginTop: '8px', padding: '5px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700',
              background: result.score >= 75 ? 'rgba(16,185,129,0.15)' : result.score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
              color: result.score >= 75 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#ef4444'
            }}>
              {result.score >= 75 ? '🏆 Excellent Match' : result.score >= 50 ? '⚡ Good — Improve More' : '🔧 Needs Work'}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#4ade80', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Matched Keywords</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
              {result.matched_keywords?.slice(0, 12).map((k: string, i: number) => (
                <span key={i} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#4ade80', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '8px' }}>✓ {k}</span>
              ))}
            </div>
            <h4 style={{ color: '#f87171', fontSize: '13px', fontWeight: '700', marginBottom: '10px', marginTop: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>❌ Missing Keywords</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
              {result.missing_keywords?.slice(0, 8).map((k: string, i: number) => (
                <span key={i} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '8px' }}>✗ {k}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 AI Tips</h4>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
              {result.suggestions?.map((tip: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '8px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ width: '3px', borderRadius: '2px', background: '#7c3aed', flexShrink: 0 }} />
                  <p style={{ color: '#e2e8f0', fontSize: '12px', lineHeight: '1.5' }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState(0)
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)
        const { data } = await supabase.from('subscriptions').select('credits_remaining, plan').eq('user_id', user.id).single()
        if (data) { setCredits(data.credits_remaining); setPlan(data.plan) }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const firstName = user?.email?.split('@')[0] || 'User'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening'

  const PLAN_COLORS: Record<string, string> = { free: '#a1a1aa', basic: '#3b82f6', pro: '#8b5cf6', premium: '#f59e0b' }
  const planColor = PLAN_COLORS[plan] || '#a1a1aa'
  useActivityLogger(user?.id, user?.email, 'viewed_dashboard')

  const QUICK_ACTIONS = [
    { emoji: '📄', label: 'Resume Builder', desc: 'ATS-friendly resume for Indian companies.', href: '/resume', color: '#2563eb', credits: '5 credits', tag: 'Popular', locked: false, anim: 'float' },
    { emoji: '🎯', label: 'Interview Coach', desc: 'TCS, Infosys, Wipro Q&A + mock interview.', href: '/interview', color: '#7c3aed', credits: 'Free', tag: 'Free', locked: false, anim: 'bounce' },
    { emoji: '✍️', label: 'Cover Letter', desc: 'AI-written personalised cover letters in seconds.', href: '/cover-letter', color: '#6366f1', credits: '4 credits', tag: plan === 'pro' || plan === 'premium' ? '✨ Active' : '🔒 Pro', locked: !['pro', 'premium'].includes(plan), anim: 'shake' },
    { emoji: '📱', label: 'WhatsApp Coach', desc: '10 questions daily on WhatsApp. AI evaluated.', href: '/whatsapp', color: '#059669', credits: 'Pro+', tag: plan === 'pro' || plan === 'premium' ? '✅ Active' : '🔒 Pro', locked: !['pro', 'premium'].includes(plan), anim: 'pulse' },
    { emoji: '🤖', label: 'AI Coach Chat', desc: 'Ask anything about placement & career.', href: '/ai-coach', color: '#7c3aed', credits: '1 credit', tag: 'Chat', locked: false, anim: 'spin' },
    { emoji: '💰', label: 'Salary Coach', desc: 'Negotiate offers & benchmark your market worth.', href: '/salary', color: '#d97706', credits: 'Pro+', tag: plan === 'pro' || plan === 'premium' ? '✨ Active' : '🔒 Pro', locked: !['pro', 'premium'].includes(plan), anim: 'float' },
    { emoji: '🎤', label: 'Voice Interview', desc: 'AI analyzes tone, pace & confidence.', href: '/mock-interview', color: '#8b5cf6', credits: 'Pro+', tag: '🆕 BETA', locked: false, anim: 'pulse' },
    { emoji: '💳', label: 'Upgrade Plan', desc: 'Get more credits and unlock all features.', href: '/billing', color: '#0891b2', credits: '₹99/mo', tag: null, locked: false, anim: 'bounce' },
  ]

  const NAV_ITEMS = [
    { icon: '🏠', label: 'Overview', tab: 'overview', anim: 'float' },
    { icon: '📄', label: 'Resume Builder', href: '/resume', anim: 'bounce' },
    { icon: '✍️', label: 'Cover Letter', href: '/cover-letter', anim: 'shake' },
    { icon: '🎯', label: 'Interview Coach', href: '/interview', anim: 'pulse' },
    { icon: '📱', label: 'WhatsApp Coach', href: '/whatsapp', anim: 'float' },
    { icon: '💰', label: 'Salary Coach', href: '/salary', anim: 'bounce' },
    { icon: '🎤', label: 'Voice Interview', href: '/mock-interview', anim: 'pulse' },
  ]

  const todayTip = [
    '💡 Add quantified achievements to your resume (e.g. "Reduced load time by 40%")',
    '🎯 Research the company before your interview — know their products and values',
    '📱 Practice 10 WhatsApp questions daily to build interview confidence',
    '🔍 Always check your ATS score before applying to any job',
    '⭐ Use the STAR method for behavioral interview questions',
  ][new Date().getDay() % 5]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060914', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' as const }}>
        <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: '16px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '24px', animation: 'spin 1s linear infinite', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>✨</div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>Loading your dashboard...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #060914; }

        @keyframes coinSpin { 0%,100%{transform:rotate(-10deg) scale(1)}50%{transform:rotate(10deg) scale(1.1)} }
        @keyframes iconBounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
        @keyframes iconSpin { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
        @keyframes iconPulse { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:.85} }
        @keyframes iconShake { 0%,100%{transform:rotate(0deg)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)} }
        @keyframes iconFloat { 0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-4px) rotate(-3deg)}66%{transform:translateY(2px) rotate(3deg)} }
        @keyframes iconPop { 0%{transform:scale(1)}50%{transform:scale(1.3) rotate(-10deg)}100%{transform:scale(1.2) rotate(-5deg)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 12px rgba(124,58,237,0.3)}50%{box-shadow:0 0 32px rgba(124,58,237,0.6),0 0 60px rgba(37,99,235,0.3)} }
        @keyframes gradientText { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
        @keyframes progress { from{width:0%} }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* ── Buy Credits pulsing animation ── */
        @keyframes buyCreditsGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.5), 0 4px 14px rgba(37,99,235,0.3); }
          50% { box-shadow: 0 0 0 5px rgba(37,99,235,0), 0 6px 22px rgba(124,58,237,0.55); }
        }
        @keyframes buyCreditsShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes buyCreditsIcon {
          0%,100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.15) rotate(-8deg); }
          75% { transform: scale(1.15) rotate(8deg); }
        }

        .sidebar { position:fixed;left:0;top:0;bottom:0;width:260px;background:rgba(6,9,20,0.95);backdrop-filter:blur(24px);border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;z-index:100 }

        .nav-item { display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;cursor:pointer;margin-bottom:2px;text-decoration:none;color:rgba(255,255,255,0.5);font-size:14px;font-weight:500;transition:all 0.2s;position:relative;overflow:hidden }
        .nav-item:hover { color:white;background:rgba(255,255,255,0.06) }
        .nav-item.active { color:white;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3) }
        .nav-item.active::before { content:'';position:absolute;left:0;top:20%;height:60%;width:3px;background:linear-gradient(180deg,#7c3aed,#2563eb);border-radius:0 3px 3px 0;box-shadow:0 0 8px #7c3aed }

        /* The animated Buy Credits button */
        .buy-credits-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 12px; cursor: pointer;
          margin: 6px 0 4px; transition: all 0.25s ease;
          color: white; text-decoration: none; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #1d4ed8 100%);
          background-size: 200% auto;
          animation: buyCreditsGlow 2.2s ease-in-out infinite, buyCreditsShimmer 3s linear infinite;
          border: 1px solid rgba(124,58,237,0.5);
          font-size: 14px; font-weight: 700;
        }
        .buy-credits-btn:hover {
          transform: translateX(4px) scale(1.02);
          box-shadow: 0 8px 28px rgba(37,99,235,0.6) !important;
          animation: buyCreditsShimmer 0.8s linear infinite;
        }
        .buy-credits-btn .bc-icon {
          font-size: 18px;
          animation: buyCreditsIcon 2.2s ease-in-out infinite;
          display: inline-block;
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.7));
        }
        .buy-credits-btn .bc-badge {
          margin-left: auto;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.28);
          border-radius: 6px; padding: 2px 8px;
          font-size: 10px; font-weight: 800; color: white;
          animation: buyCreditsIcon 2.2s ease-in-out infinite 0.4s;
          display: inline-block;
        }

        .action-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px;text-decoration:none;display:block;position:relative;overflow:hidden;transition:all 0.3s cubic-bezier(0.16,1,0.3,1) }
        .action-card:hover { transform:translateY(-6px);border-color:rgba(255,255,255,0.2);box-shadow:0 20px 50px rgba(0,0,0,0.4);background:rgba(255,255,255,0.05) }

        .stat-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px;display:flex;align-items:center;gap:18px;transition:all 0.3s }
        .stat-card:hover { transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.3) }

        .topbar { background:rgba(6,9,20,0.8);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.06);padding:0 40px;height:76px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50 }

        .progress-bar { height:6px;background:rgba(255,255,255,0.06);border-radius:9999px;overflow:hidden }
        .progress-fill { height:100%;border-radius:9999px;animation:progress 1.5s ease forwards }
      `}</style>

      <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh', background: '#060914', color: 'white', display: 'flex' }}>

        {/* ── SIDEBAR ─────────────────────────────────── */}
        <div className="sidebar">
          <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '15px', fontFamily: 'Syne, sans-serif', animation: 'glowPulse 3s infinite' }}>AI</div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontWeight: '800', fontSize: '16px' }}>AI Coach</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Placement Assistant</div>
              </div>
            </Link>
          </div>

          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' as const }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', padding: '0 6px', marginBottom: '8px' }}>MAIN MENU</p>

            {NAV_ITEMS.map((item, i) => (
              item.tab ? (
                <div key={i} onClick={() => setActiveTab(item.tab!)} className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}>
                  <span style={{ fontSize: '18px', animation: `icon${item.anim.charAt(0).toUpperCase() + item.anim.slice(1)} 3s ease-in-out infinite`, display: 'inline-block' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ) : (
                <Link key={i} href={item.href!} className="nav-item">
                  <span style={{ fontSize: '18px', animation: `icon${item.anim.charAt(0).toUpperCase() + item.anim.slice(1)} 3s ease-in-out infinite`, display: 'inline-block' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            ))}

            {/* ── ANIMATED BUY CREDITS BUTTON ── */}
            <Link href="/buy-credits" className="buy-credits-btn">
              <span className="bc-icon">⚡</span>
              <span>Buy Credits</span>
              <span className="bc-badge">₹49+</span>
            </Link>

            <p style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', padding: '16px 6px 8px' }}>ACCOUNT</p>

            {[
              { icon: '💳', label: 'Billing & Plans', href: '/billing', anim: 'bounce' },
              { icon: '⚙️', label: 'Settings', href: '/settings', anim: 'spin' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="nav-item">
                <span style={{ fontSize: '18px', animation: `icon${item.anim.charAt(0).toUpperCase() + item.anim.slice(1)} 4s ease-in-out infinite`, display: 'inline-block' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #a78bfa, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '15px', flexShrink: 0 }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{user?.email}</div>
              <div style={{ color: planColor, fontSize: '11px', marginTop: '1px', fontWeight: '600' }}>{plan.toUpperCase()} Plan</div>
            </div>
            <button onClick={handleLogout} title="Sign Out" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
              🚪
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT ───────────────────────────── */}
        <div style={{ marginLeft: '260px', flex: 1, minHeight: '100vh' }}>

          {/* Top Bar */}
          <div className="topbar">
            <div style={{ animation: 'fadeSlideUp 0.6s ease both' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800' }}>
                {greeting}, <span style={{
                  background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'gradientText 4s ease infinite'
                }}>{firstName}</span>!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CreditBadge credits={credits} plan={plan} />
              <div style={{ padding: '8px 14px', borderRadius: '12px', background: `${planColor}20`, border: `1px solid ${planColor}40` }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: planColor, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>{plan}</span>
              </div>
              {plan === 'free' && (
                <Link href="/billing" style={{ padding: '10px 22px', borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', textDecoration: 'none', fontSize: '13px', fontWeight: '700', color: 'white', boxShadow: '0 6px 20px rgba(236,72,153,0.4)', display: 'inline-block', animation: 'glowPulse 3s infinite' }}>
                  ⚡ Upgrade Pro
                </Link>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }}>
            <AnnouncementBanner plan={plan} />

            {/* Daily Tip */}
            <div style={{ padding: '20px 28px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(90deg, rgba(124,58,237,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', borderLeft: '4px solid #a78bfa', animation: 'fadeSlideUp 0.5s ease both' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #a78bfa, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, animation: 'iconFloat 4s ease-in-out infinite' }}>💡</div>
              <div>
                <p style={{ color: '#a78bfa', fontSize: '11px', fontWeight: '800', letterSpacing: '0.15em', marginBottom: '4px' }}>DAILY STRATEGY</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: '1.6', fontWeight: '500' }}>{todayTip}</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {[
                { icon: '⚡', label: 'Credits Left', value: credits >= 999999 ? '∞' : credits.toLocaleString('en-IN'), color: '#2563eb', anim: 'coinSpin' },
                { icon: '🎖️', label: 'Current Plan', value: plan.toUpperCase(), color: planColor, anim: 'iconBounce' },
                { icon: '📊', label: 'ATS Score', value: '—', color: '#34d399', anim: 'iconPulse' },
                { icon: '🔥', label: 'Day Streak', value: '1', color: '#fbbf24', anim: 'iconShake' },
              ].map((stat, i) => (
                <div key={i} className="stat-card" style={{ animation: `fadeSlideUp 0.5s ${i * 0.08}s both` }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: `${stat.color}20`, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0, animation: `${stat.anim} 3s ease-in-out infinite` }}>{stat.icon}</div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginBottom: '4px', letterSpacing: '0.5px' }}>{stat.label}</p>
                    <p style={{ fontSize: '26px', fontWeight: '800', color: stat.color, lineHeight: '1', textShadow: `0 0 16px ${stat.color}50` }}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Low credit warning */}
            {credits <= 3 && credits !== 999999 && (
              <div style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.3)', borderLeft: '4px solid #ef4444', padding: '16px 24px', marginBottom: '24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeSlideUp 0.5s ease both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '28px', animation: 'iconShake 1s infinite', display: 'inline-block' }}>⚠️</span>
                  <div>
                    <p style={{ fontWeight: '800', color: '#fca5a5', fontSize: '16px' }}>Critically Low Credits ({credits} remaining)</p>
                    <p style={{ color: 'rgba(252,165,165,0.7)', fontSize: '13px', marginTop: '2px' }}>Upgrade to keep using AI features securely.</p>
                  </div>
                </div>
                <Link href="/buy-credits" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: 'white', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '800', boxShadow: '0 6px 16px rgba(239,68,68,0.4)' }}>Buy Credits →</Link>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, white, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🚀 Launchpad</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 14px' }}>
                  <span style={{ fontSize: '12px', animation: 'coinSpin 3s infinite', display: 'inline-block' }}>⚡</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '500' }}>
                    {credits >= 999999 ? 'Unlimited' : credits} credits available
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {QUICK_ACTIONS.map((action, i) => (
                  <Link key={i} href={action.locked ? '/billing' : action.href} className="action-card"
                    style={{ animation: `fadeSlideUp 0.5s ${i * 0.05}s both` }}>
                    {action.locked && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '18px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🔒</div>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '700' }}>Pro Required</p>
                        <span style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '5px 14px', borderRadius: '8px' }}>Upgrade →</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${action.color}20`, border: `1px solid ${action.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', animation: `icon${action.anim.charAt(0).toUpperCase() + action.anim.slice(1)} 3s ease-in-out infinite` }}>
                        {action.emoji}
                      </div>
                      {action.tag && (
                        <span style={{ background: `${action.color}20`, border: `1px solid ${action.color}30`, color: action.color, fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '7px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{action.tag}</span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>{action.label}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.5', marginBottom: '16px' }}>{action.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: action.color, background: `${action.color}15`, padding: '4px 10px', borderRadius: '7px' }}>{action.credits}</span>
                      <span style={{ color: action.color, fontSize: '16px' }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ATS Checker Widget */}
            <ATSCheckerWidget userId={user?.id} credits={credits} onCreditsUpdate={setCredits} />

            {/* Bottom row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '28px' }}>

              {/* Progress */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '28px' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ animation: 'iconPulse 2s infinite', display: 'inline-block' }}>📊</span> Readiness Score
                </h3>
                {[
                  { label: 'Resume Quality', value: mounted ? 75 : 0, color: '#3b82f6', icon: '📄', anim: 'iconBounce' },
                  { label: 'Interview Prep', value: mounted ? 45 : 0, color: '#8b5cf6', icon: '🎯', anim: 'iconPulse' },
                  { label: 'Practice Questions', value: mounted ? 15 : 0, color: '#10b981', icon: '📱', anim: 'iconFloat' },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ animation: `${item.anim} 3s infinite`, display: 'inline-block' }}>{item.icon}</span> {item.label}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: item.color, textShadow: `0 0 10px ${item.color}80` }}>{item.value}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.value}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}99)` }} />
                    </div>
                  </div>
                ))}
                <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', padding: '14px 18px', marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', animation: 'iconShake 3s infinite', display: 'inline-block', flexShrink: 0 }}>🔥</span>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6', fontWeight: '500' }}>
                    Good start! Complete 2 more mock interviews to boost your readiness above 50%.
                  </p>
                </div>
              </div>

              {/* Master Plan */}
              <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '18px', padding: '28px' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ animation: 'iconBounce 2s infinite', display: 'inline-block' }}>🚀</span> Master Plan
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '24px', fontWeight: '500' }}>
                  Follow these steps to maximize your hiring chances.
                </p>
                {[
                  { step: '01', label: 'Build your AI-optimized resume', href: '/resume', done: true },
                  { step: '02', label: 'Practice 10 mock interview Q&As', href: '/interview', done: false },
                  { step: '03', label: 'Score your resume against job descriptions', href: '/ats-checker', done: false },
                  { step: '04', label: 'Activate WhatsApp daily coaching', href: '/whatsapp', done: false },
                ].map((item, i) => (
                  <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', textDecoration: 'none', marginBottom: '10px', background: item.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${item.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`, transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(6px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(0)' }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0, background: item.done ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: item.done ? '0 4px 10px rgba(16,185,129,0.3)' : 'none' }}>
                      <span style={{ color: item.done ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '800' }}>{item.done ? '✓' : item.step}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', flex: 1, color: item.done ? 'rgba(255,255,255,0.4)' : 'white', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
                    <span style={{ color: item.done ? '#10b981' : '#a78bfa', fontSize: '16px', opacity: item.done ? 0.3 : 1 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Buy Credits Banner */}
            <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ animation: 'coinSpin 2s infinite', display: 'inline-block' }}>⚡</span> Need more credits?
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>Buy credits instantly — starts from ₹49 for 50 credits</p>
              </div>
              <Link href="/buy-credits" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '10px', color: 'white', fontWeight: '700', fontSize: '14px', textDecoration: 'none', boxShadow: '0 6px 16px rgba(37,99,235,0.4)' }}>
                Buy Credits →
              </Link>
            </div>

            {/* Referral Section */}
            {user && <ReferralSection userId={user.id} userEmail={user.email} />}
          </div>
        </div>
      </div>

      {/* Admin Widget */}
      {(user?.email === 'your-admin-email@gmail.com' || process.env.NEXT_PUBLIC_ADMIN_KEY === 'admin123') && (
        <AdminSuperWidget adminKey={process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123'} />
      )}
      {user && <SupportWidget userId={user?.id} userEmail={user?.email} />}

    </>
  )
}