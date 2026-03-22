'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const COMPANIES = ['TCS/Infosys/Wipro', 'Amazon/Google/Microsoft', 'HR Round', 'Behavioral (STAR)']
const ROUNDS: Record<string, string[]> = {
  'TCS/Infosys/Wipro': ['HR', 'Technical', 'Aptitude'],
  'Amazon/Google/Microsoft': ['Behavioral', 'Technical'],
  'HR Round': ['HR'],
  'Behavioral (STAR)': ['Behavioral']
}
const QUESTION_COUNTS = [5, 8, 10]

// ─────────────────────────────────────────────────────────────
// FREE LOCAL UTILITIES — Zero API cost
// ─────────────────────────────────────────────────────────────

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'basically', 'actually',
  'literally', 'so', 'right', 'okay', 'hmm', 'ah', 'er',
  'kind of', 'sort of', 'i mean', 'you see', 'well'
]

function detectFillersLocally(text: string) {
  const lower = text.toLowerCase()
  const counts: Record<string, number> = {}
  let total = 0
  FILLER_WORDS.forEach(word => {
    const escaped = word.replace(/\s+/g, '\\s+')
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    const m = lower.match(regex)
    if (m?.length) { counts[word] = m.length; total += m.length }
  })
  return { counts, total }
}

function calcWPM(wordCount: number, durationSeconds: number) {
  if (durationSeconds < 1) return { wpm: 0, label: 'N/A' }
  const wpm = Math.round((wordCount / durationSeconds) * 60)
  return { wpm, label: wpm < 100 ? 'Too Slow' : wpm > 170 ? 'Too Fast' : 'Perfect' }
}

