'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function WhatsAppPage() {
  const [user, setUser] = useState<any>(null)
  const [phone, setPhone] = useState('')
  const [jobRole, setJobRole] = useState('Software Engineer')
  const [experience, setExperience] = useState('fresher')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('whatsapp_users')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (data) { setSubscribed(true); setPhone(data.phone || '') }
      }
    }
    load()
  }, [])

  const handleSubscribe = async () => {
    if (!phone || phone.length < 10) { showToast('Enter a valid phone number', 'error'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('whatsapp_users').upsert({
        user_id: user?.id, phone: phone.startsWith('+91') ? phone : `+91${phone}`,
        job_role: jobRole, experience_level: experience, active: true
      }, { onConflict: 'user_id' })
      if (error) throw error
      setSubscribed(true)
      showToast('🎉 Subscribed! Daily questions start tomorrow at 9 AM')
    } catch (e: any) {
      showToast(e.message || 'Failed to subscribe', 'error')
    }
    setLoading(false)
  }

  const handleUnsubscribe = async () => {
    setLoading(true)
    await supabase.from('whatsapp_users').update({ active: false }).eq('user_id', user?.id)
    setSubscribed(false)
    showToast('Unsubscribed from daily questions')
    setLoading(false)
  }

  const JOB_ROLES = ['Software Engineer', 'Data Analyst', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'QA Engineer', 'Business Analyst', 'Product Manager']

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: toast.type === 'success' ? 'rgba(22,163,74,0.95)' : 'rgba(220,38,38,0.95)', color: 'white', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>← Back to Dashboard</Link>
        <div style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', padding: '6px 16px', borderRadius: '9999px', color: 'white', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📱 WhatsApp Coach Live
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #25d366, #128c7e)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>📱</div>
        <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '900', marginBottom: '12px' }}>WhatsApp Daily Coach</h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
          Master your interviews with <strong style={{ color: 'white' }}>10 personalized questions</strong> delivered straight to your WhatsApp every day.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px' }}>

        {/* Feature Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '48px' }}>
          {['🎯 Company-specific Qs', '⏰ Daily at 9 AM', '💡 With Answers', '🏆 Track Progress', '🆓 Free for Pro+'].map((f, i) => (
            <span key={i} style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#4ade80', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>{f}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: subscribed ? '1fr' : '1fr 1fr', gap: '24px' }}>

          {/* Left — Subscribe Form */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px' }}>
            {subscribed ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ color: '#4ade80', fontWeight: '800', fontSize: '24px', marginBottom: '8px' }}>You're Subscribed!</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Daily questions will arrive at <strong style={{ color: 'white' }}>{phone}</strong></p>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>Every morning at 9:00 AM IST</p>
                <div style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                  <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>📱 Sample Question</p>
                  <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>
                    "Explain the difference between stack and heap memory in Java. Give a practical example."
                  </p>
                  <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>— Today's TCS Technical Question</p>
                </div>
                <button onClick={handleUnsubscribe} disabled={loading}
                  style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 24px', color: '#fca5a5', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  {loading ? 'Processing...' : 'Unsubscribe'}
                </button>
              </div>
            ) : (
              <div>
                <h2 style={{ color: 'white', fontWeight: '800', fontSize: '22px', marginBottom: '6px' }}>📱 Subscribe Now</h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Get 10 daily interview questions on WhatsApp</p>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WhatsApp Number</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ padding: '11px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', flexShrink: 0 }}>+91</div>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210" maxLength={10}
                      style={{ flex: 1, padding: '11px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Job Role</label>
                  <select value={jobRole} onChange={e => setJobRole(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}>
                    {JOB_ROLES.map(r => <option key={r} value={r} style={{ background: '#1e293b' }}>{r}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experience Level</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { key: 'fresher', label: '🎓 Fresher' },
                      { key: 'junior', label: '⚡ 1-3 Yrs' },
                      { key: 'mid', label: '🚀 3-5 Yrs' },
                    ].map(e => (
                      <button key={e.key} onClick={() => setExperience(e.key)}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: experience === e.key ? 'linear-gradient(135deg, #25d366, #128c7e)' : 'rgba(255,255,255,0.06)', color: experience === e.key ? 'white' : '#64748b', fontWeight: experience === e.key ? '700' : '400', cursor: 'pointer', fontSize: '13px' }}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleSubscribe} disabled={loading || !phone}
                  style={{ width: '100%', padding: '16px', background: phone ? 'linear-gradient(135deg, #25d366, #128c7e)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '14px', color: phone ? 'white' : '#334155', fontSize: '16px', fontWeight: '800', cursor: phone ? 'pointer' : 'not-allowed' }}>
                  {loading ? '⏳ Subscribing...' : '📱 Start Getting Daily Questions'}
                </button>
              </div>
            )}
          </div>

          {/* Right — Features (only show when not subscribed) */}
          {!subscribed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>🎯 What You Get Daily</h3>
                {[
                  { icon: '💻', title: '5 Technical Questions', desc: 'DSA, DBMS, OS, Networking, OOPs' },
                  { icon: '👤', title: '3 HR Questions', desc: 'Behavioral, situational, soft skills' },
                  { icon: '🧮', title: '2 Aptitude Questions', desc: 'Quant, logical reasoning, verbal' },
                  { icon: '✅', title: 'Model Answers', desc: 'Complete answers with explanations' },
                  { icon: '🏢', title: 'Company-Specific', desc: 'TCS, Infosys, Wipro, Accenture style' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: i < 4 ? '14px' : '0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{item.title}</div>
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(37,211,102,0.1), rgba(18,140,126,0.1))', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '20px' }}>
                <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>📊 Success Rate</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                  Students who practice daily questions are <strong style={{ color: 'white' }}>3x more likely</strong> to crack campus placements in top IT companies.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}