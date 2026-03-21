'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  { icon: '📄', text: 'Review my resume for TCS application', category: 'Resume' },
  { icon: '🎯', text: 'How to introduce myself in an interview?', category: 'Interview' },
  { icon: '💰', text: 'How to negotiate salary as a fresher?', category: 'Salary' },
  { icon: '🏢', text: 'What does TCS look for in candidates?', category: 'Company' },
  { icon: '📝', text: 'Write a cover letter for Infosys', category: 'Resume' },
  { icon: '💡', text: 'What skills should I learn for placement?', category: 'Career' },
  { icon: '🧠', text: 'Explain STAR method with examples', category: 'Interview' },
  { icon: '📊', text: 'What is a good CGPA for campus placement?', category: 'Career' },
]

const QUICK_TOPICS = [
  { label: 'Resume Tips', color: '#2563eb', bg: '#eff6ff' },
  { label: 'Interview Prep', color: '#7c3aed', bg: '#faf5ff' },
  { label: 'Salary Guide', color: '#059669', bg: '#ecfdf5' },
  { label: 'Company Info', color: '#d97706', bg: '#fffbeb' },
  { label: 'Career Advice', color: '#dc2626', bg: '#fef2f2' },
]

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [plan, setPlan] = useState('')
  const [chatCostPerMsg, setChatCostPerMsg] = useState(1)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setUserId(user.id)
        const { data } = await supabase.from('subscriptions').select('credits_remaining, plan').eq('user_id', user.id).single()
        if (data) {
          setCredits(data.credits_remaining)
          setPlan(data.plan)
        }
        // Try to load chat credit cost from admin config table
        try {
          const cfgRes = await fetch('/api/admin/feature-costs?feature=ai_chat')
          if (cfgRes.ok) {
            const cfg = await cfgRes.json()
            if (cfg?.cost !== undefined) setChatCostPerMsg(cfg.cost)
          }
        } catch {}
      }
    }
    getUser()

    // Welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hey there! 👋 I'm your **AI Placement Coach**, powered by Claude AI.

I can help you with:
- 📄 **Resume writing** — ATS-optimized for Indian companies
- 🎯 **Interview prep** — TCS, Infosys, Wipro, Amazon & more
- 💰 **Salary negotiation** — Get the best offer
- 🏢 **Company research** — Know before you apply
- 💡 **Career guidance** — Plan your path forward