function detectTone(text: string, fillerTotal: number, wpm: number) {
  if (fillerTotal > 6) return 'Nervous'
  if (wpm > 175) return 'Rushed'
  if (wpm < 85) return 'Hesitant'
  if (/\bi (have|built|developed|achieved|led|managed|successfully)\b/i.test(text)) return 'Confident'
  return 'Calm'
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type Phase = 'gate' | 'setup' | 'ready' | 'listening' | 'processing' | 'feedback' | 'complete'

interface AIAnalysis {
  scores: Record<'overall'|'confidence'|'clarity'|'relevance'|'communication'|'pace', number>
  strengths: string[]
  improvements: string[]
  contentFeedback: string
  betterAnswer: string
  eyeContactTip: string
  encouragement: string
  overallVerdict: string
  fillerAnalysis: string
  paceAnalysis: string
}

interface QuestionResult {
  question: string; transcript: string; duration: number
  wpm: number; wpmLabel: string; wordCount: number
  fillerCounts: Record<string, number>; totalFillers: number; tone: string
  analysis: AIAnalysis
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function VoiceMockInterview() {
  const [plan, setPlan] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [planLoading, setPlanLoading] = useState(true)

  const [company, setCompany] = useState('TCS/Infosys/Wipro')
  const [round, setRound] = useState('HR')
  const [questionCount, setQuestionCount] = useState(5)
  const [phase, setPhase] = useState<Phase>('gate')

  const [questions, setQuestions] = useState<string[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [currentResult, setCurrentResult] = useState<QuestionResult | null>(null)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [error, setError] = useState('')
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const startTimeRef = useRef<number>(0)
  const fullTranscriptRef = useRef('')
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // ── Check plan on mount ───────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/login'; return }
        setUserId(user.id)
        const { data } = await supabase
          .from('subscriptions')
          .select('plan, credits_remaining')
          .eq('user_id', user.id)
          .single()
        if (data) {
          setPlan(data.plan)
          const isPremium = data.plan === 'premium' || data.credits_remaining >= 999999
          setPhase(isPremium ? 'setup' : 'gate')
        }
      } catch (e) { console.error(e) }
      finally { setPlanLoading(false) }
    }
    init()

    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SR) setSupported(false)
    }
    return () => {
      if (recognitionRef.current) { recognitionRef.current.onend = null; try { recognitionRef.current.stop() } catch {} }
      if (timerRef.current) clearInterval(timerRef.current)
      if (synthRef.current) synthRef.current.cancel()
    }
  }, [])

  // ── FREE: Browser TTS ────────────────────────────────────
  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) { onEnd?.(); return }
    synthRef.current.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.9; utter.pitch = 1; utter.volume = 1
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female')))
    if (preferred) utter.voice = preferred
    utter.onend = () => { setAiSpeaking(false); onEnd?.() }
    utter.onerror = () => { setAiSpeaking(false); onEnd?.() }
    setAiSpeaking(true)
    synthRef.current.speak(utter)
  }, [])

  const startInterview = async () => {
    setError(''); setPhase('ready')
    try {
      const res = await fetch('/api/interview/voice-questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, round, count: questionCount })
      })
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions); setCurrentQ(0); setResults([])
        speakText(
          `Welcome to your ${company} ${round} mock interview. ${data.questions.length} questions. Speak clearly. Let's begin.`,
          () => setTimeout(() => askQuestion(data.questions, 0), 500)
        )
      }
    } catch { setError('Failed to load questions.'); setPhase('setup') }
  }

  const askQuestion = useCallback((qs: string[], idx: number) => {
    if (idx >= qs.length) { finishInterview(); return }
    setCurrentQ(idx); setTranscript(''); setInterimTranscript('')
    setCurrentResult(null); fullTranscriptRef.current = ''; setPhase('ready')
    speakText(`Question ${idx + 1}. ${qs[idx]}`, () => setTimeout(startRecording, 800))
  }, [speakText])

  // ── FREE: Web Speech API for STT ─────────────────────────
  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setError('Speech recognition needs Chrome or Edge browser.'); return }
    const recognition = new SR()
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-IN'

    recognition.onstart = () => {
      setIsRecording(true); setPhase('listening')
      startTimeRef.current = Date.now(); setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000)
    }

    recognition.onresult = (event: any) => {
      let final = '', interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' '
        else interim += event.results[i][0].transcript
      }
      if (final) { fullTranscriptRef.current += final; setTranscript(fullTranscriptRef.current) }
      setInterimTranscript(interim)
    }

    recognition.onerror = (e: any) => { if (e.error !== 'no-speech') setError(`Mic error: ${e.error}`) }
    recognition.onend = () => { if (isRecording) { try { recognition.start() } catch {} } }
    recognitionRef.current = recognition
    recognition.start()
  }

  // ── Stop → free local metrics → one Claude call ──────────
  const stopAndAnalyze = async () => {
    if (recognitionRef.current) { recognitionRef.current.onend = null; try { recognitionRef.current.stop() } catch {} }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)

    const finalText = (fullTranscriptRef.current + interimTranscript).trim()
    const durationSecs = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const wordCount = finalText.split(/\s+/).filter(Boolean).length

    if (!finalText || wordCount < 3) {
      setError('No speech detected. Speak louder or check your microphone.')
      setPhase('ready'); return
    }

    setTranscript(finalText); setInterimTranscript('')
    setPhase('processing')
    speakText('Got it. Analyzing your response now.')

    // ── All FREE local computations ───────────────────────
    const { wpm, label: wpmLabel } = calcWPM(wordCount, durationSecs)
    const { counts: fillerCounts, total: totalFillers } = detectFillersLocally(finalText)
    const tone = detectTone(finalText, totalFillers, wpm)

    // ── ONE Claude call for content evaluation ────────────
    let analysis: AIAnalysis
    try {
      const res = await fetch('/api/interview/analyze-voice', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questions[currentQ], transcript: finalText,
          duration: durationSecs, wordCount, company, round
        })
      })
      const data = await res.json()
      if (data.success) {
        // Merge Claude content scores with local pace score
        analysis = {
          ...data.analysis,
          scores: {
            ...data.analysis.scores,
            pace: wpmLabel === 'Perfect' ? 85 : wpmLabel === 'Too Fast' ? 55 : 50
          },
          paceAnalysis: wpmLabel,
          fillerAnalysis: totalFillers === 0
            ? 'Excellent — no filler words detected!'
            : `Detected ${totalFillers} filler word${totalFillers > 1 ? 's' : ''}. Try pausing instead of saying "${Object.keys(fillerCounts)[0] || 'um'}".`
        }
      } else throw new Error(data.error)
    } catch {
      // Graceful fallback — still show local metrics
      const baseScore = Math.min(Math.max(wordCount > 60 ? 60 : wordCount > 25 ? 45 : 30, 25), 80)
      analysis = {
        scores: { overall: baseScore, confidence: baseScore - 5, clarity: baseScore, relevance: baseScore - 3, communication: baseScore - 2, pace: wpmLabel === 'Perfect' ? 80 : 50 },
        strengths: ['You attempted the question', wordCount > 30 ? 'Reasonable answer length' : 'Concise response'],
        improvements: ['Add a specific example from your experience', 'Use STAR method for structure'],
        contentFeedback: 'Good effort! Structure your answer with: (1) Direct point, (2) Example, (3) Result.',
        betterAnswer: 'A strong answer includes a direct response, a real example with specifics, and a clear outcome.',
        eyeContactTip: 'Maintain eye contact with the camera — it signals confidence to interviewers.',
        encouragement: 'Every practice session makes you better. Keep going!',
        overallVerdict: baseScore >= 70 ? 'Good' : 'Average',
        fillerAnalysis: totalFillers === 0 ? 'No filler words — great!' : `${totalFillers} filler words detected. Pause instead.`,
        paceAnalysis: wpmLabel
      }
    }

    const result: QuestionResult = {
      question: questions[currentQ], transcript: finalText,
      duration: durationSecs, wpm, wpmLabel, wordCount,
      fillerCounts, totalFillers, tone, analysis
    }

    setCurrentResult(result)
    setResults(prev => [...prev, result])
    setPhase('feedback')
    speakText(`${analysis.overallVerdict}! Score: ${analysis.scores.overall} out of 100. ${analysis.encouragement}`)
  }

  const nextQuestion = () => {
    const next = currentQ + 1
    if (next >= questions.length) finishInterview()
    else askQuestion(questions, next)
  }

  const finishInterview = () => {
    if (synthRef.current) synthRef.current.cancel()
    setPhase('complete')
    const avg = results.length > 0
      ? Math.round(results.reduce((a, r) => a + r.analysis.scores.overall, 0) / results.length) : 0
    speakText(`Interview complete! Your average score is ${avg} out of 100. Great work!`)
  }

  const resetInterview = () => {
    if (synthRef.current) synthRef.current.cancel()
    if (recognitionRef.current) { recognitionRef.current.onend = null; try { recognitionRef.current.stop() } catch {} }
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('setup'); setQuestions([]); setCurrentQ(0); setTranscript('')
    setInterimTranscript(''); setIsRecording(false); setRecordingTime(0)
    setResults([]); setCurrentResult(null); setError('')
  }

  const avgScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + r.analysis.scores.overall, 0) / results.length) : 0

  const sc = (n: number) => n >= 80 ? '#4ade80' : n >= 60 ? '#fbbf24' : '#f87171'

  const C: any = {
    page: { minHeight: '100vh', background: '#0a0f1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: 'white', paddingBottom: '60px' },
    wrap: { maxWidth: '1000px', margin: '0 auto', padding: '0 20px' },
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' },
    btn: (color = '#2563eb', off = false) => ({
      padding: '14px 28px', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
      cursor: off ? 'not-allowed' : 'pointer', color: off ? '#334155' : 'white',
      background: off ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${color}, ${color}dd)`,
      boxShadow: off ? 'none' : `0 6px 20px ${color}40`
    }),
    lbl: { color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
  }

  // ── LOADING ───────────────────────────────────────────────
  if (planLoading) return (
    <div style={{ ...C.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#a78bfa', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Checking access...</p>
      </div>
    </div>
  )

  // ── PREMIUM GATE ──────────────────────────────────────────
  if (phase === 'gate') return (
    <div style={C.page}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 24px rgba(245,158,11,0.3)}50%{box-shadow:0 0 56px rgba(245,158,11,0.65)}}
        @keyframes shimmerBg{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
      `}</style>

      {/* Nav */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', marginBottom: '0' }}>
        <div style={{ ...C.wrap, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</Link>
          <span style={{ color: '#1e293b' }}>|</span>
          <span style={{ color: 'white', fontWeight: '700' }}>🎤 Voice Mock Interview</span>
          <div style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '6px', padding: '3px 10px' }}>
            <span style={{ color: '#c4b5fd', fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>BETA</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '580px', margin: '72px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '28px', padding: '52px 40px' }}>

          {/* Crown */}
          <div style={{ width: '88px', height: '88px', borderRadius: '26px', background: 'linear-gradient(135deg, #d97706, #fbbf24)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', animation: 'float 3s ease-in-out infinite, glow 3s ease-in-out infinite' }}>
            👑
          </div>

          {/* Premium label */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '9999px', padding: '5px 18px', marginBottom: '20px' }}>
            <span style={{ color: '#fcd34d', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px' }}>PREMIUM ONLY FEATURE</span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '14px', lineHeight: '1.3' }}>
            AI Voice Mock Interview
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.8', marginBottom: '32px' }}>
            Speak your answers aloud. AI analyses your <strong style={{ color: 'white' }}>tone, pace, filler words</strong> and content — and gives you detailed improvement tips.
          </p>

          {/* Feature checklist */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px 24px', marginBottom: '28px', textAlign: 'left' }}>
            <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '14px' }}>WHAT'S INCLUDED</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                ['✅', 'Free speech-to-text (browser)'],
                ['✅', 'Free filler word detection'],
                ['✅', 'Free WPM pace scoring'],
                ['🤖', 'Claude AI content analysis'],
                ['💡', 'Model answer per question'],
                ['👁', 'Body language tips'],
                ['🎭', 'Tone & confidence scoring'],
                ['🏆', 'Full performance report'],
              ].map(([icon, label], i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                  <span style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '40px', fontWeight: '900', color: 'white' }}>₹499</span>
            <span style={{ fontSize: '16px', color: '#64748b' }}>/month</span>
            <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>Unlimited credits · All features · UPI accepted</p>
          </div>

          <Link href="/billing" style={{
            display: 'block', padding: '16px 32px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            textDecoration: 'none', color: 'white', fontSize: '17px', fontWeight: '800',
            boxShadow: '0 8px 28px rgba(245,158,11,0.4)', marginBottom: '14px',
            transition: 'transform 0.2s'
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Upgrade to Premium →
          </Link>

          <Link href="/billing" style={{ display: 'block', color: '#475569', textDecoration: 'none', fontSize: '13px', marginBottom: '16px' }}>View all plans →</Link>

          {plan && (
            <p style={{ color: '#334155', fontSize: '12px' }}>
              You are on <strong style={{ color: '#475569', textTransform: 'capitalize' }}>{plan}</strong> plan — upgrade to Premium to unlock this
            </p>
          )}
        </div>

        <Link href="/interview" style={{ display: 'inline-block', marginTop: '18px', color: '#64748b', textDecoration: 'none', fontSize: '13px' }}>
          ← Try text mock interview instead (free for all plans)
        </Link>
      </div>
    </div>
  )

  // ── SETUP ────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={C.page}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* Nav */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', marginBottom: '36px' }}>
        <div style={{ ...C.wrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</Link>
            <span style={{ color: '#1e293b' }}>|</span>
            <span style={{ color: 'white', fontWeight: '700' }}>🎤 Voice Mock Interview</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#c4b5fd', fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>BETA</span>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '4px 12px' }}>
              <span style={{ color: '#fcd34d', fontSize: '11px', fontWeight: '800' }}>👑 PREMIUM</span>
            </div>
          </div>
        </div>
      </div>

      <div style={C.wrap}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ width: '78px', height: '78px', borderRadius: '22px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', animation: 'float 3s ease-in-out infinite', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>🎤</div>
          <h1 style={{ fontSize: '33px', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Voice Mock Interview
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '500px', margin: '0 auto 16px', lineHeight: '1.7' }}>
            Speak your answers aloud. Browser handles speech-to-text for free — Claude evaluates your content.
          </p>

          {/* Cost transparency bar */}
          <div style={{ display: 'inline-flex', gap: '20px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '10px 24px' }}>
            {[
              { label: 'Speech-to-text', val: 'Free', color: '#4ade80' },
              { label: 'Filler detection', val: 'Free', color: '#4ade80' },
              { label: 'WPM / pace', val: 'Free', color: '#4ade80' },
              { label: 'AI evaluation', val: 'Claude', color: '#fbbf24' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: item.color, fontWeight: '700', fontSize: '12px' }}>{item.val}</div>
                <div style={{ color: '#475569', fontSize: '10px', marginTop: '1px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {!supported && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            <p style={{ color: '#fca5a5', fontWeight: '700', marginBottom: '4px' }}>⚠️ Speech Recognition Not Supported</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Please use Chrome or Edge browser for this feature.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
          {/* Settings card */}
          <div style={C.card}>
            <h2 style={{ color: 'white', fontWeight: '700', fontSize: '17px', marginBottom: '20px' }}>⚙️ Settings</h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={C.lbl}>Company Type</label>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '7px' }}>
                {COMPANIES.map(c => (
                  <button key={c} onClick={() => { setCompany(c); setRound(ROUNDS[c][0]) }}
                    style={{ padding: '9px 14px', borderRadius: '10px', border: `1px solid ${company === c ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.06)'}`, background: company === c ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.02)', color: company === c ? '#93c5fd' : '#64748b', fontWeight: company === c ? '700' : '400', cursor: 'pointer', textAlign: 'left' as const, fontSize: '13px' }}>
                    {c === 'TCS/Infosys/Wipro' ? '🏢 ' : c === 'Amazon/Google/Microsoft' ? '🌐 ' : c === 'HR Round' ? '👤 ' : '⭐ '}{c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={C.lbl}>Round Type</label>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' as const }}>
                {(ROUNDS[company] || []).map(r => (
                  <button key={r} onClick={() => setRound(r)}
                    style={{ padding: '7px 15px', borderRadius: '8px', border: 'none', background: round === r ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: round === r ? 'white' : '#64748b', fontWeight: round === r ? '700' : '400', cursor: 'pointer', fontSize: '13px' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={C.lbl}>Questions</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {QUESTION_COUNTS.map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: questionCount === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: questionCount === n ? 'white' : '#64748b', fontWeight: questionCount === n ? '700' : '400', cursor: 'pointer', fontSize: '14px' }}>
                    {n} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist + summary */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
            <div style={C.card}>
              <h3 style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>✅ Before You Start</h3>
              {[
                { icon: '🎤', t: 'Microphone connected & working' },
                { icon: '🔇', t: 'Quiet environment' },
                { icon: '🌐', t: 'Chrome or Edge browser' },
                { icon: '💡', t: 'Speak clearly at normal pace' },
                { icon: '👤', t: 'Sit straight — like a real interview' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '9px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '15px' }}>{item.icon}</span>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>{item.t}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '14px', padding: '16px' }}>
              <p style={{ color: '#93c5fd', fontSize: '13px', lineHeight: '1.9' }}>
                🏢 <strong style={{ color: 'white' }}>{company}</strong><br />
                🎯 <strong style={{ color: 'white' }}>{round} Round</strong><br />
                ❓ <strong style={{ color: 'white' }}>{questionCount} Questions</strong><br />
                ⏱ <strong style={{ color: 'white' }}>~{questionCount * 2} min</strong>
              </p>
            </div>

            <button onClick={startInterview} disabled={!supported}
              style={{ ...C.btn('#2563eb', !supported), width: '100%', padding: '16px', fontSize: '16px' }}>
              🎤 Start Voice Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── COMPLETE SCREEN ───────────────────────────────────────
  if (phase === 'complete') return (
    <div style={C.page}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      <div style={{ ...C.wrap, paddingTop: '40px' }}>

        {/* Score hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(${sc(avgScore)} ${avgScore}%, rgba(255,255,255,0.06) 0%)`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#0a0f1a', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: sc(avgScore) }}>{avgScore}</span>
              <span style={{ color: '#64748b', fontSize: '10px' }}>/ 100</span>
            </div>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '8px' }}>
            {avgScore >= 80 ? '🏆 Outstanding!' : avgScore >= 65 ? '👏 Well Done!' : avgScore >= 50 ? '📈 Good Effort!' : '💪 Keep Practicing!'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            {results.length} questions · Avg score: <strong style={{ color: sc(avgScore) }}>{avgScore}/100</strong>
          </p>
        </div>

        {/* Category averages */}
        {results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {(['confidence', 'clarity', 'relevance', 'communication', 'pace'] as const).map(key => {
              const avg = Math.round(results.reduce((a, r) => a + (r.analysis.scores[key] || 0), 0) / results.length)
              return (
                <div key={key} style={{ ...C.card, textAlign: 'center' as const, padding: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: sc(avg), marginBottom: '4px' }}>{avg}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'capitalize' as const }}>{key}</div>
                  <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${avg}%`, background: sc(avg), borderRadius: '9999px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <h2 style={{ color: 'white', fontWeight: '700', fontSize: '20px', marginBottom: '16px' }}>📋 Question-by-Question Review</h2>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px', marginBottom: '32px' }}>
          {results.map((result, i) => (
            <div key={i} style={C.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', marginBottom: '8px', display: 'inline-block' }}>Q{i + 1}</span>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>{result.question}</h3>
                </div>
                <div style={{ textAlign: 'center' as const, flexShrink: 0, marginLeft: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: sc(result.analysis.scores.overall) }}>{result.analysis.scores.overall}</div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>/ 100</div>
                  <div style={{ color: sc(result.analysis.scores.overall), fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>{result.analysis.overallVerdict}</div>
                </div>
              </div>

              {/* Answer */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>YOUR ANSWER</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', fontStyle: 'italic' }}>"{result.transcript.length > 200 ? result.transcript.substring(0, 200) + '...' : result.transcript}"</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' as const }}>
                  <span style={{ color: '#475569', fontSize: '11px' }}>⏱ {result.duration}s</span>
                  <span style={{ color: '#475569', fontSize: '11px' }}>💬 {result.wordCount} words</span>
                  <span style={{ color: result.wpmLabel === 'Perfect' ? '#4ade80' : '#fbbf24', fontSize: '11px' }}>🎙 {result.wpm} WPM · {result.wpmLabel}</span>
                  {result.totalFillers > 0 && <span style={{ color: '#f87171', fontSize: '11px' }}>⚠️ {result.totalFillers} fillers</span>}
                  <span style={{ color: '#a78bfa', fontSize: '11px' }}>🎭 {result.tone}</span>
                </div>
              </div>

              {/* Filler words */}
              {Object.keys(result.fillerCounts).length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>⚠️ FILLER WORDS (detected locally — free)</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '6px' }}>
                    {Object.entries(result.fillerCounts).map(([w, c], j) => (
                      <span key={j} style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>"{w}" ×{c}</span>
                    ))}
                  </div>
                  <p style={{ color: '#64748b', fontSize: '12px' }}>{result.analysis.fillerAnalysis}</p>
                </div>
              )}

              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                {[
                  { label: 'TONE', val: result.tone, color: '#a78bfa', badge: 'local' },
                  { label: 'PACE', val: `${result.wpmLabel} · ${result.wpm} WPM`, color: result.wpmLabel === 'Perfect' ? '#4ade80' : '#fbbf24', badge: 'local' },
                  { label: 'FILLER WORDS', val: result.totalFillers === 0 ? 'None ✅' : `${result.totalFillers} found`, color: result.totalFillers === 0 ? '#4ade80' : '#f87171', badge: 'local' },
                ].map((item, j) => (
                  <div key={j} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <p style={{ color: '#64748b', fontSize: '10px', fontWeight: '600' }}>{item.label}</p>
                      <span style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80', fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '4px' }}>FREE</span>
                    </div>
                    <p style={{ color: item.color, fontWeight: '700', fontSize: '13px' }}>{item.val}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ color: '#4ade80', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>✅ STRENGTHS</p>
                  {result.analysis.strengths?.map((s, j) => <p key={j} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>• {s}</p>)}
                </div>
                <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>🔧 IMPROVE</p>
                  {result.analysis.improvements?.map((s, j) => <p key={j} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>• {s}</p>)}
                </div>
              </div>

              <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                  <p style={{ color: '#93c5fd', fontSize: '11px', fontWeight: '700' }}>💡 MODEL ANSWER</p>
                  <span style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa', fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px' }}>🤖 Claude</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>{result.analysis.betterAnswer}</p>
              </div>

              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '10px', padding: '10px 12px' }}>
                <p style={{ color: '#c4b5fd', fontSize: '12px' }}>👁 <strong>Body Language:</strong> {result.analysis.eyeContactTip}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={resetInterview} style={C.btn('#2563eb')}>🔄 Practice Again</button>
          <Link href="/dashboard" style={{ ...C.btn('#475569'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>← Dashboard</Link>
        </div>
      </div>
    </div>
  )

  // ── INTERVIEW SCREEN ──────────────────────────────────────
  return (
    <div style={C.page}>
      <style>{`
        @keyframes waveBar{from{transform:scaleY(0.25)}to{transform:scaleY(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fade{from{opacity:0.3}to{opacity:1}}
      `}</style>

      {/* Top bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', marginBottom: '28px' }}>
        <div style={{ ...C.wrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={resetInterview} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>✕ Exit</button>
            <span style={{ color: '#1e293b' }}>|</span>
            <span style={{ color: 'white', fontWeight: '700' }}>{company} · {round}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {questions.map((_, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < currentQ ? '#4ade80' : i === currentQ ? '#60a5fa' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
            ))}
            <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '6px' }}>{currentQ + 1}/{questions.length}</span>
          </div>
        </div>
      </div>

      <div style={C.wrap}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* AI avatar */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: aiSpeaking ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.06)', border: `3px solid ${aiSpeaking ? '#60a5fa' : 'rgba(255,255,255,0.1)'}`, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', transition: 'all 0.3s', boxShadow: aiSpeaking ? '0 0 28px rgba(37,99,235,0.4)' : 'none' }}>
              🤖
            </div>
            <p style={{ color: aiSpeaking ? '#93c5fd' : '#475569', fontSize: '13px', fontWeight: aiSpeaking ? '600' : '400' }}>
              {aiSpeaking ? '🔊 AI speaking...' : phase === 'ready' ? 'Preparing next question...' : phase === 'listening' ? '🎤 Listening to you...' : phase === 'processing' ? '🧠 Analyzing response...' : 'Review feedback below ↓'}
            </p>
          </div>

          {/* Question card */}
          {questions[currentQ] && (
            <div style={{ ...C.card, marginBottom: '24px', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(37,99,235,0.2)' }}>
              <p style={{ color: '#93c5fd', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>QUESTION {currentQ + 1} OF {questions.length}</p>
              <h2 style={{ color: 'white', fontWeight: '700', fontSize: '20px', lineHeight: '1.4' }}>{questions[currentQ]}</h2>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ color: '#fca5a5', fontSize: '13px' }}>⚠️ {error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginLeft: '8px' }}>✕</button></p>
            </div>
          )}

          {/* READY */}
          {phase === 'ready' && !aiSpeaking && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎤</div>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>AI finished speaking — start recording</p>
              <button onClick={startRecording} disabled={!supported} style={C.btn('#2563eb', !supported)}>🎤 Start Recording</button>
            </div>
          )}

          {/* LISTENING */}
          {phase === 'listening' && (
            <div>
              {/* Waveform */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', height: '64px', marginBottom: '20px' }}>
                {[...Array(28)].map((_, i) => (
                  <div key={i} style={{ width: '4px', borderRadius: '2px', background: 'linear-gradient(180deg, #60a5fa, #7c3aed)', height: `${8 + (i % 7) * 7}px`, animation: `waveBar 0.7s ease-in-out ${i * 0.035}s infinite alternate` }} />
                ))}
              </div>

              {/* Timer */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '9999px', padding: '8px 20px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                  <span style={{ color: '#fca5a5', fontWeight: '700', fontSize: '16px' }}>
                    {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Recording</span>
                </div>
              </div>

              {/* Live transcript */}
              <div style={{ ...C.card, marginBottom: '20px', minHeight: '80px' }}>
                <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>🎤 LIVE TRANSCRIPT (Web Speech API — free)</p>
                <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>
                  {transcript}
                  <span style={{ color: '#64748b' }}>{interimTranscript}</span>
                  {!transcript && !interimTranscript && <span style={{ color: '#334155', fontStyle: 'italic' }}>Start speaking...</span>}
                </p>
              </div>

              <button onClick={stopAndAnalyze} style={{ ...C.btn('#dc2626'), width: '100%', padding: '16px', fontSize: '16px' }}>
                ⏹ Stop & Analyze Answer
              </button>
              <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
                💡 Aim for 30–90 seconds. Click stop when done.
              </p>
            </div>
          )}

          {/* PROCESSING */}
          {phase === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1.5s linear infinite' }}>🧠</div>
              <h3 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Analyzing your response...</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                Filler words, WPM, tone → computed <strong style={{ color: '#4ade80' }}>free locally</strong> &nbsp;·&nbsp; Content → <strong style={{ color: '#93c5fd' }}>Claude AI</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
                {[
                  { label: '🔤 Filler Words', free: true },
                  { label: '⏱ WPM Pace', free: true },
                  { label: '🎭 Tone', free: true },
                  { label: '💬 Content Quality', free: false },
                  { label: '💡 Model Answer', free: false },
                ].map((item, i) => (
                  <span key={i} style={{
                    background: item.free ? 'rgba(22,163,74,0.15)' : 'rgba(37,99,235,0.15)',
                    border: `1px solid ${item.free ? 'rgba(22,163,74,0.25)' : 'rgba(37,99,235,0.25)'}`,
                    color: item.free ? '#4ade80' : '#93c5fd',
                    padding: '5px 13px', borderRadius: '9999px', fontSize: '12px',
                    animation: `fade 1.5s ease-in-out ${i * 0.25}s infinite alternate`
                  }}>
                    {item.label} {item.free ? '(free)' : '(Claude)'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* FEEDBACK */}
          {phase === 'feedback' && currentResult && (
            <div>
              {/* Score grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {(['overall', 'confidence', 'clarity', 'relevance', 'communication', 'pace'] as const).map(key => {
                  const score = currentResult.analysis.scores[key] || 0
                  const icons: Record<string, string> = { overall: '🏆', confidence: '💪', clarity: '🔊', relevance: '🎯', communication: '💬', pace: '⏱' }
                  return (
                    <div key={key} style={{ ...C.card, padding: '14px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{icons[key]}</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: sc(score) }}>{score}</div>
                      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px', textTransform: 'capitalize' as const }}>{key}</div>
                      <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${score}%`, background: sc(score), borderRadius: '9999px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                <div style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', padding: '8px 14px' }}>
                  <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '13px' }}>🎭 Tone: {currentResult.tone}</span>
                  <span style={{ color: '#475569', fontSize: '10px', marginLeft: '6px' }}>(local)</span>
                </div>
                <div style={{ background: currentResult.wpmLabel === 'Perfect' ? 'rgba(22,163,74,0.15)' : 'rgba(217,119,6,0.15)', border: `1px solid ${currentResult.wpmLabel === 'Perfect' ? 'rgba(22,163,74,0.2)' : 'rgba(217,119,6,0.2)'}`, borderRadius: '10px', padding: '8px 14px' }}>
                  <span style={{ color: currentResult.wpmLabel === 'Perfect' ? '#4ade80' : '#fbbf24', fontWeight: '700', fontSize: '13px' }}>⏱ {currentResult.wpmLabel} · {currentResult.wpm} WPM</span>
                  <span style={{ color: '#475569', fontSize: '10px', marginLeft: '6px' }}>(local)</span>
                </div>
                <div style={{ background: currentResult.totalFillers === 0 ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)', border: `1px solid ${currentResult.totalFillers === 0 ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`, borderRadius: '10px', padding: '8px 14px' }}>
                  <span style={{ color: currentResult.totalFillers === 0 ? '#4ade80' : '#fca5a5', fontWeight: '700', fontSize: '13px' }}>
                    {currentResult.totalFillers === 0 ? '✅ No fillers' : `⚠️ ${currentResult.totalFillers} filler words`}
                  </span>
                  <span style={{ color: '#475569', fontSize: '10px', marginLeft: '6px' }}>(local)</span>
                </div>
              </div>

              {/* Filler detail */}
              {Object.keys(currentResult.fillerCounts).length > 0 && (
                <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ color: '#fca5a5', fontSize: '11px', fontWeight: '700' }}>⚠️ FILLER WORDS DETECTED</p>
                    <span style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80', fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '4px' }}>FREE LOCAL</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
                    {Object.entries(currentResult.fillerCounts).map(([word, count], j) => (
                      <span key={j} style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        "{word}" × {count}
                      </span>
                    ))}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '12px' }}>{currentResult.analysis.fillerAnalysis}</p>
                </div>
              )}

              {/* Content feedback — Claude */}
              <div style={{ ...C.card, marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💬 CONTENT FEEDBACK</p>
                  <span style={{ background: 'rgba(37,99,235,0.15)', color: '#93c5fd', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '5px' }}>🤖 Claude AI</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>{currentResult.analysis.contentFeedback}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ color: '#4ade80', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>✅ WHAT YOU DID WELL</p>
                  {currentResult.analysis.strengths?.map((s, i) => <p key={i} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>• {s}</p>)}
                </div>
                <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>🔧 AREAS TO IMPROVE</p>
                  {currentResult.analysis.improvements?.map((s, i) => <p key={i} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>• {s}</p>)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ color: '#93c5fd', fontSize: '11px', fontWeight: '700' }}>💡 MODEL ANSWER</p>
                    <span style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa', fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px' }}>🤖 Claude</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.6' }}>{currentResult.analysis.betterAnswer}</p>
                </div>
                <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ color: '#c4b5fd', fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>👁 BODY LANGUAGE</p>
                  <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.6' }}>{currentResult.analysis.eyeContactTip}</p>
                  <div style={{ marginTop: '10px', background: 'rgba(37,99,235,0.08)', borderRadius: '8px', padding: '8px 10px' }}>
                    <p style={{ color: '#93c5fd', fontSize: '12px' }}>✨ {currentResult.analysis.encouragement}</p>
                  </div>
                </div>
              </div>

              <button onClick={nextQuestion} style={{ ...C.btn('#059669'), width: '100%', padding: '16px', fontSize: '16px' }}>
                {currentQ + 1 >= questions.length ? '🏁 Finish Interview & See Results' : `➡️ Next Question (${currentQ + 2}/${questions.length})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}