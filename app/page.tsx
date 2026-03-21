'use client'
import { useState } from 'react'
import Link from 'next/link'

const MEGA_MENUS = {
  'Resume Builder': {
    sections: [
      {
        title: 'Build Your Resume',
        items: [
          { icon: '✨', label: 'AI Resume Builder', href: '/resume', desc: 'AI writes your resume in seconds' },
          { icon: '📝', label: 'Manual Builder', href: '/resume/manual', desc: 'Choose template & fill yourself' },
          { icon: '📤', label: 'Upload & Improve', href: '/resume', desc: 'Improve your existing resume' },
        ]
      },
      {
        title: 'Resume By Role',
        items: [
          { icon: '💻', label: 'Software Engineer', href: '/resume', desc: 'For IT & tech freshers' },
          { icon: '📊', label: 'Data Analyst', href: '/resume', desc: 'For analytics roles' },
          { icon: '🎓', label: 'Fresh Graduate', href: '/resume', desc: 'For college freshers' },
          { icon: '💼', label: 'MBA Graduate', href: '/resume', desc: 'For management roles' },
        ]
      }
    ],
    popular: ['Software Engineer', 'Data Analyst', 'Fresh Graduate', 'MBA', 'HR Executive'],
    preview: { title: '10+ Professional Templates', desc: 'ATS-friendly templates for Indian market', stat: '50,000+ resumes created' }
  },
  'Interview Prep': {
    sections: [
      {
        title: 'Practice Interviews',
        items: [
          { icon: '🏢', label: 'TCS Interview Prep', href: '/interview', desc: 'NQT, Technical & HR rounds' },
          { icon: '🏢', label: 'Infosys Prep', href: '/interview', desc: 'InfyTQ & placement rounds' },
          { icon: '🏢', label: 'Wipro Prep', href: '/interview', desc: 'WILP & campus placement' },
          { icon: '🏢', label: 'Amazon Prep', href: '/interview', desc: 'SDE & business analyst' },
        ]
      },
      {
        title: 'Interview Types',
        items: [
          { icon: '💻', label: 'Technical Round', href: '/interview', desc: 'Coding & concept questions' },
          { icon: '🤝', label: 'HR Round', href: '/interview', desc: 'Behavioral questions' },
          { icon: '🧮', label: 'Aptitude Round', href: '/interview', desc: 'Logical & quantitative' },
          { icon: '🎤', label: 'Mock Interview', href: '/interview', desc: 'AI evaluates your answers' },
        ]
      }
    ],
    popular: ['TCS NQT', 'Infosys', 'Wipro', 'Accenture', 'Campus Placement'],
    preview: { title: '15+ Companies Covered', desc: 'Real interview questions from actual drives', stat: '85% interview success rate' }
  },
  'Tools': {
    sections: [
      {
        title: 'AI Tools',
        items: [
          { icon: '🔍', label: 'ATS Score Checker', href: '/resume', desc: 'Check resume vs job description' },
          { icon: '🤖', label: 'AI Assistant', href: '/resume', desc: 'Ask anything about your career' },
          { icon: '💰', label: 'Salary Negotiator', href: '/billing', desc: 'Get the best salary offer' },
          { icon: '🤖', label: 'AI Assistant', href: '/ai-coach', desc: 'Ask anything about your career' },
          { icon: '📋', label: 'Cover Letter Gen', href: '/resume', desc: 'AI writes your cover letter' },
        ]
      },
      {
        title: 'Daily Practice',
        items: [
          { icon: '📱', label: 'WhatsApp Coach', href: '/whatsapp', desc: '10 questions daily on WhatsApp' },
          { icon: '📊', label: 'Progress Tracker', href: '/dashboard', desc: 'Track your improvement' },
          { icon: '🎯', label: 'Skill Gap Analyzer', href: '/dashboard', desc: 'Find what skills to learn' },
        ]
      }
    ],
    popular: ['ATS Checker', 'WhatsApp Coach', 'AI Assistant', 'Cover Letter'],
    preview: { title: 'AI-Powered Tools', desc: 'Everything you need to land your dream job', stat: '10,000+ students placed' }
  },
  'Pricing': {
    sections: [
      {
        title: 'Individual Plans',
        items: [
          { icon: '🆓', label: 'Free Plan', href: '/billing', desc: '10 credits — no card needed' },
          { icon: '⚡', label: 'Basic ₹99/mo', href: '/billing', desc: '50 credits per month' },
          { icon: '🚀', label: 'Pro ₹299/mo', href: '/billing', desc: '200 credits + WhatsApp' },
          { icon: '👑', label: 'Premium ₹499/mo', href: '/billing', desc: 'Unlimited everything' },
        ]
      },
      {
        title: 'For Colleges',
        items: [
          { icon: '🎓', label: 'College Plan', href: '/billing', desc: 'Bulk pricing for institutions' },
          { icon: '🏫', label: 'Placement Cell', href: '/billing', desc: 'Dashboard for placement officers' },
        ]
      }
    ],
    popular: ['Free Plan', 'Pro Plan', 'College Plan'],
    preview: { title: 'Start Free Today', desc: '10 free credits on signup. No card required.', stat: 'Plans from ₹99/month' }
  }
}

