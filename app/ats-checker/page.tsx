'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ATSResult {
  score: number
  matched_keywords: string[]
  missing_keywords: string[]
  suggestions: string[]
}

function AnimatedScore({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    let start = 0
    const step = score / 60
    const timer = setInterval(() => {
      start += step
      if (start >= score) { setDisplayed(score); clearInterval(timer) }
      else setDisplayed(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const glow  = score >= 75 ? 'rgba(16,185,129,0.4)' : score >= 50 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'
  const dash  = (2 * Math.PI * 54) * (1 - displayed / 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle
          cx="70" cy="70" r="54" fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={2 * Math.PI * 54}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.016s linear', filter: `drop-shadow(0 0 8px ${glow})` }}
        />
        <text x="70" y="70" textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize="28" fontWeight="800" fontFamily="Inter, sans-serif">
          {displayed}
        </text>
        <text x="70" y="93" textAnchor="middle"
          fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Inter, sans-serif">
          / 100
        </text>
      </svg>
      <div style={{
        padding: '8px 20px', borderRadius: '20px',
        background: `${color}20`, border: `1px solid ${color}40`,
        fontSize: '14px', fontWeight: '700', color,
        textShadow: `0 0 10px ${glow}`
      }}>
        {score >= 75 ? '🏆 Excellent Match!' : score >= 50 ? '⚡ Good — Improve More' : '🔧 Needs Improvement'}
      </div>
    </div>
  )
}

export default function ATSCheckerPage() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [resumeFileName, setResumeFileName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<ATSResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)
        const { data } = await supabase
          .from('subscriptions')
          .select('credits_remaining')
          .eq('user_id', user.id)
          .single()
        if (data) setCredits(data.credits_remaining)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    getUser()
  }, [router])

  const processFile = useCallback((file: File) => {
    if (!file) return
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      setError('Please upload a .txt, .pdf, .doc, or .docx file.')
      return
    }
    setResumeFileName(file.name)
    setError('')

    // For PDF/DOC: read as text (basic extraction for pure-text PDFs)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text || text.trim().length < 50) {
        setError('Could not extract text from this file. For best results, upload a plain .txt resume or copy-paste your resume text below.')
        return
      }
      setResumeText(text)
    }
    reader.readAsText(file)
  }, [])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError('Please upload your resume or paste resume text.'); return }
    if (!jobDescription.trim()) { setError('Please paste the job description.'); return }
    if (credits < 2) { setError('Not enough credits. You need 2 credits for an ATS check.'); return }

    setAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, resumeText, jobDescription })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Analysis failed.'); return }
      setResult(data)
      setCredits(c => c - 2)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ textAlign: 'center' as const }}>
        <div style={{
          width: '56px', height: '56px', border: '3px solid rgba(124,58,237,0.3)',
          borderTopColor: '#a78bfa', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
        }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .ats-page {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          color: #fff;
          position: relative;
          overflow-x: hidden;
        }
        /* Orbs */
        .orb { position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.2; animation: floatOrb 12s ease-in-out infinite; pointer-events: none; z-index: 0; }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed, transparent); top: -150px; left: -150px; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #2563eb, transparent); bottom: -100px; right: -100px; animation-delay: -6s; }
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-30px) scale(1.05);} }

        /* Navbar */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 0 40px; height: 72px;
          display: flex; align-items: center; justify-content: space-between;
        }

        /* Glass panels */
        .glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* Upload drop zone */
        .dropzone {
          border: 2px dashed rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 40px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(255,255,255,0.02);
        }
        .dropzone:hover, .dropzone.active {
          border-color: #a78bfa;
          background: rgba(124, 58, 237, 0.08);
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.15);
        }

        /* Textarea */
        .ats-textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px; color: #fff;
          outline: none; resize: vertical;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s;
          min-height: 160px;
        }
        .ats-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .ats-textarea:focus {
          border-color: #7c3aed;
          background: rgba(124, 58, 237, 0.08);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
        }

        /* Analyze button */
        .analyze-btn {
          width: 100%; padding: 18px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 700;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.3s; position: relative; overflow: hidden;
          letter-spacing: 0.3px;
        }
        .analyze-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0; transition: 0.3s;
        }
        .analyze-btn:hover:not(:disabled)::after { opacity: 1; }
        .analyze-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(124,58,237,0.5); }
        .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Loader dots */
        .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: white; margin: 0 3px; animation: bounce 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);} 40%{transform:translateY(-8px);} }

        /* Tags */
        .kw-tag {
          display: inline-block; padding: 5px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 600; margin: 4px;
          transition: transform 0.2s;
          animation: tagPop 0.4s ease both;
        }
        .kw-tag:hover { transform: scale(1.05); }
        @keyframes tagPop { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

        /* Staggered entry */
        .fade-up { animation: fadeUp 0.6s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Progress bar */
        .tip-bar {
          width: 4px; border-radius: 4px; align-self: stretch; flex-shrink: 0;
          background: linear-gradient(to bottom, #a78bfa, #7c3aed);
        }

        /* Spinner */
        .spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ats-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        {/* Navbar */}
        <div className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px',
              fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              ← Dashboard
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
              }}>🎯</div>
              <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>ATS Score Checker</span>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '8px 16px'
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: credits <= 3 ? '#ef4444' : '#10b981',
              boxShadow: `0 0 8px ${credits <= 3 ? '#ef4444' : '#10b981'}`
            }}/>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{credits} Credits</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 10 }}>

          {/* Header */}
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '20px', padding: '6px 16px', marginBottom: '20px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#a78bfa', letterSpacing: '0.1em' }}>POWERED BY AI</span>
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>
              Resume ATS Analyzer
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', maxWidth: '560px', margin: '0 auto', lineHeight: '1.6' }}>
              Upload your resume, paste a job description, and get your match score instantly — powered by AI.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="fade-up" style={{
              background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px', padding: '14px 20px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '10px',
              color: '#fca5a5', fontSize: '14px', fontWeight: '500'
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '32px' }}>
            
            {/* Input Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Step 1: Upload */}
              <div className="glass fade-up" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                  }}>1</div>
                  <div>
                    <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: 0 }}>Upload Your Resume</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, marginTop: '2px' }}>
                      Supports .txt files (PDF text extraction coming soon)
                    </p>
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={`dropzone${dragOver ? ' active' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                  />
                  {resumeFileName ? (
                    <div>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                      <p style={{ color: '#a78bfa', fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>{resumeFileName}</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                        {resumeText.length} characters extracted • Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: '16px', margin: '0 0 6px' }}>
                        Drop your resume here
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
                        or click to browse • .txt, .pdf
                      </p>
                    </div>
                  )}
                </div>

                {/* OR paste directly */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: '500' }}>OR PASTE TEXT</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                </div>

                <textarea
                  className="ats-textarea"
                  placeholder="Paste your resume text here (name, skills, experience, education, projects...)"
                  value={resumeText}
                  onChange={e => { setResumeText(e.target.value); if (e.target.value) setResumeFileName('') }}
                  rows={8}
                />
              </div>

              {/* Step 2: Job Description */}
              <div className="glass fade-up" style={{ padding: '28px', animationDelay: '0.1s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                  }}>2</div>
                  <div>
                    <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: 0 }}>Paste Job Description</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, marginTop: '2px' }}>
                      Copy & paste the full JD from any job portal
                    </p>
                  </div>
                </div>

                <textarea
                  className="ats-textarea"
                  placeholder="Paste job description here...&#10;&#10;e.g. We are looking for a Software Engineer with 2+ years of experience in React, Node.js, and cloud platforms like AWS..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  rows={8}
                />
              </div>

              {/* Analyze Button */}
              <button
                className="analyze-btn fade-up"
                style={{ animationDelay: '0.2s' }}
                onClick={handleAnalyze}
                disabled={analyzing || !resumeText.trim() || !jobDescription.trim()}
              >
                {analyzing ? (
                  <>
                    <span className="spinner" />
                    Analyzing with AI...
                  </>
                ) : (
                  '🎯 Analyze Match Score — 2 credits'
                )}
              </button>
            </div>

            {/* Results Column */}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Score Card */}
                <div className="glass fade-up" style={{ padding: '36px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', letterSpacing: '0.1em' }}>
                    YOUR ATS MATCH SCORE
                  </h2>
                  <AnimatedScore score={result.score} />
                </div>

                {/* Matched Keywords */}
                <div className="glass fade-up" style={{ padding: '28px', animationDelay: '0.15s' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>✅</span>
                    Matched Keywords
                    <span style={{
                      marginLeft: 'auto', background: 'rgba(16,185,129,0.2)',
                      border: '1px solid rgba(16,185,129,0.3)', color: '#34d399',
                      fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px'
                    }}>{result.matched_keywords.length} found</span>
                  </h3>
                  <div>
                    {result.matched_keywords.map((kw, i) => (
                      <span key={kw} className="kw-tag" style={{
                        background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399', animationDelay: `${i * 0.05}s`
                      }}>✓ {kw}</span>
                    ))}
                    {result.matched_keywords.length === 0 && (
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>No keywords matched.</p>
                    )}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="glass fade-up" style={{ padding: '28px', animationDelay: '0.2s' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>❌</span>
                    Missing Keywords
                    <span style={{
                      marginLeft: 'auto', background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)', color: '#f87171',
                      fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px'
                    }}>{result.missing_keywords.length} gaps</span>
                  </h3>
                  <div>
                    {result.missing_keywords.map((kw, i) => (
                      <span key={kw} className="kw-tag" style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#f87171', animationDelay: `${i * 0.05}s`
                      }}>✗ {kw}</span>
                    ))}
                    {result.missing_keywords.length === 0 && (
                      <p style={{ color: '#34d399', fontSize: '14px', margin: 0 }}>🎉 No missing keywords!</p>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="glass fade-up" style={{ padding: '28px', animationDelay: '0.25s' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>💡</span> AI Improvement Tips
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.suggestions.map((tip, i) => (
                      <div key={i} className="fade-up" style={{
                        display: 'flex', gap: '14px', alignItems: 'flex-start',
                        background: 'rgba(124, 58, 237, 0.06)',
                        border: '1px solid rgba(124, 58, 237, 0.15)',
                        borderRadius: '12px', padding: '14px 16px',
                        animationDelay: `${0.3 + i * 0.07}s`
                      }}>
                        <div className="tip-bar" />
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Re-analyze CTA */}
                <button
                  className="analyze-btn fade-up"
                  style={{ animationDelay: '0.4s', background: 'rgba(255,255,255,0.08)', boxShadow: 'none' }}
                  onClick={() => { setResult(null); setResumeText(''); setResumeFileName(''); setJobDescription('') }}
                >
                  🔄 Start Fresh Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
