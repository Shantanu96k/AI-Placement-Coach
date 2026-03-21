'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Types ───────────────────────────────────────────
interface Question {
  question: string
  model_answer: string
  key_points: string[]
}

interface FeedbackResult {
  score: number
  feedback: string
  better_answer: string
  strengths: string[]
  improvements: string[]
}

// ─── Constants ───────────────────────────────────────
const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'HCL',
  'Tech Mahindra', 'Cognizant', 'Capgemini',
  'Amazon', 'Google', 'Microsoft', 'Flipkart',
  'Deloitte', 'KPMG', 'General'
]

const ROLES = [
  'Software Engineer', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer',
  'Data Analyst', 'Data Scientist',
  'Business Analyst', 'Product Manager',
  'HR Executive', 'Sales Executive',
  'Marketing Executive', 'Finance Analyst'
]

const ROUNDS = [
  { value: 'Technical', label: '💻 Technical', desc: 'Coding & concepts' },
  { value: 'HR', label: '🤝 HR Round', desc: 'Behavioral questions' },
  { value: 'Aptitude', label: '🧮 Aptitude', desc: 'Logical & math' },
  { value: 'Mixed', label: '🎯 Mixed', desc: 'All types combined' }
]

// ─── Main Component ───────────────────────────────────
export default function InterviewPage() {
  const [userId, setUserId] = useState('')
  const [step, setStep] = useState<'setup' | 'questions' | 'practice' | 'complete'>('setup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Setup
  const [company, setCompany] = useState('TCS')
  const [role, setRole] = useState('Software Engineer')
  const [roundType, setRoundType] = useState('HR')

  // Questions
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionId, setSessionId] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Practice
  const [currentQ, setCurrentQ] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<{
    question: string
    answer: string
    feedback: FeedbackResult
  }[]>([])

  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUserId(user.id)
      } catch (err) {
        console.error(err)
      }
    }
    getUser()
  }, [router])

  const handleGenerate = async (mode: 'questions' | 'practice') => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, company, role, roundType })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate questions.')
        return
      }

      setQuestions(data.questions)
      setSessionId(data.sessionId)
      setCurrentQ(0)
      setUserAnswer('')
      setFeedback(null)
      setAnsweredQuestions([])
      setStep(mode)

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please write your answer first.')
      return
    }

    setFeedbackLoading(true)
    setError('')

    try {
      const res = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: questions[currentQ].question,
          userAnswer,
          role,
          sessionId
        })
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      setFeedback(data)
      setAnsweredQuestions(prev => [
        ...prev,
        { question: questions[currentQ].question, answer: userAnswer, feedback: data }
      ])

    } catch {
      setError('Feedback failed. Please try again.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleNext = () => {
    if (currentQ >= questions.length - 1) {
      setStep('complete')
    } else {
      setCurrentQ(prev => prev + 1)
      setUserAnswer('')
      setFeedback(null)
      setError('')
    }
  }

  const avgScore = answeredQuestions.length > 0
    ? Math.round(
        answeredQuestions.reduce((s, q) => s + q.feedback.score, 0) /
        answeredQuestions.length * 10
      )
    : 0

  return (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .fade-up {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .slide-in-right {
          animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.05);
          border-radius: 20px;
        }
        
        .animated-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .animated-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.2);
        }
        .animated-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        
        .selectable-btn {
          transition: all 0.2s ease;
        }
        .selectable-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .accordion-content {
          overflow: hidden;
          transition: max-height 0.4s ease-in-out, opacity 0.4s ease-in-out;
        }
        
        .feedback-glow {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        }
        
        textarea.focus-glow:focus {
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15) !important;
        }
        
        .pulse-dot {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden'
      }}>
        
        {/* Dynamic Background */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

        {/* ── SETUP VIEW ──────────────────────────────────── */}
        {step === 'setup' && (
          <div className="fade-up" style={{ position: 'relative', zIndex: 10 }}>
            <nav style={{
              background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
              padding: '16px 32px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Link href="/dashboard" className="animated-btn" style={{
                color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '600'
              }}>← Back to Dashboard</Link>
              <span style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: 'white',
                fontSize: '13px', fontWeight: '600', padding: '6px 16px', borderRadius: '9999px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}>🎯 Interview Coach</span>
            </nav>

            <main style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ animation: 'float 4s ease-in-out infinite', fontSize: '56px', marginBottom: '16px' }}>🎯</div>
                <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', marginBottom: '12px', letterSpacing: '-1px' }}>
                  AI Interview Coach
                </h1>
                <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500', maxWidth: '400px', margin: '0 auto' }}>
                  Generate targeted Q&A banks and practice mock interviews tailored to your exact role.
                </p>
              </div>

              {error && (
                <div className="fade-up" style={{
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                  padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: '500'
                }}>⚠️ {error}</div>
              )}

              <div className="glass-panel delay-1" style={{ padding: '32px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  🏢 Select Company
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {COMPANIES.map(c => (
                    <button key={c} onClick={() => setCompany(c)} className="selectable-btn" style={{
                      padding: '10px 20px', borderRadius: '10px', fontSize: '14px',
                      fontWeight: '600', cursor: 'pointer',
                      border: company === c ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: company === c ? '#eef2ff' : 'white',
                      color: company === c ? '#4f46e5' : '#475569'
                    }}>{c}</button>
                  ))}
                </div>
              </div>

              <div className="glass-panel delay-2" style={{ padding: '32px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    👤 Target Role
                  </h2>
                  <select value={role} onChange={e => setRole(e.target.value)} style={{
                    width: '100%', border: '1px solid #cbd5e1', borderRadius: '12px',
                    padding: '14px 16px', fontSize: '15px', background: 'white',
                    outline: 'none', fontWeight: '500', color: '#1e293b',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🎯 Interview Round
                  </h2>
                  <select value={roundType} onChange={e => setRoundType(e.target.value)} style={{
                    width: '100%', border: '1px solid #cbd5e1', borderRadius: '12px',
                    padding: '14px 16px', fontSize: '15px', background: 'white',
                    outline: 'none', fontWeight: '500', color: '#1e293b',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {ROUNDS.map(r => <option key={r.value} value={r.value}>{r.label} ({r.desc})</option>)}
                  </select>
                </div>
              </div>

              <div className="fade-up delay-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button onClick={() => handleGenerate('questions')}
                  disabled={loading} className="animated-btn"
                  style={{
                    background: loading ? '#94a3b8' : 'white',
                    color: loading ? 'white' : '#4f46e5', padding: '16px', borderRadius: '16px',
                    border: '2px solid #6366f1', fontSize: '16px', fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                  }}>
                  {loading ? '⏳ Generating...' : '📚 Study Q&A Bank'}
                </button>
                <button onClick={() => handleGenerate('practice')}
                  disabled={loading} className="animated-btn"
                  style={{
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    color: 'white', padding: '16px', borderRadius: '16px',
                    border: 'none', fontSize: '16px', fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                  }}>
                  {loading ? '⏳ Generating...' : '🎤 Start Mock Interview'}
                </button>
              </div>
            </main>
          </div>
        )}

        {/* ── Q&A BANK VIEW ───────────────────────────────── */}
        {step === 'questions' && (
          <div className="fade-up" style={{ position: 'relative', zIndex: 10 }}>
            <nav style={{
              background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)',
              borderBottom: '1px solid #e2e8f0', padding: '16px 32px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, zIndex: 50
            }}>
              <button className="animated-btn" onClick={() => setStep('setup')} style={{
                color: '#64748b', background: 'none', border: 'none',
                fontSize: '14px', cursor: 'pointer', fontWeight: '600'
              }}>← Settings</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                  {company} · {role} · {roundType}
                </span>
                <button className="animated-btn" onClick={() => {
                  setCurrentQ(0); setUserAnswer('')
                  setFeedback(null); setAnsweredQuestions([])
                  setStep('practice')
                }} style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white',
                  padding: '8px 20px', borderRadius: '10px', border: 'none',
                  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}>
                  🎤 Practice Now
                </button>
              </div>
            </nav>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', letterSpacing: '-1px' }}>
                  Interview Study Guide
                </h1>
                <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
                  Review these {questions.length} high-probability questions to prepare for your interview.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions.map((q, index) => (
                  <div key={index} className="fade-up" style={{
                    animationDelay: `${index * 0.05}s`,
                    background: 'white', borderRadius: '16px',
                    border: '1px solid #e2e8f0', overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}>
                    <button onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '24px', background: expandedIndex === index ? '#f8fafc' : 'white',
                        border: 'none', cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px',
                        transition: 'background 0.2s ease'
                      }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <span style={{
                          background: expandedIndex === index ? '#4f46e5' : '#eef2ff',
                          color: expandedIndex === index ? 'white' : '#4f46e5',
                          fontSize: '13px', fontWeight: '800',
                          width: '32px', height: '32px', borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          transition: 'all 0.3s ease'
                        }}>{index + 1}</span>
                        <p style={{ color: '#1e293b', fontWeight: '600', fontSize: '16px', lineHeight: '1.5', marginTop: '4px' }}>
                          {q.question}
                        </p>
                      </div>
                      <span style={{
                        color: '#94a3b8', transition: 'transform 0.3s ease',
                        transform: expandedIndex === index ? 'rotate(180deg)' : 'rotate(0)'
                      }}>
                        ▼
                      </span>
                    </button>

                    {expandedIndex === index && (
                      <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        <div className="slide-in-right" style={{
                          background: '#f0fdf4', border: '1px solid #bbf7d0',
                          borderRadius: '12px', padding: '20px', marginTop: '20px'
                        }}>
                          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#166534', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <span style={{ fontSize: '16px' }}>⭐</span> Model Answer
                          </p>
                          <p style={{ color: '#334155', fontSize: '15px', lineHeight: '1.7', fontWeight: '500' }}>
                            {q.model_answer}
                          </p>
                        </div>
                        <div className="fade-up delay-1" style={{ marginTop: '20px' }}>
                          <p style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            💡 Key Points to Hit
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.key_points.map((point, i) => (
                              <div key={i} style={{
                                display: 'flex', gap: '12px', alignItems: 'flex-start',
                                fontSize: '14px', color: '#475569', fontWeight: '500',
                                background: 'white', padding: '12px 16px', borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                              }}>
                                <span style={{ color: '#6366f1', fontWeight: 'bold' }}>✓</span>
                                {point}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </main>
          </div>
        )}

        {/* ── MOCK INTERVIEW VIEW ─────────────────────────── */}
        {step === 'practice' && (
          <div className="fade-up" style={{ position: 'relative', zIndex: 10, minHeight: '100vh', background: '#0f172a' /* Dark focus mode */ }}>
            <nav style={{
              background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '20px 32px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <button className="animated-btn" onClick={() => setStep('questions')} style={{
                color: '#94a3b8', background: 'none', border: 'none',
                fontSize: '14px', cursor: 'pointer', fontWeight: '600'
              }}>✕ End Session</button>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '9999px' }}>
                {questions.map((_, i) => (
                  <div key={i} style={{
                    width: '32px', height: '4px', borderRadius: '2px',
                    background: i < currentQ ? '#10b981' : i === currentQ ? '#6366f1' : '#334155',
                    transition: 'all 0.3s ease'
                  }}/>
                ))}
                <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '700', marginLeft: '8px' }}>
                  {currentQ + 1} / {questions.length}
                </span>
              </div>
            </nav>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
                {[company, role, roundType].map(badge => (
                  <span key={badge} style={{
                    background: 'rgba(255,255,255,0.1)', color: '#f8fafc',
                    fontSize: '12px', fontWeight: '600',
                    padding: '6px 12px', borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>{badge}</span>
                ))}
              </div>

              {/* Question Card */}
              <div className="scale-in" style={{
                background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
                padding: '40px', marginBottom: '24px',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', textAlign: 'center'
              }}>
                <div style={{ display: 'inline-block', background: '#1e293b', color: '#6366f1', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', marginBottom: '24px', letterSpacing: '1px' }}>
                  QUESTION {currentQ + 1}
                </div>
                <p style={{ color: '#f8fafc', fontWeight: '700', fontSize: '24px', lineHeight: '1.4', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {questions[currentQ]?.question}
                </p>
              </div>

              {error && (
                <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>{error}</div>
              )}

              {/* Answer Area */}
              {!feedback && (
                 <div className="fade-up delay-1">
                  <textarea
                    className="focus-glow"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    placeholder="Type your response here. Aim for structure (e.g., STAR method)..."
                    rows={8}
                    style={{
                      width: '100%', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '20px', padding: '24px', background: 'rgba(30,41,59,0.8)',
                      fontSize: '16px', outline: 'none', color: '#f8fafc',
                      resize: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit', lineHeight: '1.7',
                      transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button onClick={handleSubmitAnswer}
                      disabled={feedbackLoading || !userAnswer.trim()}
                      className="animated-btn"
                      style={{
                        background: feedbackLoading ? '#475569' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white', padding: '16px 32px', borderRadius: '14px',
                        border: 'none', fontSize: '16px', fontWeight: '700',
                        cursor: feedbackLoading ? 'not-allowed' : 'pointer',
                        boxShadow: feedbackLoading ? 'none' : '0 8px 16px rgba(16, 185, 129, 0.3)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                      {feedbackLoading ? <span className="pulse-dot">Analyzing...</span> : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback Area */}
              {feedback && (
                <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Score & General Feedback */}
                  <div style={{
                    background: 'rgba(30,41,59,0.9)', borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '32px',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    {feedback.score >= 8 && <div style={{ position: 'absolute', top: '-50px', right: '-50px', background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(255,255,255,0) 70%)', width: '200px', height: '200px', filter: 'blur(30px)' }}/>}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div>
                        <h3 style={{ fontWeight: '800', color: '#f8fafc', fontSize: '18px', marginBottom: '8px' }}>🤖 AI Evaluation</h3>
                        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px' }}>{feedback.feedback}</p>
                      </div>
                      <div style={{
                        background: feedback.score >= 8 ? '#064e3b' : feedback.score >= 5 ? '#78350f' : '#7f1d1d',
                        border: `2px solid ${feedback.score >= 8 ? '#10b981' : feedback.score >= 5 ? '#f59e0b' : '#ef4444'}`,
                        padding: '16px', borderRadius: '20px', textAlign: 'center', minWidth: '80px', flexShrink: 0
                      }}>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>Score</div>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>{feedback.score}<span style={{fontSize: '16px', color: '#94a3b8'}}>/10</span></div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '16px', padding: '20px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '800', color: '#34d399', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ Strengths</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {feedback.strengths.length > 0 ? feedback.strengths.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>
                              <span style={{ color: '#10b981' }}>+</span> <span>{s}</span>
                            </div>
                          )) : <div style={{ color: '#94a3b8', fontSize: '14px' }}>None identified.</div>}
                        </div>
                      </div>
                      
                      <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '16px', padding: '20px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '800', color: '#fbbf24', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>📈 Areas to Improve</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {feedback.improvements.length > 0 ? feedback.improvements.map((imp, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>
                              <span style={{ color: '#f59e0b' }}>→</span> <span>{imp}</span>
                            </div>
                          )) : <div style={{ color: '#94a3b8', fontSize: '14px' }}>Perfect answer!</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="slide-in-right delay-2" style={{
                    background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(99,102,241,0.05) 100%)',
                    border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px', padding: '32px'
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#818cf8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>✨</span> How to say it better
                    </p>
                    <p style={{ color: '#f8fafc', fontSize: '15px', lineHeight: '1.7', fontWeight: '500' }}>
                      {feedback.better_answer}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button onClick={handleNext} className="animated-btn" style={{
                      background: 'white', color: '#0f172a',
                      padding: '16px 32px', borderRadius: '14px', border: 'none',
                      fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 8px 16px rgba(255,255,255,0.1)'
                    }}>
                      {currentQ >= questions.length - 1 ? '🏁 Finish Session' : 'Next Question →'}
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {/* ── COMPLETE VIEW ───────────────────────────────── */}
        {step === 'complete' && (
          <div className="fade-up" style={{ position: 'relative', zIndex: 10 }}>
            <nav style={{ padding: '24px 32px' }}>
              <Link href="/dashboard" className="animated-btn" style={{
                color: '#64748b', textDecoration: 'none', fontSize: '15px', fontWeight: '600',
                background: 'white', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>← Dashboard</Link>
            </nav>

            <main style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 24px 60px', textAlign: 'center' }}>
              
              <div className="scale-in" style={{
                background: 'white', borderRadius: '32px', padding: '48px 32px',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)', marginBottom: '32px'
              }}>
                <div style={{ fontSize: '72px', marginBottom: '24px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }}>
                  {avgScore >= 80 ? '🏆' : avgScore >= 60 ? '💪' : '📚'}
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                   Interview Complete!
                </h1>
                <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
                  You answered {answeredQuestions.length} questions. Here's your average score:
                </p>
                
                <div style={{
                  fontSize: '80px', fontWeight: '900', margin: '32px 0',
                  color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444',
                  background: `linear-gradient(135deg, ${avgScore >= 80 ? '#34d399, #059669' : avgScore >= 60 ? '#fbbf24, #d97706' : '#f87171, #dc2626'})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {avgScore}%
                </div>
                
                <p style={{ color: '#334155', fontSize: '18px', fontWeight: '600', background: '#f1f5f9', padding: '16px', borderRadius: '16px', display: 'inline-block' }}>
                  {avgScore >= 80 ? '🎉 Outstanding! You are ready to ace this interview.'
                    : avgScore >= 60 ? '💡 Good effort! A bit more practice and you will be perfect.'
                    : '📚 Keep practicing! Focus on structuring your answers.'}
                </p>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '24px', textAlign: 'left' }}>
                Performance Review
              </h2>

              <div style={{ textAlign: 'left', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {answeredQuestions.map((item, i) => (
                  <div key={i} className="fade-up" style={{
                    animationDelay: `${i * 0.1}s`,
                    background: 'white', borderRadius: '20px',
                    border: '1px solid #e2e8f0', padding: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                      <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px', lineHeight: '1.5' }}>
                        <span style={{ color: '#6366f1', marginRight: '8px' }}>Q{i + 1}.</span> {item.question}
                      </p>
                      <div style={{
                        background: item.feedback.score >= 8 ? '#dcfce7' : item.feedback.score >= 5 ? '#fef3c7' : '#fee2e2',
                        color: item.feedback.score >= 8 ? '#059669' : item.feedback.score >= 5 ? '#d97706' : '#dc2626',
                        fontWeight: '800', fontSize: '16px', padding: '6px 16px', borderRadius: '12px', flexShrink: 0
                      }}>
                        {item.feedback.score}/10
                      </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Your Answer Snippet</p>
                      <p style={{ color: '#475569', fontSize: '14px', fontStyle: 'italic', fontWeight: '500' }}>
                        "{item.answer.substring(0, 100)}..."
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button onClick={() => {
                  setStep('setup')
                  setQuestions([])
                  setAnsweredQuestions([])
                  setCurrentQ(0)
                  setFeedback(null)
                }} className="animated-btn" style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: 'white', padding: '16px',
                  borderRadius: '16px', border: 'none', fontSize: '16px',
                  fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
                }}>
                  🔄 Practice Again
                </button>
                <Link href="/dashboard" className="animated-btn" style={{
                  background: 'white', color: '#1e293b', padding: '16px',
                  borderRadius: '16px', border: '1px solid #e2e8f0', textDecoration: 'none',
                  fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  Return to Dashboard
                </Link>
              </div>
            </main>
          </div>
        )}
      </div>
    </>
  )
}