const STATS = [
  { number: '50,000+', label: 'Resumes Created' },
  { number: '85%', label: 'Interview Success Rate' },
  { number: '10,000+', label: 'Students Placed' },
  { number: '4.8★', label: 'Average Rating' }
]

const FEATURES = [
  { icon: '✨', title: 'AI-Powered Resume Builder', desc: 'Claude AI writes your resume in seconds. ATS-optimized for Indian companies like TCS, Infosys, Wipro.', iconBg: '#2563eb' },
  { icon: '📝', title: 'Professional Templates', desc: 'Choose from 10+ professional templates. Customize colors, fonts and layout to match your style.', iconBg: '#7c3aed' },
  { icon: '🎯', title: 'Company Interview Prep', desc: 'Company-specific questions for TCS, Infosys, Wipro, Amazon, Google and 15+ more companies.', iconBg: '#16a34a' },
  { icon: '📱', title: 'WhatsApp Daily Coach', desc: '10 practice questions every day on WhatsApp. AI evaluates your answers and gives feedback.', iconBg: '#d97706' },
  { icon: '🔍', title: 'ATS Score Checker', desc: 'See how your resume performs against real job descriptions. Fix missing keywords instantly.', iconBg: '#dc2626' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Ask anything about your resume, interview prep or job search. Powered by Claude AI.', iconBg: '#059669' }
]

const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'Software Engineer at TCS', text: 'Got placed at TCS in just 2 weeks of using AI Placement Coach. The mock interviews were exactly like the real ones!', avatar: 'RS', color: '#2563eb' },
  { name: 'Priya Patel', role: 'Data Analyst at Infosys', text: 'The resume builder created a perfect ATS-friendly resume. Got 3 interview calls in the first week!', avatar: 'PP', color: '#7c3aed' },
  { name: 'Amit Kumar', role: 'Full Stack Dev at Wipro', text: 'Daily WhatsApp questions kept me practicing every day. Best investment I made for my placement!', avatar: 'AK', color: '#16a34a' }
]

