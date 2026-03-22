'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Animated Counter Hook ─────────────────────────────
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration, start])
  return count
}

// ── Floating Particle ─────────────────────────────────
function Particle({ delay, left, size, color }: any) {
  return (
    <div style={{
      position: 'absolute', left: `${left}%`, bottom: '-20px',
      width: size, height: size, borderRadius: '50%', background: color,
      opacity: 0.6, animation: `floatUp 8s ${delay}s ease-in infinite`,
      pointerEvents: 'none', zIndex: 0
    }} />
  )
}

// ── Feature Card ──────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay, bullets }: any) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `linear-gradient(135deg, ${color}15, ${color}08)` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? color + '50' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px', padding: '32px',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 20px 60px ${color}25` : '0 4px 20px rgba(0,0,0,0.2)',
        animation: `fadeSlideUp 0.8s ${delay}s both`,
        cursor: 'default'
      }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: `linear-gradient(135deg, ${color}30, ${color}15)`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '26px', marginBottom: '20px',
        transition: 'transform 0.3s',
        transform: hovered ? 'rotate(-8deg) scale(1.15)' : 'rotate(0) scale(1)'
      }}>{icon}</div>
      <h3 style={{ color: 'white', fontWeight: '800', fontSize: '18px', marginBottom: '10px' }}>{title}</h3>
      <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>{desc}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {bullets.map((b: string, i: number) => (
          <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span style={{ color: color, fontSize: '12px', flexShrink: 0, marginTop: '3px', fontWeight: '700' }}>▶</span>
            <span style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Animated Stat ─────────────────────────────────────
function StatCard({ num, label, icon, color, delay }: any) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '32px 20px',
      animation: `fadeSlideUp 0.6s ${delay}s both`
    }}>
      <div style={{ fontSize: '36px', marginBottom: '8px' }}>{icon}</div>
      <div style={{
        fontSize: '42px', fontWeight: '900', lineHeight: '1',
        background: `linear-gradient(135deg, ${color}, white)`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: '6px'
      }}>{num}</div>
      <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{label}</div>
    </div>
  )
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const FEATURES = [
    {
      icon: '✨', title: 'AI Resume Builder', color: '#2563eb',
      desc: 'Claude AI writes your ATS-optimized resume in under 60 seconds.',
      bullets: [
        'ATS score 90%+ guaranteed',
        '10+ professional templates',
        'Tailored for TCS, Infosys, Wipro',
        'Download as PDF or DOCX'
      ]
    },
    {
      icon: '🎯', title: 'Interview Coach', color: '#7c3aed',
      desc: 'Practice with real questions from India\'s top IT companies.',
      bullets: [
        '15+ companies covered (TCS, Amazon, Google)',
        'AI evaluates each answer individually',
        'Personalized improvement tips',
        'Mock HR + Technical rounds'
      ]
    },
    {
      icon: '📱', title: 'WhatsApp Daily Coach', color: '#059669',
      desc: '10 tailored questions delivered to your WhatsApp every morning.',
      bullets: [
        'Role-specific daily questions',
        'AI feedback on your answers',
        'Build streak & track progress',
        '21-day placement bootcamp'
      ]
    },
    {
      icon: '🎯', title: 'ATS Score Checker', color: '#dc2626',
      desc: 'Upload your resume and get a real-time ATS compatibility score.',
      bullets: [
        'Supports PDF & DOCX upload',
        'Keyword gap analysis',
        'Beat 95% of applicants',
        'Instant improvement tips'
      ]
    },
    {
      icon: '🤖', title: 'AI Career Coach', color: '#d97706',
      desc: 'Ask anything about your career, salary, or job search strategy.',
      bullets: [
        'Powered by Claude AI',
        'Salary negotiation scripts',
        'Company research deep-dives',
        'Available 24/7'
      ]
    },
    {
      icon: '🎤', title: 'Voice Mock Interview', color: '#8b5cf6',
      desc: 'Speak your answers aloud — AI detects tone, pace & filler words.',
      bullets: [
        'Real-time speech analysis',
        'Filler word detection',
        'WPM pace scoring',
        'Confidence improvement tips'
      ]
    }
  ]

  const STEPS = [
    { num: '01', title: 'Create Account Free', desc: 'Sign up in 30 seconds. No credit card needed. Get 10 free credits instantly.', icon: '🔐', color: '#2563eb' },
    { num: '02', title: 'Build Your Resume', desc: 'AI writes your ATS-optimized resume. Pick a template, download PDF/DOCX.', icon: '📄', color: '#7c3aed' },
    { num: '03', title: 'Practice Interviews', desc: 'Answer real company questions. Get AI feedback with improvement tips.', icon: '🎯', color: '#059669' },
    { num: '04', title: 'Land Your Dream Job', desc: '85% of our users get interview calls within 2 weeks of using AI Coach.', icon: '🏆', color: '#d97706' },
  ]

  const WHY_BULLETS = [
    '🇮🇳 Built specifically for the Indian job market',
    '⚡ Resume ready in under 60 seconds',
    '🎯 ATS-optimized for TCS, Infosys, Wipro & 15+ companies',
    '📱 Daily WhatsApp coaching to keep you sharp',
    '🤖 Powered by Claude AI — the most advanced AI available',
    '💰 Plans starting at just ₹99/month',
    '🏆 85% interview success rate among our users',
    '🔒 UPI payments accepted — no international cards needed',
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #060914; color: white; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        @keyframes rotateSlow { to { transform: rotate(360deg); } }
        @keyframes pulsGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(37,99,235,0.4); }
          50% { box-shadow: 0 0 60px rgba(37,99,235,0.8), 0 0 100px rgba(124,58,237,0.4); }
        }
        @keyframes shimmerText {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes heroEntrance {
          from { opacity: 0; transform: translateY(60px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(37,99,235,0.3); }
          50% { border-color: rgba(124,58,237,0.6); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .nav-link { color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; padding: 8px 12px; border-radius: 8px; }
        .nav-link:hover { color: white; background: rgba(255,255,255,0.06); }
        
        .cta-primary {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white; padding: 14px 32px; border-radius: 14px;
          text-decoration: none; font-weight: 700; font-size: 16px;
          transition: all 0.3s; display: inline-block;
          box-shadow: 0 8px 32px rgba(37,99,235,0.4);
          animation: pulsGlow 3s ease-in-out infinite;
        }
        .cta-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 48px rgba(37,99,235,0.6); }
        
        .cta-secondary {
          color: white; padding: 14px 28px; border-radius: 14px;
          text-decoration: none; font-weight: 600; font-size: 16px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05); backdrop-filter: blur(10px);
          transition: all 0.3s; display: inline-block;
        }
        .cta-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); transform: translateY(-2px); }
        
        .step-line::after {
          content: '';
          position: absolute; right: -50%; top: 50%;
          width: 100%; height: 2px;
          background: linear-gradient(90deg, #2563eb, transparent);
        }
      `}</style>

      {/* Floating Particles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
          <Particle
            key={i}
            delay={i * 0.8}
            left={5 + (i * 6.5)}
            size={`${3 + (i % 4)}px`}
            color={i % 3 === 0 ? '#2563eb' : i % 3 === 1 ? '#7c3aed' : '#06b6d4'}
          />
        ))}
      </div>

      {/* ── NAVBAR ─────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: `rgba(6,9,20,${Math.min(scrollY / 100, 0.95)})`,
        backdropFilter: 'blur(24px)',
        borderBottom: scrollY > 20 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        padding: '0 24px', height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s'
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '14px',
            fontFamily: 'Syne, sans-serif', animation: 'pulsGlow 3s infinite'
          }}>AI</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '18px', color: 'white' }}>
            Placement<span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Coach</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <a href="#features" className="nav-link">Features</a>
          <Link href="/career-center" className="nav-link">Career Center</Link>
          <Link href="/billing" className="nav-link">Pricing</Link>
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/register" style={{
            marginLeft: '8px', padding: '9px 20px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '700',
            boxShadow: '0 4px 16px rgba(37,99,235,0.4)'
          }}>
            Start Free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden', paddingTop: '68px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 40%, transparent 70%)'
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px', pointerEvents: 'none'
        }} />

        {/* Big glow orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', width: '100%', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

            {/* Left */}
            <div style={{ animation: heroVisible ? 'heroEntrance 0.9s ease both' : 'none' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)',
                borderRadius: '9999px', padding: '7px 18px', marginBottom: '28px',
                animation: 'floatBadge 3s ease-in-out infinite'
              }}>
                <span style={{ fontSize: '14px' }}>🇮🇳</span>
                <span style={{ color: '#93c5fd', fontSize: '13px', fontWeight: '600' }}>India's #1 AI Placement Platform</span>
                <span style={{ background: '#2563eb', color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px' }}>NEW</span>
              </div>

              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '60px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>
                Land your dream<br />
                <span style={{
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6, #60a5fa)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 4s ease infinite'
                }}>job faster</span>
                <br />with AI
              </h1>

              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.7', marginBottom: '28px', maxWidth: '500px' }}>
                AI-powered resume builder + interview coach + daily WhatsApp practice. Built for Indian freshers & professionals.
              </p>

              {/* Bullet Points */}
              <div style={{ marginBottom: '36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  '⚡ Resume in 60 seconds',
                  '🎯 ATS score 90%+',
                  '🏢 15+ company prep',
                  '📱 WhatsApp coaching',
                  '🤖 Claude AI powered',
                  '💳 Starts at ₹99/mo',
                ].map((b, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '10px 14px',
                    animation: `fadeSlideUp 0.6s ${0.1 + i * 0.08}s both`
                  }}>
                    <span style={{ fontSize: '14px' }}>{b.split(' ')[0]}</span>
                    <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>{b.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <Link href="/register" className="cta-primary">
                  Build My Resume Free →
                </Link>
                <Link href="/interview" className="cta-secondary">
                  Try Interview Prep
                </Link>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '20px' }}>
                {['No credit card needed', 'Free 10 credits', 'Setup in 30 sec'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#16a34a', fontSize: '14px' }}>✓</span>
                    <span style={{ color: '#475569', fontSize: '13px' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Resume Preview Card */}
            <div style={{
              position: 'relative', animation: heroVisible ? 'fadeSlideUp 1s 0.3s both' : 'none'
            }}>
              {/* Glow behind card */}
              <div style={{
                position: 'absolute', inset: '-20px',
                background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.2), transparent 70%)',
                filter: 'blur(30px)', zIndex: 0
              }} />

              {/* Resume card */}
              <div style={{
                position: 'relative', zIndex: 1,
                background: 'white', borderRadius: '20px',
                boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                overflow: 'hidden', animation: 'borderGlow 3s infinite'
              }}>
                <div style={{ background: 'linear-gradient(135deg, #1e40af, #6d28d9)', padding: '24px 28px' }}>
                  <div style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '22px' }}>RAHUL SHARMA</div>
                  <div style={{ color: '#bfdbfe', fontSize: '13px', marginTop: '4px' }}>Software Engineer • rahul@gmail.com</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {['✅ ATS 92%', '🎯 Keywords 18/20', '⚡ AI-Optimized'].map((t, i) => (
                      <span key={i} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '20px 28px' }}>
                  {['PROFESSIONAL SUMMARY', 'WORK EXPERIENCE', 'SKILLS', 'EDUCATION', 'PROJECTS'].map((s, si) => (
                    <div key={si} style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '8px', fontWeight: '900', color: '#1e40af', letterSpacing: '2px', marginBottom: '6px' }}>{s}</div>
                      {[90, 75, 60].map((w, i) => (
                        <div key={i} style={{ height: '6px', background: i === 0 ? '#e2e8f0' : '#f1f5f9', borderRadius: '3px', marginBottom: '4px', width: `${w}%` }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <div style={{ position: 'absolute', top: '-16px', right: '-16px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '14px', padding: '12px 20px', boxShadow: '0 8px 32px rgba(37,99,235,0.5)', zIndex: 2, animation: 'floatBadge 2.5s ease-in-out infinite' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: '600' }}>AI Score</div>
                <div style={{ color: 'white', fontSize: '28px', fontWeight: '900', lineHeight: 1 }}>92%</div>
              </div>

              <div style={{ position: 'absolute', bottom: '32px', left: '-20px', background: 'white', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 2, animation: 'floatBadge 3s 1s ease-in-out infinite' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>✅ TCS Ready</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Interview in 2 days</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────── */}
      <section style={{
        background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 10
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { num: '50,000+', label: 'Resumes Created', icon: '📄', color: '#60a5fa' },
            { num: '85%', label: 'Interview Success Rate', icon: '🏆', color: '#4ade80' },
            { num: '10,000+', label: 'Students Placed', icon: '🎓', color: '#a78bfa' },
            { num: '₹99/mo', label: 'Starting Price', icon: '💳', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <StatCard {...s} delay={i * 0.1} />
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────── */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #060914, #0a0f1a)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.06), transparent)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#93c5fd', fontSize: '12px', fontWeight: '700', padding: '6px 16px', borderRadius: '9999px', marginBottom: '20px', letterSpacing: '0.1em' }}>
              WHY STUDENTS CHOOSE US
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '44px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px' }}>
              The smarter way<br />
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>to get placed</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.8', marginBottom: '36px' }}>
              We've analyzed what separates candidates who get placed from those who don't — and built every tool around those insights.
            </p>
            <Link href="/register" className="cta-primary">Get Started Free →</Link>
          </div>

          <div>
            {WHY_BULLETS.map((bullet, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px', borderRadius: '12px', marginBottom: '8px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s', cursor: 'default',
                animation: `fadeSlideUp 0.5s ${i * 0.06}s both`
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{bullet.split(' ')[0]}</span>
                <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>{bullet.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────── */}
      <section id="features" style={{ padding: '100px 24px', background: '#060914' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#c4b5fd', fontSize: '12px', fontWeight: '700', padding: '6px 16px', borderRadius: '9999px', marginBottom: '20px', letterSpacing: '0.1em' }}>
              EVERYTHING YOU NEED
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '44px', fontWeight: '800', marginBottom: '16px' }}>
              Your Complete Placement Toolkit
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '560px', margin: '0 auto', lineHeight: '1.7' }}>
              From resume to offer letter — AI handles the heavy lifting so you can focus on performing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} delay={`${i * 0.1}s`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────── */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #060914, #0a0f1a)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', fontSize: '12px', fontWeight: '700', padding: '6px 16px', borderRadius: '9999px', marginBottom: '20px', letterSpacing: '0.1em' }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '44px', fontWeight: '800', marginBottom: '16px' }}>
              Get placed in 4 simple steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '32px 20px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px', position: 'relative',
                animation: `fadeSlideUp 0.6s ${i * 0.1}s both`,
                transition: 'all 0.3s'
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-8px)'; el.style.borderColor = step.color + '50' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: `linear-gradient(135deg, ${step.color}30, ${step.color}10)`, border: `1px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: step.color, opacity: 0.3, fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>{step.num}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '16px', marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>{step.desc}</p>
                {i < 3 && (
                  <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', color: '#334155', fontSize: '20px', zIndex: 2 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────── */}
      <section style={{
        padding: '100px 24px', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 50%, transparent 80%)'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '64px 64px', pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)',
            borderRadius: '9999px', padding: '7px 18px', marginBottom: '24px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulsGlow 2s infinite' }} />
            <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: '600' }}>10,000+ students placed and counting</span>
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '52px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px' }}>
            Ready to land your<br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>dream job?</span>
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px', lineHeight: '1.7' }}>
            Join 50,000+ students already using AI Placement Coach. Start completely free — no credit card required.
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginBottom: '36px', flexWrap: 'wrap' }}>
            {['✅ 10 free credits on signup', '⚡ Ready in 30 seconds', '🔒 UPI payments accepted'].map((b, i) => (
              <div key={i} style={{ color: '#94a3b8', fontSize: '14px' }}>{b}</div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <Link href="/register" className="cta-primary" style={{ fontSize: '18px', padding: '16px 48px' }}>
              Create Free Account →
            </Link>
            <Link href="/billing" className="cta-secondary" style={{ fontSize: '18px', padding: '16px 32px' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────── */}
      <footer style={{ background: '#060914', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '14px' }}>AI</div>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', color: 'white', fontSize: '17px' }}>PlacementCoach</span>
              </div>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8', maxWidth: '280px', marginBottom: '20px' }}>
                India's most advanced AI placement preparation platform. Built for Indian students and freshers.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['🇮🇳 Made in India', '🔒 Secure'].map((b, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '5px 10px', color: '#64748b', fontSize: '12px' }}>{b}</div>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: [['Resume Builder', '/resume'], ['Interview Coach', '/interview'], ['ATS Checker', '/resume'], ['WhatsApp Coach', '/whatsapp'], ['AI Career Coach', '/ai-coach']] },
              { title: 'Company', links: [['Career Center', '/career-center'], ['Pricing', '/billing'], ['Sign In', '/login'], ['Register', '/register']] },
              { title: 'Legal', links: [['Privacy Policy', '/'], ['Terms of Service', '/'], ['Refund Policy', '/'], ['Contact Us', '/']] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '20px' }}>{col.title}</h4>
                {col.links.map(([label, href], j) => (
                  <div key={j} style={{ marginBottom: '10px' }}>
                    <Link href={href} style={{ color: '#475569', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                    >{label}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#334155', fontSize: '13px' }}>© 2026 AI Placement Coach. All rights reserved.</p>
            <p style={{ color: '#334155', fontSize: '13px' }}>Made with ❤️ for Indian students 🇮🇳</p>
          </div>
        </div>
      </footer>
    </>
  )
}