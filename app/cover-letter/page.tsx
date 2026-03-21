'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Style = 'professional' | 'modern' | 'creative' | 'fresher'

const STYLES: { id: Style; label: string; icon: string; desc: string }[] = [
  { id: 'professional', label: 'Professional', icon: '🏢', desc: 'Formal tone — ideal for TCS, Infosys, banks' },
  { id: 'modern', label: 'Modern', icon: '⚡', desc: 'Confident & direct — great for product companies' },
  { id: 'creative', label: 'Creative', icon: '🎨', desc: 'Personality-driven — for design/marketing roles' },
  { id: 'fresher', label: 'Fresher', icon: '🎓', desc: 'Entry-level focused — highlight academics & drive' },
]

const TONE_WORDS: Record<Style, { opener: string; closing: string }> = {
  professional: {
    opener: 'I am writing to express my keen interest in the {role} position at {company}.',
    closing: 'I would welcome the opportunity to discuss how my background, skills, and enthusiasm align with the goals of {company}. Thank you for your time and consideration.',
  },
  modern: {
    opener: "I'd love to join {company} as {role} and help build something remarkable.",
    closing: "I'm excited about the possibility of contributing to {company}'s mission. Let's connect and explore the fit.",
  },
  creative: {
    opener: 'When I discovered the {role} opening at {company}, I knew this was the perfect intersection of my passion and your vision.',
    closing: "I'd love to bring my unique perspective to {company} and help tell an even bigger story together. Looking forward to connecting!",
  },
  fresher: {
    opener: 'As a recent graduate passionate about {role.toLowerCase()}, I am excited to apply to {company}.',
    closing: 'I am eager to begin my career at {company}, contribute from day one, and grow with your team. Thank you for considering my application.',
  },
}

