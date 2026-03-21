'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Tab = 'evaluator' | 'counter' | 'benchmark' | 'roleplay'

interface OfferEval {
  verdict: string
  score: number
  breakdown: { category: string; rating: string; comment: string }[]
  red_flags: string[]
  positives: string[]
  recommendation: string
}

interface CounterScript {
  opening: string
  value_pitch: string
  counter_ask: string
  objection_handlers: { objection: string; response: string }[]
  closing: string
  email_draft: string
}

interface BenchmarkResult {
  role: string
  location: string
  p25: number
  p50: number
  p75: number
  p90: number
  your_position: string
  insights: string[]
  negotiation_room: string
}

interface RoleplayMessage {
  role: 'hr' | 'you'
  text: string
}

export default function SalaryPage() {
  const [userId, setUserId] = useState('')
  const [plan, setPlan] = useState('')
  const [credits, setCredits] = useState(0)
  const [tab, setTab] = useState<Tab>('evaluator')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Offer Evaluator
  const [offerRole, setOfferRole] = useState('')
  const [offerCompany, setOfferCompany] = useState('')
  const [offerCtc, setOfferCtc] = useState('')
  const [offerFixed, setOfferFixed] = useState('')
  const [offerVariable, setOfferVariable] = useState('')
  const [offerExp, setOfferExp] = useState('')
  const [offerCity, setOfferCity] = useState('Bangalore')
  const [offerDetails, setOfferDetails] = useState('')
  const [offerResult, setOfferResult] = useState<OfferEval | null>(null)

  // Counter Script
  const [counterRole, setCounterRole] = useState('')
  const [counterCurrentCtc, setCounterCurrentCtc] = useState('')
  const [counterOfferedCtc, setCounterOfferedCtc] = useState('')
  const [counterTargetCtc, setCounterTargetCtc] = useState('')
  const [counterExp, setCounterExp] = useState('')
  const [counterSkills, setCounterSkills] = useState('')
  const [counterScript, setCounterScript] = useState<CounterScript | null>(null)

  // Benchmark
  const [benchRole, setBenchRole] = useState('')
  const [benchExp, setBenchExp] = useState('')
  const [benchCity, setBenchCity] = useState('Bangalore')
  const [benchIndustry, setBenchIndustry] = useState('IT/Software')
  const [benchResult, setBenchResult] = useState<BenchmarkResult | null>(null)

  // Roleplay
  const [rpRole, setRpRole] = useState('')
  const [rpOffered, setRpOffered] = useState('')
  const [rpTarget, setRpTarget] = useState('')
  const [rpMessages, setRpMessages] = useState<RoleplayMessage[]>([])
  const [rpInput, setRpInput] = useState('')
  const [rpStarted, setRpStarted] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUserId(user.id)
        const { data } = await supabase.from('subscriptions').select('plan, credits_remaining').eq('user_id', user.id).single()
        if (data) { setPlan(data.plan); setCredits(data.credits_remaining) }
      } catch (err) { console.error(err) }
    }
    getUser()
  }, [router])

  const deductCredits = async (amount: number) => {
    const { error } = await supabase.from('subscriptions').update({ credits_remaining: credits - amount }).eq('user_id', userId)
    if (!error) setCredits(c => c - amount)
  }

  const callAI = async (prompt: string): Promise<string> => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'AI call failed')
    return data.response || ''
  }

  // ── Offer Evaluator ──────────────────────────────
  const handleEvaluate = async () => {
    if (!offerRole || !offerCtc) { setError('Fill Role and CTC at minimum.'); return }
    if (credits < 3) { setError('Need 3 credits.'); return }
    setLoading(true); setError(''); setOfferResult(null)
    try {
      const prompt = `You are an expert Indian salary negotiation coach. Evaluate this job offer and respond in STRICT JSON (no markdown):
Role: ${offerRole} at ${offerCompany || 'unknown company'}
Total CTC: ₹${offerCtc} LPA | Fixed: ₹${offerFixed || '?'} LPA | Variable: ₹${offerVariable || '?'} LPA
Experience: ${offerExp || '?'} years | Location: ${offerCity}
Other details: ${offerDetails || 'None provided'}

Return JSON:
{
  "verdict": "Excellent/Good/Fair/Below Market/Poor",
  "score": 0-100,
  "breakdown": [{"category":"Fixed Pay","rating":"Good/Avg/Poor","comment":"..."},{"category":"Variable Pay","rating":"...","comment":"..."},{"category":"Location Adjustment","rating":"...","comment":"..."},{"category":"Growth Potential","rating":"...","comment":"..."}],
  "red_flags": ["..."],
  "positives": ["..."],
  "recommendation": "2-3 sentence action recommendation"
}`
      const raw = await callAI(prompt)
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setOfferResult(json)
      await deductCredits(3)
    } catch { setError('Evaluation failed. Please try again.') }
    setLoading(false)
  }

  // ── Counter Script ─────────────────────────────
  const handleCounterScript = async () => {
    if (!counterRole || !counterOfferedCtc || !counterTargetCtc) { setError('Fill role, offered CTC and target CTC.'); return }
    if (credits < 4) { setError('Need 4 credits.'); return }
    setLoading(true); setError(''); setCounterScript(null)
    try {
      const prompt = `You are an elite salary negotiation coach for Indian job market. Generate a complete negotiation script. Respond in STRICT JSON (no markdown):
Role: ${counterRole}
Current CTC: ₹${counterCurrentCtc || 'fresher'} LPA
Offered CTC: ₹${counterOfferedCtc} LPA
Target CTC: ₹${counterTargetCtc} LPA
Experience: ${counterExp} years
Key Skills: ${counterSkills}

Return JSON:
{
  "opening": "Opening statement to initiate negotiation",
  "value_pitch": "2-3 sentences selling your market value",
  "counter_ask": "Exact script for making the counter offer",
  "objection_handlers": [
    {"objection":"Budget is fixed","response":"..."},
    {"objection":"Your experience is limited","response":"..."},
    {"objection":"We can review after 6 months","response":"..."}
  ],
  "closing": "Professional closing whether they say yes or no",
  "email_draft": "Complete email draft for written negotiation"
}`
      const raw = await callAI(prompt)
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setCounterScript(json)
      await deductCredits(4)
    } catch { setError('Script generation failed. Try again.') }
    setLoading(false)
  }

  // ── Market Benchmark ────────────────────────────
  const handleBenchmark = async () => {
    if (!benchRole || !benchExp) { setError('Fill role and experience.'); return }
    if (credits < 2) { setError('Need 2 credits.'); return }
    setLoading(true); setError(''); setBenchResult(null)
    try {
      const prompt = `You are a compensation expert for the Indian job market in 2024-2025. Provide salary benchmarks. Respond in STRICT JSON (no markdown):
Role: ${benchRole} | Experience: ${benchExp} years | City: ${benchCity} | Industry: ${benchIndustry}

Return JSON:
{
  "role": "${benchRole}",
  "location": "${benchCity}",
  "p25": number (LPA),
  "p50": number (LPA - median),
  "p75": number (LPA),
  "p90": number (LPA - top earners),
  "your_position": "Below Market / At Market / Above Market",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "negotiation_room": "Specific advice on how much to push for"
}`
      const raw = await callAI(prompt)
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setBenchResult(json)
      await deductCredits(2)
    } catch { setError('Benchmark failed. Try again.') }
    setLoading(false)
  }

  // ── Roleplay ────────────────────────────────────
  const handleStartRoleplay = async () => {
    if (!rpRole || !rpOffered || !rpTarget) { setError('Fill all roleplay fields.'); return }
    if (credits < 2) { setError('Need 2 credits for roleplay session.'); return }
    setRpStarted(true); setRpMessages([]); setError('')
    const hrOpening: RoleplayMessage = {
      role: 'hr',
      text: `Hi! Thank you for coming in. We're really excited about you joining us as ${rpRole}. We're pleased to offer you ₹${rpOffered} LPA. This matches our band for this role. What are your thoughts?`
    }
    setRpMessages([hrOpening])
    await deductCredits(2)
  }

  const handleRpSend = async () => {
    if (!rpInput.trim() || loading) return
    const userMsg: RoleplayMessage = { role: 'you', text: rpInput }
    const updatedMsgs = [...rpMessages, userMsg]
    setRpMessages(updatedMsgs)
    setRpInput('')
    setLoading(true)
    try {
      const history = updatedMsgs.map(m => `${m.role === 'hr' ? 'HR' : 'Candidate'}: ${m.text}`).join('\n')
      const prompt = `You are playing the role of an HR Manager at an Indian company. Candidate is trying to negotiate from ₹${rpOffered} LPA to ₹${rpTarget} LPA for ${rpRole} role.
Conversation so far:
${history}

Reply as HR. Be realistic — show some resistance but be professional. If candidate makes strong points, slowly concede. Keep response to 2-3 sentences only. Do not add labels or quotes.`
      const reply = await callAI(prompt)
      setRpMessages(prev => [...prev, { role: 'hr', text: reply.trim() }])
    } catch { setError('AI response failed.') }
    setLoading(false)
  }

  const isPro = plan === 'pro' || plan === 'premium'

  const TABS: { id: Tab; label: string; icon: string; cost: string; desc: string }[] = [
    { id: 'evaluator', label: 'Offer Evaluator', icon: '📊', cost: '3 credits', desc: 'Get a full analysis of your job offer vs market standards' },
    { id: 'counter', label: 'Counter Script', icon: '🎭', cost: '4 credits', desc: 'AI-written negotiation scripts for phone & email' },
    { id: 'benchmark', label: 'Market Benchmark', icon: '📈', cost: '2 credits', desc: 'See real salary ranges for your role in your city' },
    { id: 'roleplay', label: 'Negotiation Sim', icon: '🤖', cost: '2 credits', desc: 'Practice live negotiation with an AI HR manager' },
  ]

  const CITIES = ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Delhi/NCR', 'Kolkata', 'Ahmedabad', 'Remote']
  const INDUSTRIES = ['IT/Software', 'Product', 'Fintech', 'BFSI', 'Consulting', 'E-commerce', 'Healthcare', 'Manufacturing', 'Startup']

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.2s; } .d3 { animation-delay: 0.3s; }

        .salary-input {
          width: 100%; border: 1px solid #d1d5db; border-radius: 12px;
          padding: 13px 16px; font-size: 15px; outline: none;
          background: #f8fafc; color: #1e293b; font-weight: 500;
          transition: all 0.3s ease; box-sizing: border-box; font-family: inherit;
        }
        .salary-input:focus { border-color: #d97706; box-shadow: 0 0 0 4px rgba(217,119,6,0.12); background: white; }
        
        .premium-btn {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative; overflow: hidden;
        }
        .premium-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
        .premium-btn:active:not(:disabled) { transform: translateY(0); }
        
        .tab-btn { transition: all 0.25s ease; border-radius: 14px; cursor: pointer; border: none; }
        .tab-btn:hover { transform: translateY(-2px); }
        
        .chat-bubble-hr { background: #1e293b; color: #f1f5f9; border-radius: 18px 18px 18px 4px; }
        .chat-bubble-you { background: linear-gradient(135deg, #d97706, #b45309); color: white; border-radius: 18px 18px 4px 18px; }
        
        .shimmer-gold {
          background: linear-gradient(90deg, #d97706, #f59e0b, #fcd34d, #f59e0b, #d97706);
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #1a1435 50%, #0f1729 100%)', fontFamily: "'Inter', system-ui, sans-serif", color: 'white' }}>

        {/* Nav */}
        <nav style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>← Dashboard</Link>
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fcd34d' }}>💰 Salary Coach</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', color: '#fcd34d', fontSize: '13px', fontWeight: '700', padding: '6px 14px', borderRadius: '9999px' }}>
              ✨ PREMIUM
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '13px', fontWeight: '600', padding: '6px 14px', borderRadius: '9999px' }}>
              🪙 {credits >= 999999 ? 'Unlimited' : credits} credits
            </div>
          </div>
        </nav>

        {/* Gate for non-pro */}
        {!isPro && plan !== '' && (
          <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '24px', padding: '48px 32px' }}>
              <div style={{ fontSize: '72px', marginBottom: '20px' }}>🔒</div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Pro Feature</h1>
              <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                The Salary Coach is available to <strong style={{ color: '#fcd34d' }}>Pro</strong> and <strong style={{ color: '#fcd34d' }}>Premium</strong> subscribers.
              </p>
              <Link href="/billing" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', color: 'white', padding: '16px 40px', borderRadius: '14px', textDecoration: 'none', fontSize: '18px', fontWeight: '800', display: 'inline-block', boxShadow: '0 8px 24px rgba(217,119,6,0.4)' }}>
                Upgrade to Premium — ₹499/mo →
              </Link>
            </div>
          </div>
        )}

        {isPro && (
          <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>

            {/* Header */}
            <div className="fade-up" style={{ marginBottom: '48px' }}>
              <h1 className="shimmer-gold" style={{ fontSize: '44px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '12px' }}>
                💰 Salary Negotiation Coach
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '500' }}>
                4 powerful AI tools to help you negotiate the salary you deserve.
              </p>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '14px 20px', borderRadius: '12px', marginTop: '24px', fontSize: '15px', fontWeight: '600' }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Tool tabs */}
            <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setError('') }} className="tab-btn"
                  style={{ padding: '20px 16px', background: tab === t.id ? 'rgba(217,119,6,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${tab === t.id ? 'rgba(217,119,6,0.5)' : 'rgba(255,255,255,0.08)'}`, textAlign: 'left' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{t.icon}</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: tab === t.id ? '#fcd34d' : 'white', marginBottom: '6px' }}>{t.label}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4', marginBottom: '10px' }}>{t.desc}</div>
                  <div style={{ background: tab === t.id ? 'rgba(217,119,6,0.2)' : 'rgba(255,255,255,0.05)', color: tab === t.id ? '#fcd34d' : '#64748b', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', display: 'inline-block' }}>
                    {t.cost}
                  </div>
                </button>
              ))}
            </div>

            {/* ── OFFER EVALUATOR ─────────────────────────── */}
            {tab === 'evaluator' && (
              <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', alignItems: 'start' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                  <h2 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '24px' }}>📊 Evaluate My Offer</h2>

                  {[
                    { label: 'Job Role / Title *', val: offerRole, set: setOfferRole, placeholder: 'Software Engineer' },
                    { label: 'Company Name', val: offerCompany, set: setOfferCompany, placeholder: 'TCS, Infosys, etc.' },
                    { label: 'Total CTC (LPA) *', val: offerCtc, set: setOfferCtc, placeholder: '8.5' },
                    { label: 'Fixed Component (LPA)', val: offerFixed, set: setOfferFixed, placeholder: '7.0' },
                    { label: 'Variable / Bonus (LPA)', val: offerVariable, set: setOfferVariable, placeholder: '1.5' },
                    { label: 'Your Experience (years)', val: offerExp, set: setOfferExp, placeholder: '2' },
                  ].map((f) => (
                    <div key={f.label} style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                      <input className="salary-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                    </div>
                  ))}

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</label>
                    <select className="salary-input" value={offerCity} onChange={e => setOfferCity(e.target.value)} style={{ cursor: 'pointer' }}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Other Perks / Details</label>
                    <textarea className="salary-input" rows={3} value={offerDetails} onChange={e => setOfferDetails(e.target.value)} placeholder="WFH policy, ESOPs, insurance, joining bonus..." style={{ resize: 'vertical' }} />
                  </div>

                  <button onClick={handleEvaluate} disabled={loading || credits < 3} className="premium-btn" style={{ width: '100%', padding: '16px', background: loading || credits < 3 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d97706, #b45309)', border: 'none', borderRadius: '14px', color: credits < 3 ? '#475569' : 'white', fontSize: '16px', fontWeight: '800', cursor: loading || credits < 3 ? 'not-allowed' : 'pointer', boxShadow: loading || credits < 3 ? 'none' : '0 10px 24px rgba(217,119,6,0.35)' }}>
                    {loading ? '🤖 Analyzing offer...' : '📊 Evaluate Offer — 3 Credits'}
                  </button>
                </div>

                {offerResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Score */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '6px' }}>{offerResult.verdict}</div>
                        <div style={{ color: '#94a3b8', fontSize: '16px' }}>{offerResult.recommendation}</div>
                      </div>
                      <div style={{ textAlign: 'center', background: offerResult.score >= 75 ? 'rgba(16,185,129,0.15)' : offerResult.score >= 50 ? 'rgba(217,119,6,0.15)' : 'rgba(239,68,68,0.15)', border: `2px solid ${offerResult.score >= 75 ? '#10b981' : offerResult.score >= 50 ? '#d97706' : '#ef4444'}`, borderRadius: '20px', padding: '20px 28px', flexShrink: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', marginBottom: '4px' }}>SCORE</div>
                        <div style={{ fontSize: '48px', fontWeight: '900', color: offerResult.score >= 75 ? '#10b981' : offerResult.score >= 50 ? '#d97706' : '#ef4444', lineHeight: 1 }}>{offerResult.score}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>/100</div>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
                      <h3 style={{ fontWeight: '800', marginBottom: '16px', fontSize: '16px' }}>Category Breakdown</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {offerResult.breakdown.map((b, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '12px' }}>
                            <div>
                              <span style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '14px' }}>{b.category}</span>
                              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{b.comment}</div>
                            </div>
                            <span style={{ background: b.rating === 'Good' ? 'rgba(16,185,129,0.2)' : b.rating === 'Poor' ? 'rgba(239,68,68,0.2)' : 'rgba(217,119,6,0.2)', color: b.rating === 'Good' ? '#10b981' : b.rating === 'Poor' ? '#ef4444' : '#d97706', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '8px', flexShrink: 0, marginLeft: '12px' }}>
                              {b.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '16px', padding: '20px' }}>
                        <h4 style={{ color: '#10b981', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>✅ Positives</h4>
                        {offerResult.positives.map((p, i) => <div key={i} style={{ color: '#e2e8f0', fontSize: '14px', marginBottom: '8px', display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>+</span>{p}</div>)}
                      </div>
                      <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '16px', padding: '20px' }}>
                        <h4 style={{ color: '#ef4444', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>🚩 Red Flags</h4>
                        {offerResult.red_flags.length === 0 ? <div style={{ color: '#10b981', fontSize: '14px' }}>No major red flags!</div> : offerResult.red_flags.map((f, i) => <div key={i} style={{ color: '#e2e8f0', fontSize: '14px', marginBottom: '8px', display: 'flex', gap: '8px' }}><span style={{ color: '#ef4444' }}>!</span>{f}</div>)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '12px', padding: '32px', textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }}>📊</span>
                    <p style={{ color: '#475569', fontSize: '15px', maxWidth: '260px', lineHeight: '1.6' }}>Fill the offer details on the left and click Evaluate to see your analysis here.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── COUNTER SCRIPT ───────────────────────────── */}
            {tab === 'counter' && (
              <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                  <h2 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '24px' }}>🎭 Generate My Script</h2>

                  {[
                    { label: 'Role / Title *', val: counterRole, set: setCounterRole, placeholder: 'Full Stack Developer' },
                    { label: 'Current CTC (LPA)', val: counterCurrentCtc, set: setCounterCurrentCtc, placeholder: '6 or 0 if fresher' },
                    { label: 'Offered CTC (LPA) *', val: counterOfferedCtc, set: setCounterOfferedCtc, placeholder: '10' },
                    { label: 'Your Target CTC (LPA) *', val: counterTargetCtc, set: setCounterTargetCtc, placeholder: '13' },
                    { label: 'Years of Experience', val: counterExp, set: setCounterExp, placeholder: '3' },
                    { label: 'Key Skills', val: counterSkills, set: setCounterSkills, placeholder: 'React, Node.js, AWS' },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                      <input className="salary-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                    </div>
                  ))}

                  <button onClick={handleCounterScript} disabled={loading || credits < 4} className="premium-btn" style={{ width: '100%', padding: '16px', background: loading || credits < 4 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d97706, #b45309)', border: 'none', borderRadius: '14px', color: credits < 4 ? '#475569' : 'white', fontSize: '16px', fontWeight: '800', cursor: loading || credits < 4 ? 'not-allowed' : 'pointer', marginTop: '6px', boxShadow: credits < 4 ? 'none' : '0 10px 24px rgba(217,119,6,0.35)' }}>
                    {loading ? '🤖 Writing script...' : '🎭 Generate Script — 4 Credits'}
                  </button>
                </div>

                {counterScript ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { label: '👋 Opening Line', content: counterScript.opening, bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
                      { label: '💪 Value Pitch', content: counterScript.value_pitch, bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
                      { label: '💰 The Counter Ask', content: counterScript.counter_ask, bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.3)' },
                      { label: '🏁 Closing Line', content: counterScript.closing, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
                    ].map((s, i) => (
                      <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', padding: '20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                        <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.7', fontStyle: 'italic' }}>"{s.content}"</p>
                      </div>
                    ))}

                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>🛡️ Objection Handler Scripts</div>
                      {counterScript.objection_handlers.map((o, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                          <div style={{ color: '#fca5a5', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>HR: "{o.objection}"</div>
                          <div style={{ color: '#6ee7b7', fontSize: '14px', lineHeight: '1.6' }}>You: "{o.response}"</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#93c5fd', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>📧 Email Draft (Copy & Send)</div>
                      <pre style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px' }}>{counterScript.email_draft}</pre>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '12px', padding: '32px', textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }}>🎭</span>
                    <p style={{ color: '#475569', fontSize: '15px', maxWidth: '260px', lineHeight: '1.6' }}>Fill the offer details and we'll write your negotiation script — word for word.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── MARKET BENCHMARK ─────────────────────────── */}
            {tab === 'benchmark' && (
              <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                  <h2 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '24px' }}>📈 Market Benchmark</h2>

                  {[
                    { label: 'Role / Title *', val: benchRole, set: setBenchRole, placeholder: 'Data Analyst' },
                    { label: 'Years of Experience *', val: benchExp, set: setBenchExp, placeholder: '2' },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                      <input className="salary-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                    </div>
                  ))}

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</label>
                    <select className="salary-input" value={benchCity} onChange={e => setBenchCity(e.target.value)} style={{ cursor: 'pointer' }}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Industry</label>
                    <select className="salary-input" value={benchIndustry} onChange={e => setBenchIndustry(e.target.value)} style={{ cursor: 'pointer' }}>
                      {INDUSTRIES.map(ind => <option key={ind}>{ind}</option>)}
                    </select>
                  </div>

                  <button onClick={handleBenchmark} disabled={loading || credits < 2} className="premium-btn" style={{ width: '100%', padding: '16px', background: loading || credits < 2 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d97706, #b45309)', border: 'none', borderRadius: '14px', color: credits < 2 ? '#475569' : 'white', fontSize: '16px', fontWeight: '800', cursor: loading || credits < 2 ? 'not-allowed' : 'pointer', boxShadow: credits < 2 ? 'none' : '0 10px 24px rgba(217,119,6,0.35)' }}>
                    {loading ? '📈 Fetching data...' : '📈 Get Benchmark — 2 Credits'}
                  </button>
                </div>

                {benchResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px' }}>
                      <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>
                        {benchResult.role} — {benchResult.location}
                      </h3>
                      <div style={{ display: 'inline-block', background: benchResult.your_position === 'Above Market' ? 'rgba(16,185,129,0.2)' : benchResult.your_position === 'At Market' ? 'rgba(217,119,6,0.2)' : 'rgba(239,68,68,0.2)', color: benchResult.your_position === 'Above Market' ? '#10b981' : benchResult.your_position === 'At Market' ? '#d97706' : '#ef4444', fontSize: '13px', fontWeight: '700', padding: '5px 14px', borderRadius: '9999px', marginBottom: '28px' }}>
                        {benchResult.your_position}
                      </div>

                      {/* Salary bands */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
                        {[
                          { label: 'Entry (P25)', value: benchResult.p25, desc: 'Bottom 25%', color: '#ef4444' },
                          { label: 'Median (P50)', value: benchResult.p50, desc: 'Market median', color: '#d97706' },
                          { label: 'Senior (P75)', value: benchResult.p75, desc: 'Top 25%', color: '#10b981' },
                          { label: 'Top (P90)', value: benchResult.p90, desc: 'Top 10%', color: '#60a5fa' },
                        ].map((band, i) => (
                          <div key={i} style={{ background: `${band.color}10`, border: `1px solid ${band.color}30`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{band.label}</div>
                            <div style={{ fontSize: '26px', fontWeight: '900', color: band.color, lineHeight: 1 }}>₹{band.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>LPA</div>
                            <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>{band.desc}</div>
                          </div>
                        ))}
                      </div>

                      {/* Negotiation room */}
                      <div style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: '14px', padding: '18px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#fcd34d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 Negotiation Strategy</div>
                        <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.7' }}>{benchResult.negotiation_room}</p>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                      <h4 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '14px' }}>📊 Market Insights</h4>
                      {benchResult.insights.map((ins, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#e2e8f0', marginBottom: '10px', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                          <span style={{ color: '#d97706', flexShrink: 0 }}>→</span> {ins}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '12px', padding: '32px', textAlign: 'center' }}>
                    <span style={{ fontSize: '48px' }}>📈</span>
                    <p style={{ color: '#475569', fontSize: '15px', maxWidth: '260px', lineHeight: '1.6' }}>Enter your role and experience to see real salary ranges in your city.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── ROLEPLAY SIM ─────────────────────────────── */}
            {tab === 'roleplay' && (
              <div className="fade-up d2">
                {!rpStarted ? (
                  <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px' }}>
                      <h2 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>🤖 Negotiation Simulator</h2>
                      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>Practice live with an AI playing your HR. Get comfortable before the real call.</p>

                      {[
                        { label: 'Role / Title *', val: rpRole, set: setRpRole, placeholder: 'Software Engineer' },
                        { label: 'Offered CTC (LPA) *', val: rpOffered, set: setRpOffered, placeholder: '10' },
                        { label: 'Your Target CTC (LPA) *', val: rpTarget, set: setRpTarget, placeholder: '13' },
                      ].map(f => (
                        <div key={f.label} style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                          <input className="salary-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                        </div>
                      ))}

                      <button onClick={handleStartRoleplay} disabled={!rpRole || !rpOffered || !rpTarget || credits < 2} className="premium-btn" style={{ width: '100%', padding: '18px', background: (!rpRole || !rpOffered || !rpTarget || credits < 2) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d97706, #b45309)', border: 'none', borderRadius: '14px', color: credits < 2 ? '#475569' : 'white', fontSize: '17px', fontWeight: '800', cursor: (!rpRole || !rpOffered || !rpTarget || credits < 2) ? 'not-allowed' : 'pointer', marginTop: '8px', boxShadow: credits < 2 ? 'none' : '0 10px 24px rgba(217,119,6,0.35)' }}>
                        🎤 Start Mock Negotiation — 2 Credits
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                    {/* Chat header */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🤖</div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '15px' }}>HR Manager (AI)</div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>Negotiating for {rpRole} — Offered: ₹{rpOffered}L | Your Target: ₹{rpTarget}L</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>Live Session</span>
                      </div>
                    </div>

                    {/* Chat messages */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', minHeight: '400px', maxHeight: '500px', overflowY: 'auto', padding: '4px' }}>
                      {rpMessages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'you' ? 'flex-end' : 'flex-start', gap: '12px', alignItems: 'flex-start' }}>
                          {msg.role === 'hr' && (
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🤖</div>
                          )}
                          <div className={msg.role === 'hr' ? 'chat-bubble-hr' : 'chat-bubble-you'} style={{ padding: '14px 18px', maxWidth: '520px', fontSize: '15px', lineHeight: '1.6', fontWeight: '500', animation: 'fadeUp 0.3s ease' }}>
                            {msg.text}
                          </div>
                          {msg.role === 'you' && (
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #d97706, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>👤</div>
                          )}
                        </div>
                      ))}
                      {loading && (
                        <div style={{ display: 'flex', gap: '6px', padding: '14px 18px', background: '#1e293b', borderRadius: '18px 18px 18px 4px', width: 'fit-content' }}>
                          {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#475569', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input
                        value={rpInput}
                        onChange={e => setRpInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !loading && handleRpSend()}
                        placeholder="Type your response to HR... (Press Enter to send)"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 18px', color: 'white', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }}
                      />
                      <button onClick={handleRpSend} disabled={loading || !rpInput.trim()} className="premium-btn" style={{ background: loading || !rpInput.trim() ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #d97706, #b45309)', border: 'none', borderRadius: '14px', color: 'white', padding: '14px 24px', fontSize: '20px', cursor: loading || !rpInput.trim() ? 'not-allowed' : 'pointer' }}>
                        {loading ? '⏳' : '→'}
                      </button>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#475569', fontSize: '12px', fontWeight: '600' }}>Quick replies:</span>
                      {["I was expecting a higher offer", "I have a competing offer", "Can we discuss this further?", "What's your flexibility?"].map(quick => (
                        <button key={quick} onClick={() => setRpInput(quick)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', padding: '5px 12px', borderRadius: '9999px', cursor: 'pointer' }}>
                          {quick}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </main>
        )}
      </div>
    </>
  )
}
