'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEMPLATE_COLORS = [
  '#1e40af','#7c3aed','#065f46','#9a3412',
  '#1e293b','#831843'
]

const DEFAULT_TEMPLATES = [
  { id: 'nova', name: 'Nova', subtitle: 'Clean & Modern', credit_cost: 0, is_free: true, ats_score: 98, columns: 1, has_photo: false, best_for: 'Software Engineer, Data Analyst', badge: 'Free', is_active: true },
  { id: 'pulse', name: 'Pulse', subtitle: 'Bold Two-Column', credit_cost: 3, is_free: false, ats_score: 95, columns: 2, has_photo: true, best_for: 'MBA, Marketing, HR', badge: 'Popular', is_active: true },
  { id: 'apex', name: 'Apex', subtitle: 'Executive Bold', credit_cost: 5, is_free: false, ats_score: 97, columns: 1, has_photo: true, best_for: 'Senior roles, Management', badge: 'Premium', is_active: true },
  { id: 'zen', name: 'Zen', subtitle: 'Ultra Minimal', credit_cost: 0, is_free: true, ats_score: 100, columns: 1, has_photo: false, best_for: 'Any role, Fresher', badge: 'Free', is_active: true },
  { id: 'spark', name: 'Spark', subtitle: 'Creative Sidebar', credit_cost: 3, is_free: false, ats_score: 92, columns: 2, has_photo: true, best_for: 'UI/UX, Creative roles', badge: 'Pro', is_active: true },
  { id: 'bloom', name: 'Bloom', subtitle: 'Fresher Special', credit_cost: 0, is_free: true, ats_score: 96, columns: 1, has_photo: false, best_for: 'Freshers, Campus placement', badge: 'Free', is_active: true },
]