What would you like to work on today?`,
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || loading) return

    // Credit gate
    const unlimited = credits !== null && credits >= 999999
    if (!unlimited && credits !== null && credits < chatCostPerMsg) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        content: `⚠️ You're out of credits! Each AI Chat message costs **${chatCostPerMsg} credit**. [Upgrade your plan](/billing) to get more credits and keep chatting.`,
        timestamp: new Date()
      }])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setShowSuggestions(false)

    try {
      const conversationHistory = [...messages, userMessage]
        .filter(m => m.id !== '1')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          userContext: user?.email || 'Indian student seeking placement'
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Deduct credits after successful response
      if (userId && credits !== null && credits < 999999) {
        const newCredits = Math.max(0, credits - chatCostPerMsg)
        setCredits(newCredits)
        supabase.from('subscriptions').update({ credits_remaining: newCredits }).eq('user_id', userId)
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again! 🔄',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/•/g, '&bull;')
  }

  const filteredSuggestions = activeFilter === 'All'
    ? SUGGESTED_QUESTIONS
    : SUGGESTED_QUESTIONS.filter(q => q.category === activeFilter)

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex', flexDirection: 'column' as const
    }}>

      {/* Top Bar */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px', flexShrink: 0
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          height: '60px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{
              textDecoration: 'none', display: 'flex',
              alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px'
            }}>
              ← Back
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px'
              }}>🤖</div>
              <div>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '14px', lineHeight: '1' }}>
                  AI Placement Coach
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80'
                  }} />
                  <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: '600' }}>
                    Online • Powered by Claude AI
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Credits Display */}
            {credits !== null && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: credits <= 2 && credits < 999999 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${credits <= 2 && credits < 999999 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '6px 14px'
              }}>
                <span style={{ fontSize: '13px' }}>🪙</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: credits <= 2 && credits < 999999 ? '#fca5a5' : '#e2e8f0' }}>
                  {credits >= 999999 ? 'Unlimited' : credits} credits
                </span>
                {credits < 999999 && <span style={{ color: '#64748b', fontSize: '11px' }}>• {chatCostPerMsg}/msg</span>}
              </div>
            )}
            <button
              onClick={() => {
                setMessages([{
                  id: '1', role: 'assistant',
                  content: 'Hey there! 👋 Chat cleared. How can I help you today?',
                  timestamp: new Date()
                }])
                setShowSuggestions(true)
              }}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', color: '#64748b',
                fontSize: '12px', cursor: 'pointer'
              }}
            >
              Clear Chat
            </button>
            <Link href="/resume" style={{
              padding: '7px 14px', borderRadius: '8px',
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(37,99,235,0.25)',
              textDecoration: 'none', color: '#93c5fd', fontSize: '12px', fontWeight: '600'
            }}>
              Build Resume →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div style={{
        flex: 1, maxWidth: '1200px', margin: '0 auto',
        width: '100%', display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '0', overflow: 'hidden',
        height: 'calc(100vh - 60px)'
      }}>

        {/* Left Sidebar */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 16px', overflowY: 'auto' as const
        }}>

          {/* AI Info Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
            border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: '14px', padding: '16px', marginBottom: '24px'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎯</div>
            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
              Your Personal Career Coach
            </h3>
            <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.6' }}>
              Ask anything about placement, resumes, interviews and career growth.
            </p>
          </div>

          {/* Quick Topics */}
          <p style={{
            fontSize: '11px', fontWeight: '700', color: '#334155',
            letterSpacing: '0.08em', marginBottom: '10px'
          }}>QUICK TOPICS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
            {QUICK_TOPICS.map((topic, i) => (
              <button key={i}
                onClick={() => sendMessage(`Tell me about ${topic.label.toLowerCase()} for Indian job market`)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none',
                  background: topic.bg, color: topic.color,
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Capabilities */}
          <p style={{
            fontSize: '11px', fontWeight: '700', color: '#334155',
            letterSpacing: '0.08em', marginBottom: '10px'
          }}>WHAT I CAN DO</p>
          {[
            { icon: '📄', label: 'Write & improve resumes' },
            { icon: '🎤', label: 'Mock interview coaching' },
            { icon: '🏢', label: 'Company-specific tips' },
            { icon: '💰', label: 'Salary negotiation' },
            { icon: '📋', label: 'Cover letter writing' },
            { icon: '🗺️', label: 'Career roadmap planning' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', alignItems: 'center',
              padding: '8px 10px', borderRadius: '8px',
              marginBottom: '2px'
            }}>
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</span>
            </div>
          ))}

          {/* Tip of the day */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '14px', marginTop: '20px'
          }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#d97706', marginBottom: '6px', letterSpacing: '0.08em' }}>
              💡 PRO TIP
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
              Be specific in your questions. Instead of "help with resume", try "improve my software engineer resume for TCS with 2 projects".
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto' as const, padding: '24px 28px' }}>

            {messages.map((message, index) => (
              <div key={message.id} style={{
                display: 'flex', gap: '12px',
                marginBottom: '20px',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row' as const
              }}>

                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: message.role === 'user'
                    ? 'linear-gradient(135deg, #2563eb, #1e40af)'
                    : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0
                }}>
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>

                {/* Bubble */}
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    background: message.role === 'user'
                      ? 'linear-gradient(135deg, #2563eb, #1e40af)'
                      : 'rgba(255,255,255,0.04)',
                    border: message.role === 'user'
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: message.role === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    padding: '14px 18px'
                  }}>
                    <div
                      style={{
                        color: message.role === 'user' ? 'white' : '#e2e8f0',
                        fontSize: '14px', lineHeight: '1.7'
                      }}
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                  </div>
                  <div style={{
                    fontSize: '11px', color: '#334155', marginTop: '4px',
                    textAlign: message.role === 'user' ? 'right' : 'left' as const
                  }}>
                    {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                }}>🤖</div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '14px 18px', display: 'flex', gap: '6px', alignItems: 'center'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#7c3aed',
                      animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {showSuggestions && messages.length <= 1 && (
              <div style={{ marginTop: '8px' }}>
                <p style={{
                  fontSize: '12px', color: '#334155',
                  fontWeight: '600', marginBottom: '14px', letterSpacing: '0.05em'
                }}>
                  SUGGESTED QUESTIONS
                </p>

                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' as const }}>
                  {['All', 'Resume', 'Interview', 'Salary', 'Company', 'Career'].map(f => (
                    <button key={f}
                      onClick={() => setActiveFilter(f)}
                      style={{
                        padding: '4px 12px', borderRadius: '9999px', border: 'none',
                        background: activeFilter === f ? '#2563eb' : 'rgba(255,255,255,0.05)',
                        color: activeFilter === f ? 'white' : '#64748b',
                        fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                      }}
                    >{f}</button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {filteredSuggestions.map((q, i) => (
                    <button key={i}
                      onClick={() => sendMessage(q.text)}
                      style={{
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                        padding: '12px 14px', borderRadius: '12px', border: 'none',
                        background: 'rgba(255,255,255,0.04)',
                        borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.06)',
                        cursor: 'pointer', textAlign: 'left' as const,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.1)'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.2)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                      }}
                    >
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{q.icon}</span>
                      <span style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.4' }}>{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px 24px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.2)'
          }}>

            {/* Quick action pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
              {['Review my resume', 'Interview tips for TCS', 'Salary for freshers', 'How to crack Infosys'].map((q, i) => (
                <button key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: '5px 12px', borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#64748b', fontSize: '12px', cursor: 'pointer'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Text Input */}
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-end',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '12px 16px'
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about placement, resume, interviews..."
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: 'white', fontSize: '14px', resize: 'none' as const,
                  outline: 'none', lineHeight: '1.5', maxHeight: '120px',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading || (credits !== null && credits < 999999 && credits < chatCostPerMsg)}
                style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                    : 'rgba(255,255,255,0.05)',
                  border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', flexShrink: 0, transition: 'all 0.2s'
                }}
              >
                {loading ? '⏳' : '➤'}
              </button>
            </div>

            <p style={{ color: '#1e293b', fontSize: '11px', textAlign: 'center' as const, marginTop: '8px' }}>
              Powered by Claude AI • Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}