'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    priceNum: 0,
    credits: 10,
    creditsLabel: '10 credits total',
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#e5e7eb',
    features: [
      '10 credits on signup',
      '1 resume download',
      'Basic Q&A bank',
      'No WhatsApp coach',
      'No mock interview'
    ],
    popular: false
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '₹99',
    priceNum: 99,
    credits: 50,
    creditsLabel: '50 credits / month',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    features: [
      '50 credits per month',
      'Unlimited resume downloads',
      'Full Q&A bank access',
      'ATS score checker',
      'No WhatsApp coach'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    priceNum: 299,
    credits: 200,
    creditsLabel: '200 credits / month',
    color: '#8b5cf6',
    bgColor: '#faf5ff',
    borderColor: '#8b5cf6',
    features: [
      '200 credits per month',
      'Everything in Basic',
      'WhatsApp daily questions',
      'Mock HR interview',
      'Company specific prep'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹499',
    priceNum: 499,
    credits: 999999,
    creditsLabel: 'Unlimited credits',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
    features: [
      'Unlimited credits',
      'Everything in Pro',
      'Salary negotiation coach',
      'JD optimizer',
      'Priority WhatsApp support'
    ],
    popular: false
  }
]

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function BillingPage() {
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [currentPlan, setCurrentPlan] = useState('free')
  const [currentCredits, setCurrentCredits] = useState(0)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUserId(user.id)
        setUserEmail(user.email || '')

        const { data } = await supabase
          .from('subscriptions')
          .select('plan, credits_remaining')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setCurrentPlan(data.plan)
          setCurrentCredits(data.credits_remaining)
        }
      } catch (err) {
        console.error(err)
      }
    }
    getUser()

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [router])

  const handlePayment = async (planId: string) => {
    if (planId === 'free') return
    if (planId === currentPlan) {
      setError('You are already on this plan.')
      return
    }

    setLoading(planId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/billing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create order.')
        setLoading(null)
        return
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'AI Placement Coach',
        description: data.planName,
        order_id: data.orderId,
        prefill: { email: userEmail },
        theme: { color: planId === 'pro' ? '#8b5cf6' : planId === 'premium' ? '#f59e0b' : '#3b82f6' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/billing/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId,
              planId
            })
          })

          const verifyData = await verifyRes.json()

          if (verifyRes.ok) {
            setSuccess(`🎉 Payment successful! You are now on ${planId} plan with ${verifyData.credits >= 999999 ? 'unlimited' : verifyData.credits} credits.`)
            setCurrentPlan(planId)
            setCurrentCredits(verifyData.credits)
          } else {
            setError(verifyData.error || 'Payment verification failed.')
          }
          setLoading(null)
        },
        modal: {
          ondismiss: () => setLoading(null)
        }
      }

      if (typeof window.Razorpay === 'undefined') {
        setError('Payment system is loading. Please try again in a moment.')
        setLoading(null)
        return
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      console.error('Payment error:', err)
      setError('Payment failed. Please try again.')
      setLoading(null)
    }
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        
        .plan-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px 24px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .plan-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.95);
        }

        .plan-card.popular {
          background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.95) 100%);
          border: 2px solid #8b5cf6;
          box-shadow: 0 20px 40px -10px rgba(139, 92, 246, 0.25);
        }
        .plan-card.popular:hover {
          box-shadow: 0 30px 60px -15px rgba(139, 92, 246, 0.35);
        }

        .plan-btn {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-top: auto;
        }
        .plan-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .plan-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        
        .shimmer-text {
          background: linear-gradient(90deg, #111827 0%, #4b5563 50%, #111827 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        
        .feature-item {
          transition: all 0.2s ease;
        }
        .plan-card:hover .feature-item {
          transform: translateX(4px);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #faf5ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif"
      }}>
        
        {/* Decorative background blurs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

        {/* Navbar */}
        <nav style={{
          position: 'relative', zIndex: 10,
          background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          padding: '16px 32px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Link href="/dashboard" className="plan-btn" style={{
            color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '600'
          }}>← Back to Dashboard</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white',
              fontSize: '13px', fontWeight: '600', padding: '6px 14px', borderRadius: '9999px',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
            }}>
              🪙 {currentCredits >= 999999 ? 'Unlimited' : currentCredits} credits
            </span>
            <span style={{
              background: 'rgba(243, 244, 246, 0.8)', color: '#374151',
              fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '9999px',
              textTransform: 'uppercase', border: '1px solid #e5e7eb'
            }}>
              {currentPlan} Plan
            </span>
          </div>
        </nav>

        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 10 }}>

          {/* Header */}
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h1 className="shimmer-text" style={{
              fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px'
            }}>
              Invest in your career
            </h1>
            <p style={{ color: '#4b5563', fontSize: '18px', fontWeight: '500', maxWidth: '500px', margin: '0 auto' }}>
              Start for free, upgrade when you need more power. Cancel anytime.
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="fade-up" style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              padding: '16px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto 32px',
              fontWeight: '500', textAlign: 'center', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)'
            }}>⚠️ {error}</div>
          )}
          {success && (
            <div className="fade-up" style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669',
              padding: '16px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto 32px',
              fontWeight: '600', textAlign: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
            }}>🎉 {success}</div>
          )}

          {/* Plans Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px', marginBottom: '64px'
          }}>
            {PLANS.map((plan, idx) => (
              <div key={plan.id} className={`fade-up delay-${idx+1} plan-card ${plan.popular ? 'popular' : ''}`}>
                
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white',
                    fontSize: '13px', fontWeight: '700', padding: '6px 16px', borderRadius: '9999px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)', whiteSpace: 'nowrap',
                    animation: 'float 3s ease-in-out infinite'
                  }}>
                    Most Popular ⭐
                  </div>
                )}

                {/* Current plan badge */}
                {currentPlan === plan.id && (
                  <div style={{
                    background: '#dcfce7', color: '#065f46', fontSize: '12px', fontWeight: '700',
                    padding: '4px 12px', borderRadius: '9999px', display: 'inline-block',
                    marginBottom: '16px', alignSelf: 'flex-start', border: '1px solid #bbf7d0'
                  }}>
                    ✅ Current Plan
                  </div>
                )}
                
                {!currentPlan && !plan.popular && <div style={{ height: '28px', marginBottom: '16px' }} />}

                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
                  {plan.name}
                </h3>

                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '800', color: plan.color, letterSpacing: '-1px' }}>
                    {plan.price}
                  </span>
                  {plan.priceNum > 0 && (
                    <span style={{ color: '#6b7280', fontSize: '15px', fontWeight: '500' }}>
                      / month
                    </span>
                  )}
                </div>

                <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '28px', fontWeight: '600' }}>
                  {plan.creditsLabel}
                </p>

                {/* Features */}
                <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plan.features.map((feature, i) => {
                    const isAvailable = plan.priceNum !== 0 || i <= 2;
                    return (
                      <div key={i} className="feature-item" style={{
                        display: 'flex', gap: '12px', alignItems: 'flex-start'
                      }}>
                        <span style={{
                          color: isAvailable ? plan.color : '#9ca3af',
                          flexShrink: 0, fontSize: '16px', fontWeight: 'bold'
                        }}>
                          {isAvailable ? '✓' : '✗'}
                        </span>
                        <span style={{
                          fontSize: '14px', fontWeight: '500', lineHeight: '1.4',
                          color: isAvailable ? '#374151' : '#9ca3af',
                          textDecoration: isAvailable ? 'none' : 'line-through'
                        }}>
                          {feature}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Button */}
                <button
                  onClick={() => handlePayment(plan.id)}
                  disabled={loading === plan.id || plan.id === 'free' || currentPlan === plan.id}
                  className="plan-btn"
                  style={{
                    width: '100%',
                    background: currentPlan === plan.id ? '#e5e7eb' : plan.id === 'free' ? '#f3f4f6' : loading === plan.id ? '#cbd5e1' : plan.popular ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : plan.color,
                    color: currentPlan === plan.id || plan.id === 'free' ? '#6b7280' : 'white',
                    padding: '16px', borderRadius: '14px', border: 'none',
                    fontSize: '16px', fontWeight: '700',
                    cursor: currentPlan === plan.id || plan.id === 'free' || loading === plan.id ? 'not-allowed' : 'pointer',
                    boxShadow: currentPlan === plan.id || plan.id === 'free' ? 'none' : `0 8px 16px ${plan.color}40`,
                  }}
                >
                  {loading === plan.id
                    ? 'Processing...'
                    : currentPlan === plan.id
                      ? 'Current Plan'
                      : plan.id === 'free'
                        ? 'Free Forever'
                        : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          {/* Features Detail Matrix */}
          <div className="fade-up delay-4" style={{
            background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)',
            borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.5)',
            padding: '48px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{
              fontSize: '24px', fontWeight: '800', color: '#111827',
              marginBottom: '32px', textAlign: 'center'
            }}>
              Discover what's inside
            </h2>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px'
            }}>
              {[
                { icon: '📄', title: 'AI Resume Builder', desc: 'Craft perfect resumes optimized for ATS systems using advanced LLMs.', color: '#3b82f6' },
                { icon: '🎯', title: 'Interview Q&A Bank', desc: 'Access hundreds of real interview questions and expert model answers.', color: '#10b981' },
                { icon: '🤖', title: 'AI Mock Interview', desc: 'Practice your answers against an AI interviewer and get actionable feedback.', color: '#8b5cf6' },
                { icon: '📱', title: 'WhatsApp Coach', desc: 'Receive daily practice questions directly to your phone. Consistent prep wins.', color: '#2563eb' },
                { icon: '🔍', title: 'ATS Score Checker', desc: 'Match your resume against real job descriptions to reveal missing keywords.', color: '#f59e0b' },
                { icon: '💰', title: 'Salary Coach', desc: 'Learn exact phrases to negotiate better compensation offers. Exclusive to Premium.', color: '#ef4444' }
              ].map((item, idx) => (
                <div key={item.title} style={{ display: 'flex', gap: '16px', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{
                    fontSize: '28px', background: `${item.color}15`, width: '56px', height: '56px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '700', color: '#111827', fontSize: '16px', marginBottom: '6px' }}>{item.title}</h4>
                    <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5', fontWeight: '500' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up delay-4" style={{ textAlign: 'center', marginTop: '48px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
              🔒 Secure payments powered by <strong>Razorpay</strong>. Cancel anytime.
            </p>
          </div>

        </main>
      </div>
    </>
  )
}