export default function CoverLetterPage() {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)

  const [plan, setPlan] = useState('')
  const [credits, setCredits] = useState(0)
  const [userId, setUserId] = useState('')

  // Form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [hiringManager, setHiringManager] = useState('')
  const [skills, setSkills] = useState('')
  const [experience, setExperience] = useState('')
  const [achievement, setAchievement] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [style, setStyle] = useState<Style>('professional')

  // Output
  const [letter, setLetter] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState<'info' | 'role' | 'style'>('info')

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

  const isPro = plan === 'pro' || plan === 'premium'

  const handleGenerate = async () => {
    if (!name || !role || !company) { setError('Fill Name, Target Role, and Company.'); return }
    if (credits < 4) { setError(`Need 4 credits. You have ${credits}.`); return }
    setGenerating(true); setError('')
    try {
      const styleGuide: Record<Style, string> = {
        professional: 'Formal, structured, measured. Use phrases like "I am pleased to", "I am confident that". 3 paragraphs. No slang.',
        modern: 'Confident, concise, punchy. Lead with impact. Short paragraphs. No fluff. Show results.',
        creative: 'Engaging, story-driven, warm. Use vivid language. Show personality. Make them want to meet you.',
        fresher: 'Enthusiastic, humble, eager. Highlight academic achievements, projects, and learning ability. Be genuine.',
      }

      const prompt = `Write a compelling cover letter. Return only the cover letter text, no subject line or extra labels.

Details:
- Applicant: ${name} | Email: ${email} | Phone: ${phone}
- Applying for: ${role} at ${company}
- Hiring Manager: ${hiringManager || 'Hiring Manager'}
- Key Skills: ${skills}
- Experience: ${experience || 'Not mentioned'}
- Key Achievement: ${achievement}
- Job Description Keywords: ${jobDesc}
- Style: ${styleGuide[style]}

Structure:
1. Opening: Hook + role mention
2. Why me: 2-3 specific reasons backed by skills/achievements
3. Why ${company}: Show you researched them
4. Call to action: Professional closing

Keep it to 3-4 paragraphs, 250-320 words. Do NOT use placeholder brackets. Write directly.`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setLetter(data.response || '')

      // Deduct credits
      await supabase.from('subscriptions').update({ credits_remaining: credits - 4 }).eq('user_id', userId)
      setCredits(c => c - 4)
    } catch {
      setError('Generation failed. Please try again.')
    }
    setGenerating(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => window.print()

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  const SECTIONS = [
    { id: 'info' as const, label: '👤 Your Info', icon: '👤' },
    { id: 'role' as const, label: '💼 Job Details', icon: '💼' },
    { id: 'style' as const, label: '🎨 Style', icon: '🎨' },
  ]

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-letter { width: 100% !important; max-width: 780px !important; margin: 0 auto !important; box-shadow: none !important; border: none !important; }
          body { background: white !important; }
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes typing { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        .cl-input {
          width: 100%; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 12px 16px; font-size: 14px; outline: none;
          background: #f8fafc; color: #1e293b; font-weight: 500;
          transition: all 0.3s; box-sizing: border-box; font-family: inherit;
        }
        .cl-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.12); background: white; }

        .style-card { transition: all 0.25s cubic-bezier(0.16,1,0.3,1); border-radius: 14px; cursor: pointer; border: none; text-align: left; }
        .style-card:hover { transform: translateY(-3px); }

        .shimmer-purple {
          background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #a855f7, #6366f1);
          background-size: 200% auto; animation: shimmer 4s linear infinite;
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }

        .generate-btn { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); position: relative; overflow: hidden; }
        .generate-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); box-shadow: 0 16px 32px rgba(99,102,241,0.45) !important; }
        .generate-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          transform: translateX(-100%); transition: transform 0.6s;
        }
        .generate-btn:hover::after { transform: translateX(100%); }

        .letter-body { line-height: 1.9; font-size: 15px; color: #1e293b; font-family: 'Georgia', serif; white-space: pre-wrap; }

        .tab-btn { transition: all 0.2s; border: none; cursor: pointer; border-radius: 10px; width: 100%; text-align: left; display: flex; align-items: center; gap: 10px; }
        .tab-btn:hover { transform: translateX(3px); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1035 50%, #0a0f1a 100%)', fontFamily: "'Inter', system-ui, sans-serif", color: 'white' }}>

        {/* ── NAV ── */}
        <nav className="no-print" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>← Dashboard</Link>
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#a78bfa' }}>✍️ Cover Letter Generator</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a78bfa', fontSize: '12px', fontWeight: '700', padding: '5px 12px', borderRadius: '9999px' }}>🔒 PRO</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '13px', fontWeight: '600', padding: '5px 12px', borderRadius: '9999px' }}>
              🪙 {credits >= 999999 ? 'Unlimited' : credits} credits
            </div>
          </div>
        </nav>

        {/* ── PRO GATE ── */}
        {!isPro && plan !== '' && (
          <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px', padding: '48px 32px' }}>
              <div style={{ fontSize: '72px', marginBottom: '20px' }}>✍️</div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Pro Feature</h1>
              <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                The AI Cover Letter Generator is available to <strong style={{ color: '#a78bfa' }}>Pro</strong> and <strong style={{ color: '#fcd34d' }}>Premium</strong> subscribers. Upgrade to create job-winning cover letters in seconds.
              </p>
              <Link href="/billing" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: 'white', padding: '16px 40px', borderRadius: '14px', textDecoration: 'none', fontSize: '18px', fontWeight: '800', display: 'inline-block', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        )}

        {isPro && (
          <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header */}
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>
              <h1 className="shimmer-purple" style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>
                ✍️ AI Cover Letter Generator
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>Write a job-winning, personalised cover letter in seconds. <span style={{ color: '#6366f1', fontWeight: '600' }}>4 credits per letter.</span></p>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 18px', borderRadius: '12px', marginTop: '16px', fontSize: '14px', fontWeight: '600' }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Main Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>

              {/* ── LEFT FORM PANEL ── */}
              <div className="no-print" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden' }}>

                {/* Section tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {SECTIONS.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                      style={{ flex: 1, padding: '14px 8px', border: 'none', background: activeSection === s.id ? 'rgba(99,102,241,0.15)' : 'transparent', color: activeSection === s.id ? '#a78bfa' : '#475569', fontSize: '12px', fontWeight: '700', cursor: 'pointer', borderBottom: activeSection === s.id ? '2px solid #6366f1' : '2px solid transparent', transition: 'all 0.2s' }}>
                      {s.icon} {s.label.split(' ')[1]}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Section: Your Info */}
                  {activeSection === 'info' && (
                    <>
                      {[
                        { label: 'Your Full Name *', val: name, set: setName, placeholder: 'Rahul Sharma' },
                        { label: 'Email', val: email, set: setEmail, placeholder: 'rahul@gmail.com' },
                        { label: 'Phone', val: phone, set: setPhone, placeholder: '+91 9876543210' },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{f.label}</label>
                          <input className="cl-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                        </div>
                      ))}
                      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', padding: '12px 14px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>💡 Your name and contact will appear in the letter header automatically.</p>
                      </div>
                    </>
                  )}

                  {/* Section: Job Details */}
                  {activeSection === 'role' && (
                    <>
                      {[
                        { label: 'Target Role *', val: role, set: setRole, placeholder: 'Software Engineer' },
                        { label: 'Company *', val: company, set: setCompany, placeholder: 'Google India' },
                        { label: 'Hiring Manager Name', val: hiringManager, set: setHiringManager, placeholder: 'Priya Mehta (or leave blank)' },
                        { label: 'Your Key Skills', val: skills, set: setSkills, placeholder: 'React, Node.js, Python, AWS' },
                        { label: 'relevant Experience', val: experience, set: setExperience, placeholder: 'e.g. 2 years at TCS, built microservices' },
                        { label: '🏆 Your Proudest Achievement', val: achievement, set: setAchievement, placeholder: 'Reduced load time by 40%, shipped feature used by 10K users...' },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{f.label}</label>
                          <input className="cl-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                        </div>
                      ))}
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Job Description Keywords</label>
                        <textarea className="cl-input" rows={3} value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Paste key phrases from the JD — the AI will mirror these..." style={{ resize: 'vertical' }} />
                      </div>
                    </>
                  )}

                  {/* Section: Style */}
                  {activeSection === 'style' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Choose Tone & Style</p>
                      {STYLES.map(s => (
                        <button key={s.id} onClick={() => setStyle(s.id)} className="style-card"
                          style={{ padding: '16px', background: style === s.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${style === s.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>{s.icon}</span>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '14px', color: style === s.id ? '#a78bfa' : 'white', marginBottom: '3px' }}>{s.label}</div>
                              <div style={{ color: '#64748b', fontSize: '12px' }}>{s.desc}</div>
                            </div>
                            {style === s.id && <span style={{ marginLeft: 'auto', color: '#6366f1', fontSize: '18px' }}>✓</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Generate */}
                  <button onClick={handleGenerate} disabled={generating || credits < 4} className="generate-btn"
                    style={{ width: '100%', padding: '16px', background: generating || credits < 4 ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', borderRadius: '14px', color: credits < 4 ? '#475569' : 'white', fontSize: '16px', fontWeight: '800', cursor: generating || credits < 4 ? 'not-allowed' : 'pointer', boxShadow: credits < 4 ? 'none' : '0 8px 24px rgba(99,102,241,0.35)', marginTop: '8px' }}>
                    {generating ? '✨ Writing your letter...' : '✨ Generate Cover Letter — 4 Credits'}
                  </button>

                  {generating && (
                    <div style={{ textAlign: 'center', color: '#6366f1', fontSize: '13px', fontWeight: '600', animation: 'typing 1.5s ease infinite' }}>
                      AI is crafting a personalised letter for {company || 'this company'}...
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT: LIVE PREVIEW ── */}
              <div>
                {letter ? (
                  <>
                    {/* Toolbar */}
                    <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '16px', justifyContent: 'flex-end' }}>
                      <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {copied ? '✅ Copied!' : '📋 Copy'}
                      </button>
                      <button onClick={handlePrint} style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', color: 'white', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                        🖨 Save as PDF
                      </button>
                    </div>

                    {/* Letter Preview */}
                    <div className="print-letter" ref={printRef} style={{ background: 'white', borderRadius: '16px', padding: '56px 60px', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', minHeight: '600px' }}>
                      {/* Header */}
                      <div style={{ borderBottom: `3px solid ${style === 'creative' ? '#ec4899' : style === 'modern' ? '#6366f1' : '#1e293b'}`, paddingBottom: '20px', marginBottom: '28px' }}>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>{name || 'Your Name'}</div>
                        <div style={{ color: '#475569', fontSize: '14px', marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          {email && <span>✉ {email}</span>}
                          {phone && <span>📞 {phone}</span>}
                        </div>
                      </div>

                      <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>{today}</div>

                      {hiringManager && (
                        <div style={{ marginBottom: '24px', color: '#374151', fontSize: '15px' }}>
                          <div style={{ fontWeight: '600' }}>Dear {hiringManager},</div>
                        </div>
                      )}

                      <div className="letter-body">{letter}</div>

                      <div style={{ marginTop: '36px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                        <div style={{ color: '#374151', fontSize: '15px', fontWeight: '600', marginBottom: '32px' }}>Sincerely,</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}>{name || 'Your Name'}</div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{role && `Applying for: ${role}`}</div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="no-print" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', padding: '16px 20px', marginTop: '16px' }}>
                      <p style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>✏️ Tips for best results</p>
                      <ul style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.7', paddingLeft: '16px', margin: 0 }}>
                        <li>Customise the letter — add specific reasons why you love this company.</li>
                        <li>Match exact keywords from the job description to pass ATS filters.</li>
                        <li>Keep it to one page. Shorter is almost always better.</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)', borderRadius: '20px', minHeight: '560px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '40px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>✍️</div>
                    <p style={{ color: '#475569', fontSize: '16px', textAlign: 'center', lineHeight: '1.6', maxWidth: '280px' }}>
                      Fill your details on the left and click <strong style={{ color: '#a78bfa' }}>Generate</strong> to create a stunning cover letter.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {['Personalised', 'ATS-Friendly', '250-320 words', 'Instant'].map(tag => (
                        <span key={tag} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '9999px' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  )
}
