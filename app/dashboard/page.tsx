'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import AdminSuperWidget from '@/components/AdminSuperWidget'
import ReferralSection from '@/components/ReferralSection'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState(0)
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [mounted, setMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)
        const { data } = await supabase
          .from('subscriptions')
          .select('credits_remaining, plan')
          .eq('user_id', user.id)
          .single()
        if (data) { setCredits(data.credits_remaining); setPlan(data.plan) }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const firstName = user?.email?.split('@')[0] || 'User'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const PLAN_COLORS: Record<string, string> = {
    free: '#a1a1aa', basic: '#3b82f6', pro: '#8b5cf6', premium: '#f59e0b'
  }
  const planColor = PLAN_COLORS[plan] || '#a1a1aa'

  const QUICK_ACTIONS = [
    {
      icon: '📄',
      label: 'Resume Builder',
      desc: 'ATS-friendly resume for Indian companies.',
      href: '/resume',
      color: '#2563eb',
      bg: '#eff6ff',
      credits: '5 credits',
      tag: 'Popular',
      requiredPlan: null  // Free for all
    },
    {
      icon: '🎯',
      label: 'Interview Coach',
      desc: 'TCS, Infosys, Wipro Q&A + mock interview.',
      href: '/interview',
      color: '#7c3aed',
      bg: '#faf5ff',
      credits: 'Free',
      tag: 'Free',
      requiredPlan: null  // Free for all
    },
    {
      icon: '✍️',
      label: 'Cover Letter',
      desc: 'AI-written personalised cover letters in seconds.',
      href: '/cover-letter',
      color: '#6366f1',
      bg: '#eef2ff',
      credits: '4 credits',
      tag: plan === 'pro' || plan === 'premium' ? '✨ Active' : '🔒 Pro',
      requiredPlan: 'pro'
    },
    {
      icon: '📱',
      label: 'WhatsApp Coach',
      desc: '10 questions daily on WhatsApp. AI evaluated.',
      href: '/whatsapp',
      color: '#059669',
      bg: '#ecfdf5',
      credits: 'Pro+',
      tag: plan === 'pro' || plan === 'premium' ? '✅ Active' : '🔒 Pro', requiredPlan: 'pro'
    },
    {
      icon: '🤖',
      label: 'AI Coach Chat',
      desc: 'Ask anything about placement & career.',
      href: '/ai-coach',
      color: '#7c3aed',
      bg: '#faf5ff',
      credits: 'Free chat',
      tag: 'New',
      requiredPlan: null  // Free for all
    },
    {
      icon: '💰',
      label: 'Salary Coach',
      desc: 'Negotiate offers, craft counter scripts & benchmark your market worth.',
      href: '/salary',
      color: '#d97706',
      bg: '#fffbeb',
      credits: 'Pro+',
      tag: plan === 'pro' || plan === 'premium' ? '✨ Active' : '🔒 Pro',
      requiredPlan: 'pro'
    },
    {
      icon: '💳',
      label: 'Upgrade Plan',
      desc: 'Get more credits and unlock all features.',
      href: '/billing',
      color: '#0891b2',
      bg: '#ecfeff',
      credits: '₹99/mo',
      tag: null,
      requiredPlan: null
    },
    {
      title: 'Voice Mock Interview',
      desc: 'AI analyzes tone, pace & confidence',
      icon: '🎤',
      href: '/mock-interview',
      color: '#7c3aed',
      badge: 'NEW'
    },
    // Add Buy Credits card to quick actions
    {
      title: 'Buy Credits',
      desc: 'Purchase credits for AI features',
      icon: '⚡',
      href: '/buy-credits',
      color: '#2563eb'
    }
  ]
  {/* REFERRAL SECTION */ }
  <ReferralSection userId={user?.id || ''} userEmail={user?.email || ''} />
  const STATS = [
    { icon: '⚡', label: 'Credits Left', value: credits >= 999999 ? '∞' : credits, color: '#2563eb', bg: '#eff6ff' }, { icon: '🎖️', label: 'Current Plan', value: plan.toUpperCase(), color: planColor, bg: `rgba(255,255,255,0.05)` },
    { icon: '📊', label: 'ATS Score', value: '—', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' },
    { icon: '🔥', label: 'Day Streak', value: '1', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
  ]

  const TIPS = [
    '💡 Add quantified achievements to your resume (e.g. "Reduced load time by 40%")',
    '🎯 Research the company before your interview — know their products and values',
    '📱 Practice 10 WhatsApp questions daily to build interview confidence',
    '🔍 Always check your ATS score before applying to any job',
    '⭐ Use the STAR method for behavioral interview questions',
  ]
  const todayTip = TIPS[new Date().getDay() % TIPS.length]

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ textAlign: 'center' as const, animation: 'pulse 2s infinite' }}>
        <div style={{
          width: '64px', height: '64px',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          borderRadius: '16px', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '900', fontSize: '24px',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)'
        }}>AI</div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', letterSpacing: '0.5px' }}>Loading your dashboard...</p>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .dashboard-body {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          color: #ffffff;
          display: flex;
          overflow-x: hidden;
          position: relative;
        }

        /* Animated background elements */
        .dash-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
          animation: floatOrb 12s ease-in-out infinite;
          z-index: 0;
          pointer-events: none;
        }
        .orb-red { width: 500px; height: 500px; background: radial-gradient(circle, #ec4899, transparent); top: -200px; right: -100px; }
        .orb-blue { width: 400px; height: 400px; background: radial-gradient(circle, #3b82f6, transparent); bottom: -100px; left: -100px; animation-delay: -5s; }
        .orb-purple { width: 300px; height: 300px; background: radial-gradient(circle, #8b5cf6, transparent); top: 40%; left: 30%; animation-delay: -10s; }

        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-40px) scale(1.1); }
        }

        /* Glass sidebar */
        .sidebar {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: 260px;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column;
          z-index: 100;
          transition: all 0.3s;
        }

        /* Sidebar Nav Item */
        .nav-item {
          display: flex; alignItems: center; gap: 12px;
          padding: 12px 16px; border-radius: 12px; cursor: pointer;
          margin-bottom: 4px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        .nav-item::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
          opacity: 0; transition: opacity 0.2s; z-index: -1;
        }
        .nav-item:hover::before { opacity: 1; }
        .nav-item:hover { color: #fff; transform: translateX(4px); }
        
        .nav-item.active {
          color: #fff;
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(124, 58, 237, 0.3);
          box-shadow: inset 0 0 20px rgba(124, 58, 237, 0.1);
        }
        .nav-item.active::after {
          content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 4px; height: 60%; background: #a78bfa; border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px #a78bfa;
        }

        /* Glass Topbar */
        .topbar {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 0 40px; height: 80px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }

        /* Glass Cards */
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        
        .action-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        
        .action-icon-wrap {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-card:hover .action-icon-wrap {
          transform: scale(1.1) rotate(-5deg);
        }

        /* Staggered Animations */
        .stagger-1 { animation: slideUpFade 0.7s 0.1s both; }
        .stagger-2 { animation: slideUpFade 0.7s 0.2s both; }
        .stagger-3 { animation: slideUpFade 0.7s 0.3s both; }
        .stagger-4 { animation: slideUpFade 0.7s 0.4s both; }
        
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Gradient Text */
        .text-gradient {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Animated Progress */
        .progress-track {
          height: 8px; background: rgba(255,255,255,0.06);
          border-radius: 9999px; overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
        }
        .progress-bar {
          height: 100%; border-radius: 9999px;
          animation: fillProgress 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: left;
          box-shadow: 0 0 10px rgba(255,255,255,0.2);
        }
        @keyframes fillProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      <div className="dashboard-body">

        {/* Background Orbs */}
        <div className="dash-orb orb-red" />
        <div className="dash-orb orb-blue" />
        <div className="dash-orb orb-purple" />

        {/* ── SIDEBAR ─────────────────────────────────── */}
        <div className="sidebar">
          {/* Logo */}
          <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px', height: '40px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                borderRadius: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '16px',
                boxShadow: '0 4px 16px rgba(236, 72, 153, 0.4)'
              }}>🎯</div>
              <div>
                <div style={{ color: 'white', fontWeight: '800', fontSize: '18px', lineHeight: '1.2', letterSpacing: '0.5px' }}>AI Coach</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '500' }}>Placement Assistant</div>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
            <p style={{
              fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.15em', padding: '0 8px', marginBottom: '12px'
            }}>MAIN MENU</p>

            {[
              { icon: '🏠', label: 'Overview', tab: 'overview' },
              { icon: '📄', label: 'Resume Builder', href: '/resume' },
              { icon: '✍️', label: 'Cover Letter', href: '/cover-letter' },
              { icon: '🎯', label: 'Interview Coach', href: '/interview' },
              { icon: '📱', label: 'WhatsApp Coach', href: '/whatsapp' },
              { icon: '💰', label: 'Salary Coach', href: '/salary' },
            ].map((item, i) => (
              <div key={i}
                onClick={() => item.tab ? setActiveTab(item.tab) : router.push(item.href!)}
                className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                <span style={{ fontSize: '18px', filter: activeTab === item.tab ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none' }}>{item.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.label}</span>
              </div>
            ))}

            <p style={{
              fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.15em', padding: '32px 8px 12px'
            }}>ACCOUNT</p>

            {[
              { icon: '💳', label: 'Billing & Plans', href: '/billing' },
              { icon: '⚙️', label: 'Settings', href: '/dashboard' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="nav-item">
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div style={{
            padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '16px', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
              <div style={{ color: '#a78bfa', fontSize: '12px', marginTop: '2px', fontWeight: '500' }}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </div>
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '8px',
              color: 'rgba(255,255,255,0.7)', fontSize: '12px', cursor: 'pointer',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              title="Sign Out">
              🚪
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT ───────────────────────────── */}
        <div style={{ marginLeft: '260px', flex: 1, zIndex: 10 }}>

          {/* Top Bar */}
          <div className="topbar">
            <div className="stagger-1">
              <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                {greeting}, <span className="text-gradient">{firstName}</span> 👋
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="stagger-1">

              {/* Credits pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '10px 20px',
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: credits <= 3 ? '#ef4444' : '#10b981',
                  boxShadow: `0 0 10px ${credits <= 3 ? '#ef4444' : '#10b981'}`
                }} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                  {credits >= 999999 ? 'Unlimited' : credits} Credits
                </span>
              </div>

              {/* Plan badge */}
              <div style={{
                padding: '10px 16px', borderRadius: '14px',
                background: `${planColor}20`,
                border: `1px solid ${planColor}40`,
                boxShadow: `inset 0 0 15px ${planColor}20`
              }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: planColor, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {plan}
                </span>
              </div>

              {/* Upgrade button */}
              {plan === 'free' && (
                <Link href="/billing" style={{
                  padding: '12px 24px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  textDecoration: 'none', fontSize: '14px',
                  fontWeight: '700', color: 'white',
                  boxShadow: '0 8px 25px rgba(236, 72, 153, 0.4)',
                  transition: 'transform 0.2s',
                  display: 'inline-block'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  ⚡ Upgrade Pro
                </Link>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>

            {/* Daily Tip */}
            <div className="glass-card stagger-1" style={{
              padding: '24px 32px', marginBottom: '32px', display: 'flex',
              alignItems: 'center', gap: '24px',
              background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.1), rgba(37, 99, 235, 0.05))',
              borderLeft: '4px solid #a78bfa'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
                background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)'
              }}>💡</div>
              <div>
                <p style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '800', letterSpacing: '0.15em', marginBottom: '6px' }}>
                  DAILY STRATEGY
                </p>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.6', fontWeight: '500' }}>{todayTip}</p>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px', marginBottom: '40px'
            }}>
              {STATS.map((stat, i) => (
                <div key={i} className={`glass-card stagger-2`} style={{
                  padding: '24px', display: 'flex', alignItems: 'center', gap: '20px',
                  animationDelay: `${0.1 + i * 0.1}s`
                }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '18px',
                    background: stat.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0,
                    border: `1px solid ${stat.color}30`
                  }}>{stat.icon}</div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px' }}>{stat.label}</p>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: stat.color, lineHeight: '1', textShadow: `0 0 20px ${stat.color}40` }}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Low credits warning */}
            {credits <= 3 && credits !== 999999 && (
              <div className="glass-card stagger-3" style={{
                background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                padding: '20px 32px', marginBottom: '32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderLeft: '4px solid #ef4444'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.5))' }}>⚠️</span>
                  <div>
                    <p style={{ fontWeight: '800', color: '#fca5a5', fontSize: '18px' }}>
                      Critically Low Credits ({credits} remaining)
                    </p>
                    <p style={{ color: 'rgba(252, 165, 165, 0.7)', fontSize: '14px', marginTop: '4px' }}>
                      Don't lose your progress. Upgrade your plan to keep using AI features securely.
                    </p>
                  </div>
                </div>
                <Link href="/billing" style={{
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  color: 'white', padding: '14px 28px', borderRadius: '14px',
                  textDecoration: 'none', fontSize: '15px', fontWeight: '800',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
                  transition: 'transform 0.2s', display: 'block'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  Upgrade Now →
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="stagger-3" style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
                  Launchpad
                </h3>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: '500' }}>
                  {credits >= 999999 ? 'Unlimited' : credits} credits available
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {QUICK_ACTIONS.map((action, i) => (
                  <Link key={i}
                    href={(() => {
                      const h: Record<string, number> = { free: 0, basic: 1, pro: 2, premium: 3 }
                      const locked = action.requiredPlan && (h[plan] ?? 0) < (h[action.requiredPlan] ?? 0)
                      return locked ? '/billing' : action.href
                    })()}
                    className="glass-card action-card"
                    style={{ padding: '32px', textDecoration: 'none', display: 'block' }}
                  >
                    {/* Tag */}
                    {action.tag && (
                      <div style={{
                        position: 'absolute', top: '24px', right: '24px',
                        background: action.bg,
                        border: `1px solid ${action.color}40`,
                        color: action.color,
                        fontSize: '11px', fontWeight: '800',
                        padding: '4px 12px', borderRadius: '8px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        boxShadow: `0 4px 10px ${action.bg}`
                      }}>{action.tag}</div>
                    )}
                    {/* Lock overlay for premium features */}
                    {action.requiredPlan && (() => {
                      const h: Record<string, number> = { free: 0, basic: 1, pro: 2, premium: 3 }
                      return (h[plan] ?? 0) < (h[action.requiredPlan] ?? 0)
                    })() && (
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: '20px',
                          background: 'rgba(0,0,0,0.5)',
                          backdropFilter: 'blur(4px)',
                          display: 'flex', flexDirection: 'column' as const,
                          alignItems: 'center', justifyContent: 'center', gap: '8px',
                          zIndex: 10
                        }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '16px',
                            background: 'rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                          }}>🔒</div>
                          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '700' }}>
                            {action.requiredPlan.charAt(0).toUpperCase() + action.requiredPlan.slice(1)} Required
                          </p>
                          <span style={{
                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                            color: 'white', fontSize: '12px', fontWeight: '700',
                            padding: '6px 16px', borderRadius: '10px'
                          }}>Upgrade →</span>
                        </div>
                      )}

                    {/* Icon */}
                    <div className="action-icon-wrap" style={{
                      width: '64px', height: '64px', borderRadius: '18px',
                      background: action.bg, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '32px', marginBottom: '24px',
                      border: `1px solid ${action.color}30`,
                      boxShadow: `inset 0 0 20px ${action.bg}`
                    }}>{action.icon}</div>

                    <h4 style={{
                      fontSize: '20px', fontWeight: '800',
                      color: '#fff', marginBottom: '8px'
                    }}>{action.label}</h4>

                    <p style={{
                      color: 'rgba(255,255,255,0.6)', fontSize: '14px',
                      lineHeight: '1.6', marginBottom: '24px'
                    }}>{action.desc}</p>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      <span style={{
                        fontSize: '13px', fontWeight: '700',
                        color: action.color, background: action.bg,
                        padding: '6px 14px', borderRadius: '10px'
                      }}>{action.credits}</span>
                      <span style={{ color: action.color, fontSize: '20px', fontWeight: '300' }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="stagger-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

              {/* Progress Card */}
              <div className="glass-card" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>📊</span> Readiness Score
                </h3>
                {[
                  { label: 'Resume Quality', value: mounted ? 75 : 0, color: '#3b82f6', icon: '📄' },
                  { label: 'Interview Prep', value: mounted ? 45 : 0, color: '#8b5cf6', icon: '🎯' },
                  { label: 'Practice Questions', value: mounted ? 15 : 0, color: '#10b981', icon: '📱' },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>{item.icon}</span> {item.label}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: item.color, textShadow: `0 0 10px ${item.color}80` }}>{item.value}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-bar" style={{
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                        transform: `scaleX(${item.value / 100})`
                      }} />
                    </div>
                  </div>
                ))}

                <div style={{
                  background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: '16px', padding: '16px 24px', marginTop: '16px',
                  display: 'flex', gap: '16px', alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: '24px', marginTop: '-2px' }}>🔥</span>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', fontWeight: '500' }}>
                    Your resume score is looking good! Complete 2 more mock interviews to boost your interview readiness above 50%.
                  </p>
                </div>
              </div>

              {/* Get Started Guide */}
              <div className="glass-card" style={{
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05))',
                borderColor: 'rgba(124, 58, 237, 0.2)'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🚀</span> Master Plan
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', marginBottom: '32px', fontWeight: '500' }}>
                  Follow these steps to maximize your hiring chances.
                </p>
                {[
                  { step: '01', label: 'Build your AI-optimized resume', href: '/resume', done: true },
                  { step: '02', label: 'Practice 10 mock interview Q&As', href: '/interview', done: false },
                  { step: '03', label: 'Score your resume against job descriptions', href: '/resume', done: false },
                  { step: '04', label: 'Activate WhatsApp daily coaching', href: '/whatsapp', done: false },
                ].map((item, i) => (
                  <Link key={i} href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 20px', borderRadius: '16px',
                    textDecoration: 'none', marginBottom: '12px',
                    background: item.done ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid ' + (item.done ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)'),
                    transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateX(6px)'
                      e.currentTarget.style.background = item.done ? 'rgba(16, 185, 129, 0.1)' : 'rgba(124, 58, 237, 0.1)'
                      e.currentTarget.style.borderColor = item.done ? 'rgba(16, 185, 129, 0.4)' : 'rgba(124, 58, 237, 0.3)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateX(0)'
                      e.currentTarget.style.background = item.done ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.borderColor = item.done ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
                      background: item.done ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: item.done ? '0 4px 10px rgba(16,185,129,0.3)' : 'none',
                      border: item.done ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <span style={{ color: item.done ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '800' }}>
                        {item.done ? '✓' : item.step}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '15px', fontWeight: '600', flex: 1,
                      color: item.done ? 'rgba(255,255,255,0.5)' : '#fff',
                      textDecoration: item.done ? 'line-through' : 'none'
                    }}>{item.label}</span>
                    <span style={{
                      color: item.done ? '#10b981' : '#a78bfa',
                      fontSize: '20px', fontWeight: '300',
                      opacity: item.done ? 0 : 1, transition: 'opacity 0.2s'
                    }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div >
      {/* ADMIN SUPER WIDGET — shows for admin */}
      {(user?.email === 'your-admin-email@gmail.com' || process.env.NEXT_PUBLIC_ADMIN_KEY === 'admin123') && (
        <AdminSuperWidget adminKey={process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123'} />
      )}
      {/* Referral Section */}
      {user && <ReferralSection userId={user.id} userEmail={user.email} />}

      {/* Buy Credits Banner */}
      <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>⚡ Need more credits?</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Buy credits instantly — starts from ₹49 for 50 credits</p>
        </div>
        <Link href="/buy-credits" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '10px', color: 'white', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
          Buy Credits →
        </Link>
      </div>
    </>
  )
}