function ResumePreview({ id, color }: { id: string, color: string }) {
  if (id === 'pulse' || id === 'spark') {
    return (
      <div style={{ background: 'white', height: '100%', display: 'grid', gridTemplateColumns: '38% 62%' }}>
        <div style={{ background: color, padding: '20px 14px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', marginBottom: '10px' }} />
          <div style={{ width: '60px', height: '7px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px', marginBottom: '4px' }} />
          <div style={{ width: '44px', height: '5px', background: 'rgba(255,255,255,0.5)', borderRadius: '3px', marginBottom: '16px' }} />
          {['SKILLS', 'CONTACT', 'EDUCATION'].map((s, i) => (
            <div key={i} style={{ width: '100%', marginBottom: '10px' }}>
              <div style={{ fontSize: '7px', fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', marginBottom: '4px' }}>{s}</div>
              {[70, 55].map((w, j) => <div key={j} style={{ height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />)}
            </div>
          ))}
        </div>
        <div style={{ padding: '20px 16px' }}>
          {['EXPERIENCE', 'EDUCATION', 'PROJECTS'].map((s, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '9px', fontWeight: '800', color: color, letterSpacing: '0.1em', marginBottom: '6px', borderBottom: `2px solid ${color}`, paddingBottom: '3px' }}>{s}</div>
              {[90, 75, 60].map((w, j) => <div key={j} style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (id === 'zen') {
    return (
      <div style={{ background: 'white', height: '100%', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${color}`, paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ width: '100px', height: '8px', background: color, borderRadius: '3px', marginBottom: '5px' }} />
            <div style={{ width: '70px', height: '5px', background: '#94a3b8', borderRadius: '2px' }} />
          </div>
        </div>
        {['EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS'].map((s, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '7px', fontWeight: '900', color: color, letterSpacing: '0.15em', marginBottom: '6px' }}>{s}</div>
            {[95, 80, 65].map((w, j) => <div key={j} style={{ height: '3px', background: j === 0 ? '#cbd5e1' : '#f1f5f9', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />)}
          </div>
        ))}
      </div>
    )
  }

  if (id === 'apex') {
    return (
      <div style={{ background: 'white', height: '100%' }}>
        <div style={{ background: color, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
          <div>
            <div style={{ width: '90px', height: '7px', background: 'rgba(255,255,255,0.95)', borderRadius: '3px', marginBottom: '5px' }} />
            <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
          </div>
        </div>
        <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {['EXPERIENCE', 'SKILLS', 'EDUCATION', 'ACHIEVEMENTS'].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '6px', fontWeight: '900', color: color, letterSpacing: '0.12em', marginBottom: '5px', borderBottom: `1.5px solid ${color}`, paddingBottom: '3px' }}>{s}</div>
              {[90, 70, 50].map((w, j) => <div key={j} style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', height: '100%' }}>
      <div style={{ background: color, padding: '18px 20px' }}>
        <div style={{ width: '110px', height: '8px', background: 'rgba(255,255,255,0.95)', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ width: '75px', height: '5px', background: 'rgba(255,255,255,0.55)', borderRadius: '3px', marginBottom: '10px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[55, 65, 50].map((w, i) => <div key={i} style={{ height: '3px', background: 'rgba(255,255,255,0.35)', borderRadius: '2px', width: `${w}px` }} />)}
        </div>
      </div>
      <div style={{ padding: '14px 18px' }}>
        {['SUMMARY', 'EXPERIENCE', 'SKILLS', 'EDUCATION', 'PROJECTS'].map((s, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <div style={{ fontSize: '6px', fontWeight: '900', color: color, letterSpacing: '0.12em' }}>{s}</div>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>
            {[88, 72, 58].map((w, j) => <div key={j} style={{ height: '3px', background: j === 0 ? '#cbd5e1' : '#f1f5f9', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [selected, setSelected] = useState<string | null>(null)
  const [colors, setColors] = useState<Record<string, string>>({})
  const [activeFilter, setActiveFilter] = useState('all')
  const [hovering, setHovering] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [userCredits, setUserCredits] = useState(0)
  const [userPlan, setUserPlan] = useState('free')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('subscriptions')
          .select('credits_remaining, plan')
          .eq('user_id', user.id)
          .single()
        if (data) {
          setUserCredits(data.credits_remaining)
          setUserPlan(data.plan)
        }
      }

      // Load templates from DB
      try {
        const res = await fetch('/api/templates')
        const data = await res.json()
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates)
        }
      } catch {
        console.log('Using default templates')
      }
    }
    init()
  }, [])

  const filters = [
    { key: 'all', label: 'All Templates' },
    { key: 'free', label: '🆓 Free' },
    { key: 'paid', label: '💎 Premium' },
    { key: '1col', label: '1 Column' },
    { key: '2col', label: '2 Columns' },
  ]

  const filtered = templates.filter(t => {
    if (!t.is_active) return false
    if (activeFilter === 'free') return t.credit_cost === 0
    if (activeFilter === 'paid') return t.credit_cost > 0
    if (activeFilter === '1col') return t.columns === 1
    if (activeFilter === '2col') return t.columns === 2
    return true
  })

  const getColor = (id: string) => colors[id] || '#1e40af'

  const isUnlocked = (template: any) => {
    if (template.credit_cost === 0 || template.is_free) return true
    if (userPlan === 'premium' || userCredits >= 999999) return true
    return false
  }

  const canAfford = (template: any) => {
    if (isUnlocked(template)) return true
    return userCredits >= template.credit_cost
  }

  const getCreditBadge = (template: any) => {
    if (template.credit_cost === 0 || template.is_free) {
      return { label: 'FREE', bg: 'rgba(22,163,74,0.2)', color: '#4ade80', border: 'rgba(22,163,74,0.3)' }
    }
    if (userPlan === 'premium' || userCredits >= 999999) {
      return { label: 'UNLOCKED', bg: 'rgba(217,119,6,0.2)', color: '#fcd34d', border: 'rgba(217,119,6,0.3)' }
    }
    if (template.credit_cost <= 3) {
      return { label: `${template.credit_cost} CREDITS`, bg: 'rgba(37,99,235,0.2)', color: '#93c5fd', border: 'rgba(37,99,235,0.3)' }
    }
    return { label: `${template.credit_cost} CREDITS`, bg: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: 'rgba(124,58,237,0.3)' }
  }

  const handleUseTemplate = async () => {
    if (!selected) return
    const template = templates.find(t => t.id === selected)
    if (!template) return

    if (!userId) { router.push('/login'); return }

    // Free template or premium user
    if (isUnlocked(template)) {
      router.push(`/resume/builder?template=${selected}&color=${encodeURIComponent(getColor(selected))}`)
      return
    }

    // Check if can afford
    if (!canAfford(template)) {
      setError(`Not enough credits. Need ${template.credit_cost}, you have ${userCredits}.`)
      return
    }

    // Deduct credits
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/templates/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, templateId: selected })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to use template')
        setLoading(false)
        return
      }

      if (data.credits_deducted > 0) {
        setUserCredits(prev => prev - data.credits_deducted)
      }

      router.push(`/resume/builder?template=${selected}&color=${encodeURIComponent(getColor(selected))}`)

    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const selectedTemplate = templates.find(t => t.id === selected)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Top Bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '12px' }}>AI</div>
              <span style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>PlacementCoach</span>
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {[{ num: '1', label: 'Choose Template', active: true }, { num: '2', label: 'Fill Details', active: false }, { num: '3', label: 'Download', active: false }].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: s.active ? '#2563eb' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.active ? 'white' : '#475569', fontSize: '11px', fontWeight: '700' }}>{s.num}</div>
                    <span style={{ fontSize: '12px', color: s.active ? 'white' : '#475569', fontWeight: s.active ? '600' : '400' }}>{s.label}</span>
                  </div>
                  {i < 2 && <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Credits display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 14px' }}>
              <span style={{ fontSize: '14px' }}>⚡</span>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>
                {userCredits >= 999999 ? 'Unlimited' : userCredits} credits
              </span>
            </div>
            <Link href="/resume" style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', fontSize: '13px', color: '#94a3b8' }}>
              AI Builder
            </Link>
            <Link href="/dashboard" style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', textDecoration: 'none', fontSize: '13px', color: '#93c5fd', fontWeight: '600' }}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '9999px', padding: '5px 14px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ color: '#93c5fd', fontSize: '12px', fontWeight: '600' }}>{templates.filter(t => t.is_active).length} ATS-Verified Templates</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '42px', fontWeight: '900', color: 'white', lineHeight: '1.1', marginBottom: '10px' }}>
                Pick your perfect<br />
                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>resume style</span>
              </h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Free templates available. Premium designs cost 3-5 credits.
              </p>
            </div>

            {/* Credit info box */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 20px', textAlign: 'right' as const }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#4ade80' }}>
                    {templates.filter(t => t.credit_cost === 0).length}
                  </div>
                  <div style={{ color: '#16a34a', fontSize: '11px', fontWeight: '600' }}>Free</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#93c5fd' }}>
                    {templates.filter(t => t.credit_cost > 0).length}
                  </div>
                  <div style={{ color: '#2563eb', fontSize: '11px', fontWeight: '600' }}>Premium</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#fcd34d' }}>
                    {userCredits >= 999999 ? '∞' : userCredits}
                  </div>
                  <div style={{ color: '#d97706', fontSize: '11px', fontWeight: '600' }}>Your Credits</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
              padding: '8px 18px', borderRadius: '9999px', border: 'none',
              background: activeFilter === f.key ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)',
              color: activeFilter === f.key ? 'white' : '#64748b',
              fontSize: '13px', fontWeight: activeFilter === f.key ? '700' : '400', cursor: 'pointer'
            }}>
              {f.label}
              <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>
                {f.key === 'all' ? templates.filter(t => t.is_active).length
                  : f.key === 'free' ? templates.filter(t => t.credit_cost === 0 && t.is_active).length
                  : f.key === 'paid' ? templates.filter(t => t.credit_cost > 0 && t.is_active).length
                  : f.key === '1col' ? templates.filter(t => t.columns === 1 && t.is_active).length
                  : templates.filter(t => t.columns === 2 && t.is_active).length}
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fca5a5', fontSize: '14px' }}>⚠️ {error}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/billing" style={{ background: 'rgba(37,99,235,0.3)', color: '#93c5fd', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                Get Credits →
              </Link>
              <button onClick={() => setError('')} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '120px' }}>
          {filtered.map(template => {
            const color = getColor(template.id)
            const isSelected = selected === template.id
            const isHovered = hovering === template.id
            const unlocked = isUnlocked(template)
            const affordable = canAfford(template)
            const badge = getCreditBadge(template)

            return (
              <div key={template.id}
                onMouseEnter={() => setHovering(template.id)}
                onMouseLeave={() => setHovering(null)}
                onClick={() => setSelected(template.id)}
                style={{
                  borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                  border: isSelected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.25s',
                  transform: isHovered || isSelected ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isSelected ? `0 0 40px ${color}30` : isHovered ? '0 20px 60px rgba(0,0,0,0.4)' : 'none',
                  opacity: !affordable && !unlocked ? 0.7 : 1
                }}
              >
                {/* Preview Area */}
                <div style={{ position: 'relative' as const, height: '280px', overflow: 'hidden' }}>
                  <ResumePreview id={template.id} color={color} />

                  {/* Gradient overlay */}
                  <div style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(10,15,26,0.8))' }} />

                  {/* Credit Cost Badge — TOP LEFT */}
                  <div style={{
                    position: 'absolute' as const, top: '12px', left: '12px',
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    fontSize: '11px', fontWeight: '800',
                    padding: '5px 12px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '5px'
                  }}>
                    {template.credit_cost === 0 ? '🆓' : unlocked ? '🔓' : '⚡'}
                    {badge.label}
                  </div>

                  {/* ATS Score — TOP RIGHT */}
                  <div style={{
                    position: 'absolute' as const, top: '12px', right: '12px',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '8px', padding: '6px 10px', textAlign: 'center' as const
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: template.ats_score >= 97 ? '#4ade80' : '#facc15' }}>{template.ats_score}%</div>
                    <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '600' }}>ATS</div>
                  </div>

                  {/* Not affordable overlay */}
                  {!affordable && !unlocked && (
                    <div style={{
                      position: 'absolute' as const, inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex', flexDirection: 'column' as const,
                      alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                      <div style={{ fontSize: '28px' }}>🔒</div>
                      <p style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>
                        Need {template.credit_cost} credits
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '12px' }}>
                        You have {userCredits} credits
                      </p>
                      <Link href="/billing"
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', padding: '8px 18px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', marginTop: '4px' }}>
                        Get Credits →
                      </Link>
                    </div>
                  )}

                  {/* Selected checkmark */}
                  {isSelected && affordable && (
                    <div style={{ position: 'absolute' as const, bottom: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px ${color}60` }}>
                      <span style={{ color: 'white', fontSize: '16px', fontWeight: '900' }}>✓</span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  {isHovered && !isSelected && affordable && (
                    <div style={{ position: 'absolute' as const, inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'white', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        {template.credit_cost === 0 ? 'Use Free →' : `Use for ${template.credit_cost} credits →`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '2px' }}>{template.name}</h3>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{template.subtitle}</p>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{template.columns} col {template.has_photo ? '• Photo' : ''}</div>
                      {/* Credit cost indicator */}
                      <div style={{
                        marginTop: '4px', fontSize: '12px', fontWeight: '800',
                        color: template.credit_cost === 0 ? '#4ade80' : unlocked ? '#fcd34d' : '#93c5fd'
                      }}>
                        {template.credit_cost === 0 ? 'FREE' : unlocked ? '🔓 Unlocked' : `⚡ ${template.credit_cost} credits`}
                      </div>
                    </div>
                  </div>

                  {/* Best For */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Best for: </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{template.best_for}</span>
                  </div>

                  {/* Color Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600' }}>COLOR</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {TEMPLATE_COLORS.map((c, ci) => (
                        <div key={ci}
                          onClick={e => { e.stopPropagation(); setColors(prev => ({ ...prev, [template.id]: c })) }}
                          style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: c, cursor: 'pointer',
                            border: color === c ? '3px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                            boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                            transform: color === c ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.15s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div style={{
        position: 'fixed' as const, bottom: 0, left: 0, right: 0,
        background: 'rgba(10,15,26,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 32px', zIndex: 200
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {selectedTemplate ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: getColor(selected!), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900' }}>
                {selectedTemplate.name[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <p style={{ fontWeight: '700', color: 'white', fontSize: '15px' }}>{selectedTemplate.name} — {selectedTemplate.subtitle}</p>
                  <div style={{
                    background: getCreditBadge(selectedTemplate).bg,
                    color: getCreditBadge(selectedTemplate).color,
                    border: `1px solid ${getCreditBadge(selectedTemplate).border}`,
                    fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px'
                  }}>
                    {selectedTemplate.credit_cost === 0 ? 'FREE' : isUnlocked(selectedTemplate) ? 'UNLOCKED' : `${selectedTemplate.credit_cost} CREDITS`}
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '12px' }}>
                  ATS: {selectedTemplate.ats_score}% • {selectedTemplate.columns} column •
                  {selectedTemplate.credit_cost === 0 ? ' Free to use' : isUnlocked(selectedTemplate) ? ' Unlocked for you' : ` Costs ${selectedTemplate.credit_cost} credits`}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }} />
              <p style={{ color: '#475569', fontSize: '14px' }}>Select a template above to continue</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Not enough credits warning */}
            {selected && selectedTemplate && !isUnlocked(selectedTemplate) && !canAfford(selectedTemplate) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '10px', padding: '8px 14px' }}>
                <span style={{ color: '#fca5a5', fontSize: '13px' }}>⚠️ Need {selectedTemplate.credit_cost - userCredits} more credits</span>
                <Link href="/billing" style={{ color: '#93c5fd', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>Get Credits →</Link>
              </div>
            )}

            <Link href="/resume" style={{ padding: '11px 22px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', fontSize: '14px', color: '#64748b' }}>
              Choose later
            </Link>

            <button
              disabled={!selected || loading || (!isUnlocked(selectedTemplate!) && !canAfford(selectedTemplate!))}
              onClick={handleUseTemplate}
              style={{
                padding: '11px 32px', borderRadius: '10px', border: 'none',
                background: selected && (isUnlocked(selectedTemplate!) || canAfford(selectedTemplate!))
                  ? `linear-gradient(135deg, ${getColor(selected!)}, ${getColor(selected!)}cc)`
                  : 'rgba(255,255,255,0.05)',
                fontSize: '15px', fontWeight: '700',
                color: selected && (isUnlocked(selectedTemplate!) || canAfford(selectedTemplate!)) ? 'white' : '#334155',
                cursor: selected && (isUnlocked(selectedTemplate!) || canAfford(selectedTemplate!)) ? 'pointer' : 'not-allowed',
                boxShadow: selected ? `0 4px 24px ${getColor(selected!)}50` : 'none',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Processing...'
                : !selected ? 'Select a template first'
                : selectedTemplate?.credit_cost === 0 || isUnlocked(selectedTemplate!) ? `Use ${selectedTemplate?.name} Free →`
                : canAfford(selectedTemplate!) ? `Use for ${selectedTemplate?.credit_cost} credits →`
                : 'Not enough credits'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}