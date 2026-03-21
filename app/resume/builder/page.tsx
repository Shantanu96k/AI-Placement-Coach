'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ResumeData {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  summary: string
  skills: string
  experience: string
  education: string
  projects: string
  certifications: string
}

const EMPTY: ResumeData = {
  name: '', title: '', email: '', phone: '',
  location: '', linkedin: '', summary: '',
  skills: '', experience: '', education: '',
  projects: '', certifications: ''
}

const TEMPLATE_NAMES: Record<string, string> = {
  nova: 'Nova — Clean & Modern',
  pulse: 'Pulse — Bold Two-Column',
  apex: 'Apex — Executive Bold',
  zen: 'Zen — Ultra Minimal',
  spark: 'Spark — Creative Sidebar',
  bloom: 'Bloom — Fresher Special',
}

// ── Live Preview component ──────────────────────────────────────────────────
function LivePreview({ data, template, color }: { data: ResumeData, template: string, color: string }) {
  const hasName = data.name.trim()
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean)

  const parseBlocks = (text: string) => text.split('\n').filter(l => l.trim())

  if (template === 'pulse' || template === 'spark') {
    return (
      <div style={{ background: 'white', minHeight: '100%', display: 'grid', gridTemplateColumns: template === 'spark' ? '35% 65%' : '38% 62%', fontFamily: 'Georgia, serif', fontSize: '9px' }}>
        {/* Sidebar */}
        <div style={{ background: color, padding: '24px 16px', color: 'white' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '900' }}>
            {hasName ? data.name[0].toUpperCase() : '?'}
          </div>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontWeight: '900', fontSize: '13px', lineHeight: '1.2' }}>{data.name || 'Your Name'}</div>
            <div style={{ opacity: 0.8, marginTop: '4px' }}>{data.title || 'Target Role'}</div>
          </div>
          {data.email && <div style={{ marginBottom: '4px', opacity: 0.9 }}>📧 {data.email}</div>}
          {data.phone && <div style={{ marginBottom: '4px', opacity: 0.9 }}>📞 {data.phone}</div>}
          {data.location && <div style={{ marginBottom: '4px', opacity: 0.9 }}>📍 {data.location}</div>}
          {data.linkedin && <div style={{ marginBottom: '4px', opacity: 0.9, wordBreak: 'break-all' }}>🔗 {data.linkedin}</div>}

          {skills.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '8px', fontWeight: '800', letterSpacing: '1px', opacity: 0.7, marginBottom: '8px', textTransform: 'uppercase' }}>Skills</div>
              {skills.map((s, i) => <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '3px 8px', marginBottom: '4px' }}>{s}</div>)}
            </div>
          )}

          {data.education && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '8px', fontWeight: '800', letterSpacing: '1px', opacity: 0.7, marginBottom: '8px', textTransform: 'uppercase' }}>Education</div>
              {parseBlocks(data.education).map((l, i) => <div key={i} style={{ opacity: 0.9, marginBottom: '3px', lineHeight: '1.4' }}>{l}</div>)}
            </div>
          )}
        </div>

        {/* Main */}
        <div style={{ padding: '24px 18px' }}>
          {data.summary && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: '900', fontSize: '10px', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '8px' }}>Profile</div>
              <p style={{ color: '#374151', lineHeight: '1.5' }}>{data.summary}</p>
            </div>
          )}
          {data.experience && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: '900', fontSize: '10px', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '8px' }}>Experience</div>
              {parseBlocks(data.experience).map((l, i) => <div key={i} style={{ color: '#374151', lineHeight: '1.5', marginBottom: '4px' }}>{l}</div>)}
            </div>
          )}
          {data.projects && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: '900', fontSize: '10px', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '8px' }}>Projects</div>
              {parseBlocks(data.projects).map((l, i) => <div key={i} style={{ color: '#374151', lineHeight: '1.5', marginBottom: '4px' }}>{l}</div>)}
            </div>
          )}
          {data.certifications && (
            <div>
              <div style={{ fontWeight: '900', fontSize: '10px', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '8px' }}>Certifications</div>
              {parseBlocks(data.certifications).map((l, i) => <div key={i} style={{ color: '#374151', lineHeight: '1.5', marginBottom: '4px' }}>{l}</div>)}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (template === 'zen') {
    return (
      <div style={{ background: 'white', minHeight: '100%', padding: '40px 36px', fontFamily: "'Times New Roman', serif", fontSize: '9px' }}>
        <div style={{ borderBottom: `1px solid ${color}`, paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{data.name || 'Your Name'}</div>
            <div style={{ color: color, marginTop: '4px', fontSize: '10px', fontWeight: '600' }}>{data.title || 'Target Role'}</div>
          </div>
          <div style={{ textAlign: 'right', color: '#6b7280' }}>
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
          </div>
        </div>

        {[
          { title: 'SUMMARY', body: data.summary },
          { title: 'EXPERIENCE', body: data.experience },
          { title: 'EDUCATION', body: data.education },
          { title: 'SKILLS', body: skills.join(' • ') },
          { title: 'PROJECTS', body: data.projects },
          { title: 'CERTIFICATIONS', body: data.certifications },
        ].filter(s => s.body?.trim()).map((s, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '8px', fontWeight: '900', letterSpacing: '2px', color: color, textTransform: 'uppercase', marginBottom: '6px' }}>{s.title}</div>
            <div style={{ color: '#374151', lineHeight: '1.6' }}>{s.body.split('\n').map((l, j) => <div key={j}>{l}</div>)}</div>
          </div>
        ))}
      </div>
    )
  }

  if (template === 'apex') {
    return (
      <div style={{ background: 'white', minHeight: '100%', fontFamily: 'Arial, sans-serif', fontSize: '9px' }}>
        <div style={{ background: color, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', color: 'white' }}>
            {hasName ? data.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'white' }}>{data.name || 'Your Name'}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{data.title || 'Target Role'}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
              {[data.email, data.phone, data.location].filter(Boolean).join(' • ')}
            </div>
          </div>
        </div>
        <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { title: 'EXPERIENCE', body: data.experience },
            { title: 'SKILLS', body: skills.join(', ') || data.skills },
            { title: 'EDUCATION', body: data.education },
            { title: 'PROJECTS', body: data.projects },
            { title: 'SUMMARY', body: data.summary },
            { title: 'CERTIFICATIONS', body: data.certifications },
          ].filter(s => s.body?.trim()).map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '8px', fontWeight: '900', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1.5px solid ${color}`, paddingBottom: '3px', marginBottom: '6px' }}>{s.title}</div>
              <div style={{ color: '#374151', lineHeight: '1.5' }}>{s.body.split('\n').map((l, j) => <div key={j}>{l}</div>)}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Nova / Bloom (default)
  return (
    <div style={{ background: 'white', minHeight: '100%', fontFamily: 'Arial, sans-serif', fontSize: '9px' }}>
      <div style={{ background: color, padding: '22px 28px' }}>
        <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{data.name || 'Your Name'}</div>
        <div style={{ color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontWeight: '600' }}>{data.title || 'Target Role'}</div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '12px', color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap' }}>
          {data.email && <span>📧 {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>🔗 {data.linkedin}</span>}
        </div>
      </div>
      <div style={{ padding: '18px 28px' }}>
        {[
          { title: 'PROFESSIONAL SUMMARY', body: data.summary },
          { title: 'WORK EXPERIENCE', body: data.experience },
          { title: 'KEY SKILLS', body: skills.length > 0 ? skills.join(' · ') : data.skills },
          { title: 'EDUCATION', body: data.education },
          { title: 'PROJECTS', body: data.projects },
          { title: 'CERTIFICATIONS', body: data.certifications },
        ].filter(s => s.body?.trim()).map((s, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <div style={{ fontSize: '7px', fontWeight: '900', color, textTransform: 'uppercase', letterSpacing: '2px' }}>{s.title}</div>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>
            <div style={{ color: '#374151', lineHeight: '1.6' }}>{s.body.split('\n').map((l, j) => <div key={j}>{l}</div>)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── The page needs Suspense because of useSearchParams ──────────────────────
function BuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const template = searchParams.get('template') || 'nova'
  const color = decodeURIComponent(searchParams.get('color') || '#1e40af')

  const [userId, setUserId] = useState('')
  const [credits, setCredits] = useState(0)
  const [data, setData] = useState<ResumeData>(EMPTY)
  const [activeSection, setActiveSection] = useState('personal')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUserId(user.id)
        const { data: sub } = await supabase.from('subscriptions').select('credits_remaining').eq('user_id', user.id).single()
        if (sub) setCredits(sub.credits_remaining)
      } catch (err) {
        console.error(err)
      }
    }
    getUser()
  }, [router])

  const handleChange = (field: keyof ResumeData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleAIFill = async () => {
    if (!data.name || !data.title) {
      setError('Please enter your Name and Target Role first.')
      return
    }
    if (credits < 5) {
      setError(`Need 5 credits to use AI Builder. You have ${credits}.`)
      return
    }
    setGenerateLoading(true)
    setError('')
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          skills: data.skills,
          experience: data.experience,
          education: data.education,
          projects: data.projects,
          targetRole: data.title,
          targetCompany: '',
        })
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Generation failed.'); return }
      // Try to parse the AI's text resume back into sections
      const aiText: string = json.resume || ''
      setData(prev => ({
        ...prev,
        summary: extractSection(aiText, ['SUMMARY', 'PROFESSIONAL SUMMARY', 'OBJECTIVE']),
        skills: extractSection(aiText, ['SKILLS', 'KEY SKILLS', 'TECHNICAL SKILLS']) || prev.skills,
        experience: extractSection(aiText, ['EXPERIENCE', 'WORK EXPERIENCE']) || prev.experience,
        education: extractSection(aiText, ['EDUCATION']) || prev.education,
        projects: extractSection(aiText, ['PROJECTS']) || prev.projects,
        certifications: extractSection(aiText, ['CERTIFICATIONS', 'ACHIEVEMENTS']) || prev.certifications,
      }))
      setCredits(c => c - 5)
    } catch {
      setError('AI generation failed. Please try again.')
    } finally {
      setGenerateLoading(false)
    }
  }

  const extractSection = (text: string, headings: string[]) => {
    const lines = text.split('\n')
    let capturing = false
    const result: string[] = []
    for (const line of lines) {
      const upper = line.trim().toUpperCase()
      if (headings.some(h => upper.includes(h))) { capturing = true; continue }
      if (capturing) {
        if (/^[A-Z\s]{4,}$/.test(line.trim()) && !line.startsWith(' ')) break
        result.push(line)
      }
    }
    return result.join('\n').trim()
  }

  const handleDownload = () => {
    const text = `${data.name.toUpperCase()}
${data.title}
${[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(' | ')}

${data.summary ? `PROFESSIONAL SUMMARY\n${data.summary}\n` : ''}
${data.experience ? `WORK EXPERIENCE\n${data.experience}\n` : ''}
${data.education ? `EDUCATION\n${data.education}\n` : ''}
${data.skills ? `SKILLS\n${data.skills}\n` : ''}
${data.projects ? `PROJECTS\n${data.projects}\n` : ''}
${data.certifications ? `CERTIFICATIONS\n${data.certifications}\n` : ''}
`.trim()

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.name.replace(/\s+/g, '_') || 'resume'}_${template}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrintPDF = () => {
    window.print()
  }

  const SECTIONS = [
    { id: 'personal', label: '👤 Personal', icon: '👤' },
    { id: 'summary', label: '📝 Summary', icon: '📝' },
    { id: 'experience', label: '💼 Experience', icon: '💼' },
    { id: 'education', label: '🎓 Education', icon: '🎓' },
    { id: 'skills', label: '💻 Skills', icon: '💻' },
    { id: 'projects', label: '🚀 Projects', icon: '🚀' },
    { id: 'certifications', label: '🏆 Certs', icon: '🏆' },
  ]

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { width: 100%; height: auto; transform: none !important; box-shadow: none !important; }
          body { margin: 0; }
        }
        .input-field {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          color: #1e293b;
          font-weight: 500;
          transition: all 0.3s ease;
          background: #f8fafc;
        }
        .input-field:focus {
          border-color: ${color};
          box-shadow: 0 0 0 4px ${color}20;
          background: white;
        }
        .section-tab {
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          border: none;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }
        .section-tab:hover {
          background: rgba(255,255,255,0.05);
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0f1a', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>

        {/* ── Top Bar ── */}
        <div className="no-print" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/resume/templates" style={{ color: '#64748b', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
              ← Templates
            </Link>
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: color }} />
              <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '700' }}>
                {TEMPLATE_NAMES[template] || template}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', color: '#93c5fd', fontSize: '13px', fontWeight: '600', padding: '5px 12px', borderRadius: '8px' }}>
              🪙 {credits} credits
            </span>

            <button onClick={handleAIFill} disabled={generateLoading || credits < 5}
              style={{
                background: generateLoading || credits < 5 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: generateLoading || credits < 5 ? '#475569' : 'white',
                padding: '8px 16px', borderRadius: '10px', border: 'none', fontSize: '13px',
                fontWeight: '700', cursor: generateLoading || credits < 5 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s'
              }}>
              {generateLoading ? '✨ AI Filling...' : '✨ AI Fill (5 credits)'}
            </button>

            <button onClick={handleDownload} style={{ background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              ⬇ Download TXT
            </button>

            <button onClick={handlePrintPDF} style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: 'white', padding: '8px 16px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 4px 12px ${color}50` }}>
              🖨 Save as PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="no-print" style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 24px', fontSize: '14px', fontWeight: '600', textAlign: 'center', flexShrink: 0 }}>
            ⚠️ {error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', marginLeft: '12px' }}>✕</button>
          </div>
        )}

        {/* ── Main Layout: Left Panel + Preview ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left: Navigation + Form */}
          <div className="no-print" style={{ width: '380px', flexShrink: 0, display: 'flex', background: '#0d1424', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Section nav */}
            <div style={{ width: '80px', background: 'rgba(0,0,0,0.3)', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)} className="section-tab"
                  style={{
                    background: activeSection === s.id ? `${color}25` : 'transparent',
                    color: activeSection === s.id ? color : '#475569',
                    border: activeSection === s.id ? `1px solid ${color}40` : '1px solid transparent',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    display: 'flex', gap: '4px', padding: '10px 4px'
                  }}>
                  <span style={{ fontSize: '18px' }}>{s.icon}</span>
                  <span style={{ fontSize: '9px', textAlign: 'center', lineHeight: '1.2' }}>{s.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>

            {/* Form panel */}
            <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {activeSection === 'personal' && (
                  <>
                    {[
                      { field: 'name', label: 'Full Name *', placeholder: 'Rahul Sharma', type: 'input' },
                      { field: 'title', label: 'Target Role *', placeholder: 'Software Engineer', type: 'input' },
                      { field: 'email', label: 'Email', placeholder: 'rahul@gmail.com', type: 'input' },
                      { field: 'phone', label: 'Phone', placeholder: '+91 9876543210', type: 'input' },
                      { field: 'location', label: 'Location', placeholder: 'Mumbai, India', type: 'input' },
                      { field: 'linkedin', label: 'LinkedIn / Portfolio', placeholder: 'linkedin.com/in/rahul', type: 'input' },
                    ].map(f => (
                      <div key={f.field}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {f.label}
                        </label>
                        <input
                          className="input-field"
                          value={data[f.field as keyof ResumeData]}
                          onChange={e => handleChange(f.field as keyof ResumeData, e.target.value)}
                          placeholder={f.placeholder}
                        />
                      </div>
                    ))}
                  </>
                )}

                {activeSection === 'summary' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Professional Summary
                    </label>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', lineHeight: '1.5' }}>
                      2-3 lines about your expertise, key skills, and career goal.
                    </p>
                    <textarea
                      className="input-field"
                      rows={6}
                      value={data.summary}
                      onChange={e => handleChange('summary', e.target.value)}
                      placeholder="Passionate Software Engineer with 2+ years of experience building scalable web applications with React and Node.js. Seeking a challenging role at a product company..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Work Experience
                    </label>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', lineHeight: '1.5' }}>
                      Each entry on a new line. Write most recent job first.
                    </p>
                    <textarea
                      className="input-field"
                      rows={10}
                      value={data.experience}
                      onChange={e => handleChange('experience', e.target.value)}
                      placeholder={`Software Intern — TCS (Jun 2023 – Aug 2023)\n• Built REST APIs with Node.js and Express\n• Reduced page load time by 30% via caching\n• Collaborated with a team of 8 engineers\n\nFresher — Write "No experience yet" if applicable`}
                      style={{ resize: 'vertical', lineHeight: '1.6' }}
                    />
                  </div>
                )}

                {activeSection === 'education' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Education
                    </label>
                    <textarea
                      className="input-field"
                      rows={6}
                      value={data.education}
                      onChange={e => handleChange('education', e.target.value)}
                      placeholder={`B.Tech Computer Science — VNIT Nagpur (2020–2024)\nCGPA: 8.2 / 10\n\n12th — DPS Delhi — 92% (2020)\n10th — DPS Delhi — 95% (2018)`}
                      style={{ resize: 'vertical', lineHeight: '1.6' }}
                    />
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Skills (comma-separated)
                    </label>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', lineHeight: '1.5' }}>
                      Separate each skill with a comma. They'll show as tags in your resume.
                    </p>
                    <textarea
                      className="input-field"
                      rows={5}
                      value={data.skills}
                      onChange={e => handleChange('skills', e.target.value)}
                      placeholder="Python, Java, React.js, Node.js, SQL, AWS, Git, Docker, REST APIs, TypeScript"
                      style={{ resize: 'vertical' }}
                    />
                    {data.skills && (
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {data.skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                          <span key={i} style={{ background: `${color}20`, border: `1px solid ${color}40`, color, fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '8px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'projects' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Projects
                    </label>
                    <textarea
                      className="input-field"
                      rows={10}
                      value={data.projects}
                      onChange={e => handleChange('projects', e.target.value)}
                      placeholder={`E-Commerce Platform (React + Node.js)\n• Served 500+ users with Razorpay payment integration\n• Deployed on AWS EC2 with CI/CD pipeline\n\nAI Chatbot (Python + Claude API)\n• Automated customer support for 3 businesses\n• 90% query resolution rate`}
                      style={{ resize: 'vertical', lineHeight: '1.6' }}
                    />
                  </div>
                )}

                {activeSection === 'certifications' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Certifications & Achievements
                    </label>
                    <textarea
                      className="input-field"
                      rows={6}
                      value={data.certifications}
                      onChange={e => handleChange('certifications', e.target.value)}
                      placeholder={`AWS Certified Solutions Architect — 2024\nGoogle Data Analytics Certificate — Coursera\nHackerRank Problem Solving (Gold Badge)\nWinner — TCS CodeVita 2023`}
                      style={{ resize: 'vertical', lineHeight: '1.6' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                  💡 <strong style={{ color: '#64748b' }}>Tip:</strong> Use the <strong style={{ color: '#6366f1' }}>AI Fill</strong> button in the top bar to auto-generate professional content from your raw input.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div style={{ flex: 1, overflow: 'auto', background: '#111827', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px' }}>
            <div style={{ width: '100%', maxWidth: '740px' }}>
              <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.25)', color: '#4ade80', fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '9999px' }}>
                  🟢 Live Preview
                </span>
              </div>
              <div className="print-area" style={{
                width: '100%', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
                border: `3px solid ${color}40`, borderRadius: '4px', overflow: 'hidden'
              }}>
                <LivePreview data={data} template={template} color={color} />
              </div>
              <div className="no-print" style={{ textAlign: 'center', marginTop: '20px', color: '#475569', fontSize: '13px' }}>
                Click <strong style={{ color: '#94a3b8' }}>🖨 Save as PDF</strong> to print as a PDF file
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: '600' }}>
        Loading template builder...
      </div>
    }>
      <BuilderContent />
    </Suspense>
  )
}
