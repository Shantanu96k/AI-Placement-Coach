'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

const COMPANIES = ['TCS/Infosys/Wipro', 'Amazon/Google/Microsoft', 'HR Round', 'Behavioral (STAR)']
const ROUNDS: Record<string, string[]> = {
  'TCS/Infosys/Wipro': ['HR', 'Technical', 'Aptitude'],
  'Amazon/Google/Microsoft': ['Behavioral', 'Technical'],
  'HR Round': ['HR'],
  'Behavioral (STAR)': ['Behavioral']
}
const QUESTION_COUNTS = [5, 8, 10]

type Phase = 'setup' | 'ready' | 'listening' | 'processing' | 'feedback' | 'complete'

interface QuestionResult {
  question: string
  transcript: string
  duration: number
  analysis: any
  meta: any
}

export default function VoiceMockInterview() {
  // Setup
  const [company, setCompany] = useState('TCS/Infosys/Wipro')
  const [round, setRound] = useState('HR')
  const [questionCount, setQuestionCount] = useState(5)
  const [phase, setPhase] = useState<Phase>('setup')

  // Interview state
  const [questions, setQuestions] = useState<string[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [error, setError] = useState('')

  // Refs
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const startTimeRef = useRef<number>(0)
  const fullTranscriptRef = useRef('')
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
      if (timerRef.current) clearInterval(timerRef.current)
      if (synthRef.current) synthRef.current.cancel()
    }
  }, [])

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) { onEnd?.(); return }
    synthRef.current.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.9
    utter.pitch = 1
    utter.volume = 1
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Female') || v.lang === 'en-IN')
    if (preferred) utter.voice = preferred
    utter.onend = () => { setAiSpeaking(false); onEnd?.() }
    utter.onerror = () => { setAiSpeaking(false); onEnd?.() }
    setAiSpeaking(true)
    synthRef.current.speak(utter)
  }, [])

  const startInterview = async () => {
    setError('')
    setPhase('ready')
    try {
      const res = await fetch('/api/interview/voice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, round, count: questionCount })
      })
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions)
        setCurrentQ(0)
        setResults([])
        // Speak intro
        speakText(`Welcome to your ${company} ${round} round mock interview. I will ask you ${data.questions.length} questions. Speak clearly and confidently. Let's begin with question 1.`, () => {
          setTimeout(() => askQuestion(data.questions, 0), 500)
        })
      }
    } catch (e) {
      setError('Failed to load questions. Check your connection.')
      setPhase('setup')
    }
  }

  const askQuestion = useCallback((qs: string[], index: number) => {
    if (index >= qs.length) { finishInterview(); return }
    setCurrentQ(index)
    setTranscript('')
    setInterimTranscript('')
    fullTranscriptRef.current = ''
    setCurrentAnalysis(null)
    setPhase('ready')
    const questionText = `Question ${index + 1}. ${qs[index]}`
    speakText(questionText, () => {
      setTimeout(() => startRecording(), 800)
    })
  }, [speakText])

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome browser.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsRecording(true)
      setPhase('listening')
      startTimeRef.current = Date.now()
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    }

    recognition.onresult = (event: any) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) final += text + ' '
        else interim += text
      }
      if (final) {
        fullTranscriptRef.current += final
        setTranscript(fullTranscriptRef.current)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') setError(`Mic error: ${event.error}`)
    }

    recognition.onend = () => {
      if (isRecording) recognition.start() // keep alive
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)

    const finalTranscript = fullTranscriptRef.current + interimTranscript
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const wordCount = finalTranscript.trim().split(/\s+/).filter(Boolean).length

    if (!finalTranscript.trim() || wordCount < 3) {
      setError('No speech detected. Please speak louder or check your microphone.')
      setPhase('ready')
      return
    }

    setTranscript(finalTranscript)
    setInterimTranscript('')
    setPhase('processing')
    speakText('Got it. Analyzing your response now.')

    try {
      const res = await fetch('/api/interview/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questions[currentQ],
          transcript: finalTranscript,
          duration, wordCount, company, round
        })
      })
      const data = await res.json()
      if (data.success) {
        setCurrentAnalysis(data)
        setResults(prev => [...prev, {
          question: questions[currentQ],
          transcript: finalTranscript,
          duration, analysis: data.analysis, meta: data.meta
        }])
        setPhase('feedback')
        // Speak feedback summary
        const score = data.analysis.scores.overall
        const verdict = data.analysis.overallVerdict
        speakText(`${verdict}! Your overall score is ${score} out of 100. ${data.analysis.encouragement}`)
      } else {
        setError(data.error || 'Analysis failed')
        setPhase('listening')
      }
    } catch (e) {
      setError('Analysis failed. Please try again.')
      setPhase('ready')
    }
  }

  const nextQuestion = () => {
    const next = currentQ + 1
    if (next >= questions.length) {
      finishInterview()
    } else {
      askQuestion(questions, next)
    }
  }

  const finishInterview = () => {
    if (synthRef.current) synthRef.current.cancel()
    setPhase('complete')
    const avgScore = results.length > 0
      ? Math.round(results.reduce((a, r) => a + r.analysis.scores.overall, 0) / results.length)
      : 0
    speakText(`Congratulations! You have completed your mock interview. Your average score is ${avgScore} out of 100. Keep practicing and you will ace the real interview!`)
  }

  const resetInterview = () => {
    if (synthRef.current) synthRef.current.cancel()
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop() }
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('setup')
    setQuestions([])
    setCurrentQ(0)
    setTranscript('')
    setInterimTranscript('')
    setIsRecording(false)
    setRecordingTime(0)
    setResults([])
    setCurrentAnalysis(null)
    setError('')
  }

  const avgScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + r.analysis.scores.overall, 0) / results.length)
    : 0

  const scoreColor = (s: number) => s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171'
  const scoreLabel = (s: number) => s >= 80 ? 'Excellent' : s >= 70 ? 'Good' : s >= 55 ? 'Average' : 'Needs Work'

  const s: any = {
    page: { minHeight: '100vh', background: '#0a0f1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: 'white', padding: '0 0 60px' },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '0 20px' },
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' },
    btn: (color = '#2563eb', disabled = false) => ({ padding: '14px 28px', background: disabled ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${color}, ${color}dd)`, border: 'none', borderRadius: '12px', color: disabled ? '#334155' : 'white', fontSize: '15px', fontWeight: '700', cursor: disabled ? 'not-allowed' : 'pointer' }),
    label: { color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
    inp: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const },
  }

  // ── SETUP SCREEN ─────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={s.page}>
      {/* Nav */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 0', marginBottom: '40px' }}>
        <div style={{ ...s.container, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</Link>
          <span style={{ color: '#1e293b' }}>|</span>
          <span style={{ color: 'white', fontWeight: '700' }}>🎤 Voice Mock Interview</span>
        </div>
      </div>

      <div style={s.container}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🎤</div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Voice Mock Interview
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>
            Practice speaking out loud. Our AI analyzes your <strong style={{ color: 'white' }}>tone, confidence, clarity, pace</strong> and gives real-time feedback.
          </p>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '48px' }}>
          {['🎯 Tone Analysis', '⏱ Speaking Pace', '🔤 Filler Words', '💬 Content Score', '👁 Body Language Tips', '🏆 Overall Rating'].map((f, i) => (
            <span key={i} style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.2)', color: '#93c5fd', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>{f}</span>
          ))}
        </div>

        {/* Setup Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
          <div style={s.card}>
            <h2 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>⚙️ Interview Settings</h2>

            <div style={{ marginBottom: '18px' }}>
              <label style={s.label}>Company Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {COMPANIES.map(c => (
                  <button key={c} onClick={() => { setCompany(c); setRound(ROUNDS[c][0]) }}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${company === c ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.06)'}`, background: company === c ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.02)', color: company === c ? '#93c5fd' : '#64748b', fontWeight: company === c ? '700' : '400', cursor: 'pointer', textAlign: 'left' as const, fontSize: '13px' }}>
                    {c === 'TCS/Infosys/Wipro' ? '🏢 ' : c === 'Amazon/Google/Microsoft' ? '🌐 ' : c === 'HR Round' ? '👤 ' : '⭐ '}{c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={s.label}>Round Type</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(ROUNDS[company] || []).map(r => (
                  <button key={r} onClick={() => setRound(r)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: round === r ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: round === r ? 'white' : '#64748b', fontWeight: round === r ? '700' : '400', cursor: 'pointer', fontSize: '13px' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={s.label}>Number of Questions</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {QUESTION_COUNTS.map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: questionCount === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: questionCount === n ? 'white' : '#64748b', fontWeight: questionCount === n ? '700' : '400', cursor: 'pointer', fontSize: '14px' }}>
                    {n} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Checklist */}
            <div style={s.card}>
              <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>✅ Before You Start</h3>
              {[
                { icon: '🎤', text: 'Microphone is connected and working' },
                { icon: '🔇', text: 'You are in a quiet environment' },
                { icon: '🌐', text: 'Using Chrome or Edge browser' },
                { icon: '💡', text: 'Speak clearly at normal pace' },
                { icon: '👤', text: 'Sit up straight, like a real interview' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', padding: '18px' }}>
              <h3 style={{ color: '#93c5fd', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>📋 Your Session</h3>
              <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                <p>🏢 <strong style={{ color: 'white' }}>{company}</strong></p>
                <p>🎯 <strong style={{ color: 'white' }}>{round} Round</strong></p>
                <p>❓ <strong style={{ color: 'white' }}>{questionCount} Questions</strong></p>
                <p>⏱ <strong style={{ color: 'white' }}>~{questionCount * 2} minutes</strong></p>
              </div>
            </div>

            <button onClick={startInterview} style={{ ...s.btn('#2563eb'), width: '100%', padding: '18px', fontSize: '16px' }}>
              🎤 Start Voice Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── COMPLETE SCREEN ──────────────────────────────────────────
  if (phase === 'complete') return (
    <div style={s.page}>
      <div style={{ ...s.container, paddingTop: '40px' }}>
        {/* Score Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(${scoreColor(avgScore)} ${avgScore}%, rgba(255,255,255,0.06) 0%)`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#0a0f1a', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: scoreColor(avgScore) }}>{avgScore}</span>
              <span style={{ color: '#64748b', fontSize: '10px' }}>/ 100</span>
            </div>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
            {avgScore >= 80 ? '🏆 Outstanding!' : avgScore >= 65 ? '👏 Well Done!' : avgScore >= 50 ? '📈 Good Effort!' : '💪 Keep Practicing!'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            You completed {results.length} questions · Average Score: <strong style={{ color: scoreColor(avgScore) }}>{avgScore}/100</strong>
          </p>
        </div>

        {/* Score Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {results.length > 0 && ['confidence', 'clarity', 'relevance', 'communication', 'pace'].map(key => {
            const avg = Math.round(results.reduce((a, r) => a + (r.analysis.scores[key] || 0), 0) / results.length)
            return (
              <div key={key} style={{ ...s.card, textAlign: 'center' as const, padding: '16px' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: scoreColor(avg), marginBottom: '4px' }}>{avg}</div>
                <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'capitalize' as const }}>{key}</div>
                <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${avg}%`, background: scoreColor(avg), borderRadius: '9999px' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Per Question Results */}
        <h2 style={{ color: 'white', fontWeight: '700', fontSize: '20px', marginBottom: '16px' }}>📋 Question-by-Question Review</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {results.map((result, i) => (
            <div key={i} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', marginBottom: '8px', display: 'inline-block' }}>Q{i + 1}</span>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>{result.question}</h3>
                </div>
                <div style={{ textAlign: 'center' as const, flexShrink: 0, marginLeft: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: scoreColor(result.analysis.scores.overall) }}>{result.analysis.scores.overall}</div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>/ 100</div>
                  <div style={{ color: scoreColor(result.analysis.scores.overall), fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>{result.analysis.overallVerdict}</div>
                </div>
              </div>

              {/* Transcript */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>YOUR ANSWER</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', fontStyle: 'italic' }}>"{result.transcript}"</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <span style={{ color: '#475569', fontSize: '11px' }}>⏱ {result.duration}s</span>
                  <span style={{ color: '#475569', fontSize: '11px' }}>💬 {result.meta.wordCount} words</span>
                  <span style={{ color: result.meta.wpm >= 120 && result.meta.wpm <= 160 ? '#4ade80' : '#fbbf24', fontSize: '11px' }}>🎙 {result.meta.wpm} WPM</span>
                  {result.meta.totalFillers > 0 && <span style={{ color: '#f87171', fontSize: '11px' }}>⚠️ {result.meta.totalFillers} fillers</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {/* Tone */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>TONE</p>
                  <p style={{ color: '#a78bfa', fontWeight: '700', fontSize: '13px' }}>{result.analysis.tone}</p>
                </div>
                {/* Pace */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>PACE</p>
                  <p style={{ color: result.analysis.paceAnalysis === 'Perfect' ? '#4ade80' : '#fbbf24', fontWeight: '700', fontSize: '13px' }}>{result.analysis.paceAnalysis}</p>
                </div>
                {/* Fillers */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>FILLER WORDS</p>
                  <p style={{ color: result.meta.totalFillers === 0 ? '#4ade80' : result.meta.totalFillers < 4 ? '#fbbf24' : '#f87171', fontWeight: '700', fontSize: '13px' }}>
                    {result.meta.totalFillers === 0 ? 'None ✅' : `${result.meta.totalFillers} found`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                {/* Strengths */}
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ color: '#4ade80', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>✅ STRENGTHS</p>
                  {result.analysis.strengths?.map((s: string, j: number) => (
                    <p key={j} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>• {s}</p>
                  ))}
                </div>
                {/* Improvements */}
                <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>🔧 IMPROVE</p>
                  {result.analysis.improvements?.map((s: string, j: number) => (
                    <p key={j} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>• {s}</p>
                  ))}
                </div>
              </div>

              {/* Better Answer */}
              <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                <p style={{ color: '#93c5fd', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>💡 MODEL ANSWER</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>{result.analysis.betterAnswer}</p>
              </div>

              {/* Eye contact tip */}
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '10px', padding: '10px 12px' }}>
                <p style={{ color: '#c4b5fd', fontSize: '12px' }}>👁 <strong>Body Language:</strong> {result.analysis.eyeContactTip}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={resetInterview} style={s.btn('#2563eb')}>🔄 Practice Again</button>
          <Link href="/dashboard" style={{ ...s.btn('#475569'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>← Dashboard</Link>
        </div>
      </div>
    </div>
  )

  // ── INTERVIEW SCREEN ─────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Top Bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', marginBottom: '32px' }}>
        <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={resetInterview} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>✕ Exit</button>
            <span style={{ color: '#1e293b' }}>|</span>
            <span style={{ color: 'white', fontWeight: '700' }}>{company} · {round} Round</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {questions.map((_, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < currentQ ? '#4ade80' : i === currentQ ? '#60a5fa' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
            ))}
            <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '8px' }}>{currentQ + 1}/{questions.length}</span>
          </div>
        </div>
      </div>

      <div style={s.container}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* AI Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: aiSpeaking ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.06)', border: '3px solid', borderColor: aiSpeaking ? '#60a5fa' : 'rgba(255,255,255,0.1)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', transition: 'all 0.3s', boxShadow: aiSpeaking ? '0 0 30px rgba(37,99,235,0.4)' : 'none' }}>
              🤖
            </div>
            <p style={{ color: aiSpeaking ? '#93c5fd' : '#475569', fontSize: '13px', fontWeight: aiSpeaking ? '600' : '400' }}>
              {aiSpeaking ? '🔊 AI Interviewer is speaking...' : phase === 'ready' ? 'Ready to ask question' : phase === 'listening' ? '🎤 Listening to you...' : phase === 'processing' ? '🧠 Analyzing your response...' : '📊 Review your feedback'}
            </p>
          </div>

          {/* Question Card */}
          {questions[currentQ] && (
            <div style={{ ...s.card, marginBottom: '24px', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(37,99,235,0.2)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>❓</div>
                <div>
                  <p style={{ color: '#93c5fd', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>QUESTION {currentQ + 1} OF {questions.length}</p>
                  <h2 style={{ color: 'white', fontWeight: '700', fontSize: '20px', lineHeight: '1.4' }}>{questions[currentQ]}</h2>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ color: '#fca5a5', fontSize: '13px' }}>⚠️ {error}</p>
            </div>
          )}

          {/* LISTENING STATE */}
          {phase === 'listening' && (
            <div>
              {/* Waveform Animation */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', height: '60px', marginBottom: '20px' }}>
                {[...Array(20)].map((_, i) => (
                  <div key={i} style={{
                    width: '4px', borderRadius: '2px',
                    background: 'linear-gradient(180deg, #60a5fa, #7c3aed)',
                    height: `${Math.random() * 48 + 8}px`,
                    animation: `wave 0.8s ease-in-out ${i * 0.04}s infinite alternate`,
                  }} />
                ))}
              </div>
              <style>{`@keyframes wave { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>

              {/* Recording Timer */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '9999px', padding: '8px 20px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                  <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
                  <span style={{ color: '#fca5a5', fontWeight: '700', fontSize: '16px' }}>
                    {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Recording</span>
                </div>
              </div>

              {/* Live Transcript */}
              <div style={{ ...s.card, marginBottom: '20px', minHeight: '80px' }}>
                <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>🎤 LIVE TRANSCRIPT</p>
                <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>
                  {transcript}
                  <span style={{ color: '#64748b' }}>{interimTranscript}</span>
                  {!transcript && !interimTranscript && <span style={{ color: '#334155' }}>Start speaking...</span>}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={stopRecording}
                  style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                  ⏹ Stop & Analyze Answer
                </button>
              </div>
              <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
                💡 Tip: Aim for 30–90 seconds. Click stop when done.
              </p>
            </div>
          )}

          {/* PROCESSING STATE */}
          {phase === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🧠</div>
              <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
              <h3 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Analyzing your response...</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Checking tone, pace, clarity, content & filler words</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                {['Tone', 'Pace', 'Clarity', 'Content', 'Fillers'].map((item, i) => (
                  <span key={i} style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.2)', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', animation: `fade 1.5s ease-in-out ${i * 0.3}s infinite alternate` }}>
                    {item}
                  </span>
                ))}
              </div>
              <style>{`@keyframes fade { from { opacity:0.3 } to { opacity:1 } }`}</style>
            </div>
          )}

          {/* READY STATE */}
          {phase === 'ready' && !aiSpeaking && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎤</div>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Waiting for question... or click to start recording manually</p>
              <button onClick={startRecording} style={s.btn('#2563eb')}>🎤 Start Recording</button>
            </div>
          )}

          {/* FEEDBACK STATE */}
          {phase === 'feedback' && currentAnalysis && (
            <div>
              {/* Score Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Overall', key: 'overall', icon: '🏆' },
                  { label: 'Confidence', key: 'confidence', icon: '💪' },
                  { label: 'Clarity', key: 'clarity', icon: '🔊' },
                  { label: 'Relevance', key: 'relevance', icon: '🎯' },
                  { label: 'Communication', key: 'communication', icon: '💬' },
                  { label: 'Pace', key: 'pace', icon: '⏱' },
                ].map(item => {
                  const score = currentAnalysis.analysis.scores[item.key] || 0
                  return (
                    <div key={item.key} style={{ ...s.card, padding: '14px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{item.icon}</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: scoreColor(score) }}>{score}</div>
                      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{item.label}</div>
                      <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${score}%`, background: scoreColor(score), borderRadius: '9999px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Stats Row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', padding: '8px 14px' }}>
                  <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '13px' }}>🎭 Tone: {currentAnalysis.analysis.tone}</span>
                </div>
                <div style={{ background: currentAnalysis.analysis.paceAnalysis === 'Perfect' ? 'rgba(22,163,74,0.15)' : 'rgba(217,119,6,0.15)', border: `1px solid ${currentAnalysis.analysis.paceAnalysis === 'Perfect' ? 'rgba(22,163,74,0.2)' : 'rgba(217,119,6,0.2)'}`, borderRadius: '10px', padding: '8px 14px' }}>
                  <span style={{ color: currentAnalysis.analysis.paceAnalysis === 'Perfect' ? '#4ade80' : '#fbbf24', fontWeight: '700', fontSize: '13px' }}>⏱ Pace: {currentAnalysis.analysis.paceAnalysis} ({currentAnalysis.meta.wpm} WPM)</span>
                </div>
                <div style={{ background: currentAnalysis.meta.totalFillers === 0 ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)', border: `1px solid ${currentAnalysis.meta.totalFillers === 0 ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`, borderRadius: '10px', padding: '8px 14px' }}>
                  <span style={{ color: currentAnalysis.meta.totalFillers === 0 ? '#4ade80' : '#fca5a5', fontWeight: '700', fontSize: '13px' }}>
                    {currentAnalysis.meta.totalFillers === 0 ? '✅ No filler words!' : `⚠️ ${currentAnalysis.meta.totalFillers} filler words`}
                  </span>
                </div>
              </div>

              {/* Filler Detail */}
              {Object.keys(currentAnalysis.meta.fillerCounts).length > 0 && (
                <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>⚠️ Filler Words Detected</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(currentAnalysis.meta.fillerCounts).map(([word, count]: [string, any]) => (
                      <span key={word} style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        "{word}" × {count}
                      </span>
                    ))}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>{currentAnalysis.analysis.fillerAnalysis}</p>
                </div>
              )}

              {/* Content Feedback */}
              <div style={{ ...s.card, marginBottom: '14px' }}>
                <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>💬 CONTENT FEEDBACK</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>{currentAnalysis.analysis.contentFeedback}</p>
              </div>

              {/* Improvements */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ color: '#4ade80', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>✅ WHAT YOU DID WELL</p>
                  {currentAnalysis.analysis.strengths?.map((s: string, i: number) => (
                    <p key={i} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>• {s}</p>
                  ))}
                </div>
                <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>🔧 AREAS TO IMPROVE</p>
                  {currentAnalysis.analysis.improvements?.map((s: string, i: number) => (
                    <p key={i} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>• {s}</p>
                  ))}
                </div>
              </div>

              {/* Body language + encouragement */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ color: '#c4b5fd', fontSize: '12px' }}>👁 <strong>Body Language Tip:</strong> {currentAnalysis.analysis.eyeContactTip}</p>
                </div>
                <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ color: '#93c5fd', fontSize: '12px' }}>✨ {currentAnalysis.analysis.encouragement}</p>
                </div>
              </div>

              {/* Next Button */}
              <button onClick={nextQuestion} style={{ ...s.btn('#059669'), width: '100%', padding: '16px', fontSize: '16px' }}>
                {currentQ + 1 >= questions.length ? '🏁 Finish Interview & See Results' : `➡️ Next Question (${currentQ + 2}/${questions.length})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}