function JourneySection() {
  const [activeStep, setActiveStep] = useState(0)

  const STEPS = [
    {
      number: '1', label: 'Get Noticed', icon: '📄', color: '#2563eb',
      title: 'Build a Resume That Gets Noticed',
      desc: 'Our AI analyzes thousands of successful resumes to create yours. ATS-optimized, professionally formatted, and tailored for Indian companies.',
      preview: (
        <div style={{ padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #6d28d9)', padding: '16px 20px' }}>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>RAHUL SHARMA</div>
              <div style={{ color: '#bfdbfe', fontSize: '11px', marginTop: '3px' }}>Software Engineer • Nagpur, India</div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {[{ label: 'ATS Score', value: '92%', color: '#16a34a' }, { label: 'Keywords Match', value: '18/20', color: '#2563eb' }, { label: 'Format Score', value: '100%', color: '#7c3aed' }].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: item.color, background: item.color + '15', padding: '3px 10px', borderRadius: '6px' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
            {['10+ Templates', 'AI-Powered', 'ATS Optimized', 'PDF Download'].map((f, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#16a34a', fontSize: '14px', fontWeight: '700' }}>✓</span>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      number: '2', label: 'Get Hired', icon: '🎯', color: '#7c3aed',
      title: 'Ace Every Interview Round',
      desc: 'Practice with real questions from TCS, Infosys, Wipro and 15+ companies. AI evaluates your answers and shows you how to improve.',
      preview: (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[{ name: 'TCS', role: 'Software Engineer', tag: 'Recommended', color: '#2563eb' }, { name: 'Infosys', role: 'Systems Engineer', tag: 'Shortlist', color: '#7c3aed' }, { name: 'Wipro', role: 'Project Engineer', tag: 'Apply', color: '#059669' }, { name: 'Accenture', role: 'Associate Software', tag: 'Apply', color: '#d97706' }].map((company, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: company.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: company.color }}>{company.name[0]}</div>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: company.color, background: company.color + '15', padding: '2px 8px', borderRadius: '6px' }}>{company.tag}</span>
                </div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>{company.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{company.role}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700' }}>AI</div>
              <div>
                <p style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>AI Coach Feedback</p>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>"Good answer! Add a specific example using the STAR method to score higher."</p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px' }}>Score: 7/10</span>
                  <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px' }}>+3 tips given</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: '3', label: 'Get Paid More', icon: '💰', color: '#059669',
      title: 'Negotiate Your Best Salary',
      desc: 'Know your market value. Get exact scripts to negotiate your salary confidently. Our AI helps you get 20-30% more than your initial offer.',
      preview: (
        <div style={{ padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.08em' }}>SALARY NEGOTIATION RESULT</p>
            {[{ label: 'Initial Offer', amount: '₹3.5 LPA', color: '#94a3b8', width: '50%' }, { label: 'Market Rate', amount: '₹5.2 LPA', color: '#2563eb', width: '74%' }, { label: 'After Negotiation', amount: '₹6.0 LPA', color: '#16a34a', width: '86%' }].map((item, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: item.color }}>{item.amount}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: item.width, background: item.color, borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
            <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🎉</span>
              <div>
                <p style={{ fontWeight: '700', color: '#166534', fontSize: '13px' }}>+₹2.5 LPA increase achieved!</p>
                <p style={{ color: '#16a34a', fontSize: '11px' }}>71% higher than initial offer</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: '4', label: 'Get Promoted', icon: '🏆', color: '#d97706',
      title: 'Build Your Career Long Term',
      desc: 'Track your progress, improve your skills, and keep growing. Daily WhatsApp coaching keeps you sharp even after placement.',
      preview: (
        <div style={{ padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
            <div style={{ background: '#128C7E', borderRadius: '8px 8px 0 0', padding: '10px 14px', margin: '-16px -16px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px' }}>🤖</div>
              <div>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '12px' }}>AI Placement Coach</div>
                <div style={{ color: '#dcfce7', fontSize: '10px' }}>Daily Practice • 8:00 PM</div>
              </div>
            </div>
            <div style={{ background: '#dcfce7', borderRadius: '0 12px 12px 12px', padding: '10px 12px', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '6px' }}>🎯 Daily Interview Practice</p>
              <p style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6' }}>Q1. Tell me about yourself.<br />Q2. Why do you want to join TCS?<br />Q3. What is your greatest strength?</p>
              <p style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>Reply with your answer for AI feedback! 💪</p>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' as const }}>8:00 PM ✓✓</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[{ label: 'Day Streak', value: '21 days 🔥', color: '#d97706' }, { label: 'Questions Done', value: '210 ✅', color: '#2563eb' }, { label: 'Avg Score', value: '8.2/10 ⭐', color: '#7c3aed' }, { label: 'Ready For', value: 'TCS Round 1', color: '#16a34a' }].map((item, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px' }}>
                <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontSize: '13px', fontWeight: '700', color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: '24px', alignItems: 'start' }}>
      {/* Left Steps */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {STEPS.map((step, i) => (
          <div key={i} onClick={() => setActiveStep(i)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px', cursor: 'pointer', borderLeft: activeStep === i ? `3px solid ${step.color}` : '3px solid transparent', background: activeStep === i ? step.color + '08' : 'transparent', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (activeStep !== i) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
            onMouseLeave={e => { if (activeStep !== i) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, background: activeStep === i ? step.color : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', transition: 'all 0.2s' }}>{step.icon}</div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: activeStep === i ? step.color : '#94a3b8', letterSpacing: '0.06em', marginBottom: '3px' }}>STEP {step.number}</p>
              <p style={{ fontSize: '15px', fontWeight: '700', color: activeStep === i ? '#0f172a' : '#64748b' }}>{step.label}</p>
            </div>
            {activeStep === i && <div style={{ marginLeft: 'auto', color: step.color, fontSize: '18px' }}>→</div>}
          </div>
        ))}
      </div>

      {/* Middle */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: STEPS[activeStep].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px' }}>{STEPS[activeStep].icon}</div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: STEPS[activeStep].color, letterSpacing: '0.08em', marginBottom: '10px' }}>STEP {STEPS[activeStep].number} OF 4</div>
        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3', marginBottom: '16px' }}>{STEPS[activeStep].title}</h3>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.8', marginBottom: '28px' }}>{STEPS[activeStep].desc}</p>
        <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '12px', background: STEPS[activeStep].color, textDecoration: 'none', color: 'white', fontSize: '14px', fontWeight: '700' }}>
          Get Started Free <span>→</span>
        </Link>
        <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setActiveStep(i)} style={{ width: activeStep === i ? '24px' : '8px', height: '8px', borderRadius: '9999px', background: activeStep === i ? STEPS[activeStep].color : '#e2e8f0', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Right Preview */}
      <div style={{ background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />)}
          <span style={{ color: '#475569', fontSize: '11px', marginLeft: '8px', fontWeight: '500' }}>Live Preview</span>
        </div>
        {STEPS[activeStep].preview}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflowX: 'hidden' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '68px', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '14px' }}>AI</div>
            <div>
              <span style={{ fontWeight: '800', fontSize: '17px', color: '#111827' }}>Placement</span>
              <span style={{ fontWeight: '800', fontSize: '17px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Coach</span>
            </div>
          </Link>

          {/* Nav Items */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {Object.keys(MEGA_MENUS).map((menuKey) => (
              <div key={menuKey} style={{ position: 'relative' as const }} onMouseEnter={() => setActiveMenu(menuKey)} onMouseLeave={() => setActiveMenu(null)}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', border: 'none', background: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', color: activeMenu === menuKey ? '#2563eb' : '#374151', borderRadius: '8px', transition: 'all 0.15s' }}>
                  {menuKey}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: activeMenu === menuKey ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                {activeMenu === menuKey && (
                  <div style={{ position: 'absolute' as const, top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '16px', boxShadow: '0 24px 80px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', padding: '24px', width: '700px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', zIndex: 1000 }}>
                    <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {MEGA_MENUS[menuKey as keyof typeof MEGA_MENUS].sections.map((section, si) => (
                        <div key={si}>
                          <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '12px' }}>{section.title}</p>
                          {section.items.map((item, ii) => (
                            <Link key={ii} href={item.href} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 10px', borderRadius: '8px', textDecoration: 'none', marginBottom: '2px', transition: 'background 0.15s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>{item.label}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', lineHeight: '1.3' }}>{item.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}
                      <div style={{ gridColumn: '1 / 3', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Most Popular</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {MEGA_MENUS[menuKey as keyof typeof MEGA_MENUS].popular.map((p, pi) => (
                            <Link key={pi} href="/resume" style={{ padding: '5px 12px', borderRadius: '9999px', background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: '500', textDecoration: 'none', transition: 'all 0.15s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; (e.currentTarget as HTMLElement).style.color = '#2563eb' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569' }}
                            >{p}</Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' }}>
                      <div style={{ background: 'white', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                        <div style={{ height: '8px', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: '4px', marginBottom: '8px', width: '70%' }} />
                        {[90, 100, 75, 85].map((w, i) => <div key={i} style={{ height: '5px', background: '#e5e7eb', borderRadius: '3px', marginBottom: '5px', width: `${w}%` }} />)}
                        <div style={{ marginTop: '8px', padding: '6px 8px', background: '#f0fdf4', borderRadius: '6px' }}>
                          <span style={{ color: '#16a34a', fontSize: '10px', fontWeight: '700' }}>ATS Score: 92%</span>
                        </div>
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>{MEGA_MENUS[menuKey as keyof typeof MEGA_MENUS].preview.title}</p>
                        <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5', marginBottom: '12px' }}>{MEGA_MENUS[menuKey as keyof typeof MEGA_MENUS].preview.desc}</p>
                        <div style={{ background: 'rgba(37,99,235,0.2)', borderRadius: '6px', padding: '8px 10px' }}>
                          <span style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '600' }}>📈 {MEGA_MENUS[menuKey as keyof typeof MEGA_MENUS].preview.stat}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/career-center" style={{ padding: '9px 18px', borderRadius: '9px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Career Center
            </Link>
            <Link href="/login" style={{ padding: '9px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', textDecoration: 'none', fontSize: '14px', fontWeight: '500', color: '#374151', background: 'white' }}>
              Sign In
            </Link>
            <Link href="/register" style={{ padding: '9px 20px', borderRadius: '9px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', color: 'white', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
              Create My Resume
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 45%, #0f2744 100%)', display: 'flex', alignItems: 'center', paddingTop: '68px', position: 'relative' as const, overflow: 'hidden' }}>
        <div style={{ position: 'absolute' as const, top: '15%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute' as const, bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute' as const, inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', width: '100%', display: 'grid', gridTemplateColumns: '55% 45%', gap: '60px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '9999px', padding: '7px 18px', marginBottom: '28px' }}>
              <span style={{ fontSize: '14px' }}>🇮🇳</span>
              <span style={{ color: '#93c5fd', fontSize: '13px', fontWeight: '600' }}>India's #1 AI Placement Platform</span>
            </div>
            <h1 style={{ fontSize: '58px', fontWeight: '900', lineHeight: '1.1', color: 'white', marginBottom: '8px' }}>This resume builder</h1>
            <h1 style={{ fontSize: '58px', fontWeight: '900', lineHeight: '1.1', marginBottom: '28px' }}>
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>gets you placed</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: '1.75', marginBottom: '16px', maxWidth: '520px' }}>Only 2% of resumes win. Yours will be one of them.</p>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7', marginBottom: '40px', maxWidth: '480px' }}>AI-powered resume builder + TCS/Infosys/Wipro interview prep + daily WhatsApp coaching. Built for Indian freshers.</p>
            <div style={{ display: 'flex', gap: '14px', marginBottom: '48px' }}>
              <Link href="/register" style={{ padding: '16px 36px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', textDecoration: 'none', fontSize: '16px', fontWeight: '700', color: 'white', boxShadow: '0 8px 32px rgba(37,99,235,0.4)', display: 'inline-block' }}>
                Build My Resume Free →
              </Link>
              <Link href="/interview" style={{ padding: '16px 28px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', fontSize: '16px', fontWeight: '600', color: 'white', background: 'rgba(255,255,255,0.04)', display: 'inline-block' }}>
                Try Interview Prep
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {[{ icon: '✅', text: '39% more likely to land the job' }, { icon: '🔒', text: 'No credit card required' }, { icon: '⚡', text: 'Ready in 60 seconds' }].map((badge, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>{badge.icon}</span>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Mockup */}
          <div style={{ position: 'relative' as const, padding: '20px' }}>
            <div style={{ position: 'absolute' as const, inset: '0', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }} />
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', overflow: 'hidden', position: 'relative' as const, zIndex: 2 }}>
              <div style={{ background: 'linear-gradient(135deg, #1e40af, #6d28d9)', padding: '20px 24px' }}>
                <div style={{ color: 'white', fontWeight: '800', fontSize: '20px', letterSpacing: '0.05em' }}>RAHUL SHARMA</div>
                <div style={{ color: '#bfdbfe', fontSize: '12px', marginTop: '4px' }}>Software Engineer • rahul@gmail.com • +91 9876543210</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'].map((c, i) => (
                    <div key={i} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, border: c === '#3b82f6' ? '2px solid white' : 'none' }} />
                  ))}
                </div>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {[{ title: 'PROFESSIONAL SUMMARY', lines: [100, 90] }, { title: 'SKILLS', lines: [70, 85, 60] }, { title: 'WORK EXPERIENCE', lines: [95, 80, 85] }, { title: 'EDUCATION', lines: [90, 70] }].map((section, si) => (
                  <div key={si} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#1e40af', letterSpacing: '0.12em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                      {section.title}
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    </div>
                    {section.lines.map((w, li) => <div key={li} style={{ height: '7px', background: li === 0 ? '#e2e8f0' : '#f1f5f9', borderRadius: '4px', marginBottom: '6px', width: `${w}%` }} />)}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute' as const, top: '8px', right: '-8px', background: 'white', borderRadius: '12px', padding: '12px 16px', zIndex: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Resume Score</div>
              <div style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(135deg, #16a34a, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>81%</div>
            </div>
            <div style={{ position: 'absolute' as const, bottom: '8px', right: '-8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '10px', padding: '10px 14px', zIndex: 3, boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
              <div style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>🤖 ATS Perfect</div>
            </div>
            <div style={{ position: 'absolute' as const, top: '40%', left: '-16px', background: 'white', borderRadius: '10px', padding: '10px 14px', zIndex: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Skills ✏️</div>
              {['Management Skills', 'Analytical Thinking', 'Leadership'].map((s, i) => (
                <div key={i} style={{ background: '#f1f5f9', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', color: '#475569', marginBottom: '3px', fontWeight: '500' }}>{s}</div>
              ))}
              <div style={{ color: '#2563eb', fontSize: '11px', fontWeight: '600', marginTop: '4px' }}>+ Add skill</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: 'white', padding: '28px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#16a34a', fontSize: '20px' }}>●</span>
            <span style={{ fontWeight: '700', fontSize: '22px', color: '#111827' }}>56,685</span>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>resumes created today</span>
          </div>
          {STATS.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <div style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.number}</div>
              <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '96px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '700', padding: '6px 16px', borderRadius: '9999px', marginBottom: '16px', letterSpacing: '0.05em' }}>EVERYTHING YOU NEED</div>
            <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', lineHeight: '1.2' }}>Your Complete Placement Toolkit</h2>
            <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '560px', margin: '0 auto', lineHeight: '1.7' }}>From resume to offer letter — we cover every step of your placement journey.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)'; el.style.borderColor = '#c7d2fe' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.borderColor = '#e2e8f0' }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNEY SECTION */}
      <section style={{ padding: '96px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '700', padding: '6px 16px', borderRadius: '9999px', marginBottom: '16px', letterSpacing: '0.05em' }}>YOUR PLACEMENT JOURNEY</div>
            <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', lineHeight: '1.2' }}>Everything you need,<br />in one place</h2>
            <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '480px', margin: '0 auto' }}>From building your resume to landing your dream job — we guide every step.</p>
          </div>
          <JourneySection />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '96px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: '64px' }}>
            <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Students love AI Placement Coach</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ color: '#fbbf24', fontSize: '20px' }}>★★★★★</span>
              <span style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a' }}>4.8 out of 5</span>
              <span style={{ color: '#94a3b8' }}>• 10,000+ reviews</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#fbbf24', fontSize: '20px', marginBottom: '20px' }}>★★★★★</div>
                <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.8', marginBottom: '24px', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '15px' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{t.name}</div>
                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 24px', background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)', position: 'relative' as const, overflow: 'hidden' }}>
        <div style={{ position: 'absolute' as const, inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' as const, position: 'relative' as const }}>
          <h2 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '20px', lineHeight: '1.15' }}>Start free. Upgrade<br />when you are ready.</h2>
          <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px', lineHeight: '1.7' }}>10 free credits on signup. No credit card required. Plans from ₹99/month.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
            <Link href="/register" style={{ padding: '18px 48px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', textDecoration: 'none', fontSize: '18px', fontWeight: '700', color: 'white', boxShadow: '0 8px 32px rgba(37,99,235,0.4)', display: 'inline-block' }}>Get Started Free →</Link>
            <Link href="/billing" style={{ padding: '18px 32px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', fontSize: '18px', fontWeight: '600', color: 'white', background: 'rgba(255,255,255,0.05)', display: 'inline-block' }}>View Pricing</Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
            {['UPI Accepted', 'Cancel Anytime', 'Indian Support'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#16a34a', fontSize: '14px' }}>✓</span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0f1a', padding: '64px 24px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: '48px', marginBottom: '64px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '13px' }}>AI</div>
                <span style={{ fontWeight: '800', color: 'white', fontSize: '17px' }}>Placement<span style={{ color: '#60a5fa' }}>Coach</span></span>
              </div>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8', maxWidth: '300px', marginBottom: '24px' }}>India's most advanced AI placement preparation platform. Built specifically for Indian students and freshers.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['🇮🇳 Made in India', '🔒 Secure Payments'].map((b, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', color: '#64748b', fontSize: '12px', fontWeight: '500' }}>{b}</div>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Resume Builder', 'Interview Coach', 'ATS Checker', 'WhatsApp Coach', 'Career Center'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'College Plans', 'Contact Us'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Cookie Policy'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '20px', letterSpacing: '0.02em' }}>{col.title}</h4>
                {col.links.map((link, j) => (
                  <div key={j} style={{ marginBottom: '12px' }}>
                    <Link href={link === 'Career Center' ? '/career-center' : link === 'Resume Builder' ? '/resume' : link === 'Interview Coach' ? '/interview' : '/'} style={{ color: '#475569', textDecoration: 'none', fontSize: '14px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                    >{link}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#334155', fontSize: '13px' }}>© 2026 AI Placement Coach. All rights reserved.</p>
            <p style={{ color: '#334155', fontSize: '13px' }}>Made with ❤️ for Indian students 🇮🇳</p>
          </div>
        </div>
      </footer>
    </div>
  )
}