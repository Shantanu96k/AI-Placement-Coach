'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UpgradeGateProps {
  requiredPlan: 'basic' | 'pro' | 'premium'
  featureName: string
  featureDesc: string
  featureIcon: string
  children: React.ReactNode
}

const PLAN_HIERARCHY = { free: 0, basic: 1, pro: 2, premium: 3 }

const PLAN_FEATURES: Record<string, string[]> = {
  basic: [
    '50 credits per month',
    'Unlimited resume downloads',
    'Full Q&A bank access',
    'ATS score checker',
    'All interview rounds'
  ],
  pro: [
    '200 credits per month',
    'Everything in Basic',
    'WhatsApp daily questions',
    'Mock HR interview',
    'Company specific prep',
    'AI performance tracking'
  ],
  premium: [
    'Unlimited credits',
    'Everything in Pro',
    'Salary negotiation coach',
    'JD optimizer tool',
    'Priority WhatsApp support',
    'College placement portal'
  ]
}

const PLAN_PRICES: Record<string, string> = {
  basic: '₹99/month',
  pro: '₹299/month',
  premium: '₹499/month'
}

const PLAN_COLORS: Record<string, string> = {
  basic: '#2563eb',
  pro: '#7c3aed',
  premium: '#d97706'
}

export default function UpgradeGate({
  requiredPlan,
  featureName,
  featureDesc,
  featureIcon,
  children
}: UpgradeGateProps) {
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .single()

        const plan = data?.plan || 'free'
        setUserPlan(plan)

        // Check if user has required plan
        const userLevel = PLAN_HIERARCHY[plan as keyof typeof PLAN_HIERARCHY] || 0
        const requiredLevel = PLAN_HIERARCHY[requiredPlan]

        if (userLevel < requiredLevel) {
          setShowModal(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    checkPlan()
  }, [router, requiredPlan])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0f1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' as const }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '12px', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '20px'
          }}>🔒</div>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Checking access...</p>
        </div>
      </div>
    )
  }

  // Show upgrade modal if user doesn't have required plan
  if (showModal) {
    const color = PLAN_COLORS[requiredPlan]
    const features = PLAN_FEATURES[requiredPlan]
    const price = PLAN_PRICES[requiredPlan]

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
          padding: '0 24px'
        }}>
          <div style={{
            maxWidth: '800px', margin: '0 auto',
            height: '60px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between'
          }}>
            <Link href="/dashboard" style={{
              textDecoration: 'none', color: '#64748b', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              ← Back to Dashboard
            </Link>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '5px 12px',
              color: '#475569', fontSize: '12px', fontWeight: '600'
            }}>
              Current Plan: {userPlan?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '40px 24px'
        }}>
          <div style={{ maxWidth: '560px', width: '100%' }}>

            {/* Flash Banner */}
            <div style={{
              background: `${color}15`,
              border: `1px solid ${color}40`,
              borderRadius: '16px', padding: '16px 20px',
              marginBottom: '28px',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${color}25`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0
              }}>🔒</div>
              <div>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '3px' }}>
                  This feature requires {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan
                </p>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  Upgrade to unlock {featureName} and more powerful features
                </p>
              </div>
            </div>

            {/* Feature Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${color}30`,
              borderRadius: '24px', padding: '36px',
              textAlign: 'center' as const, marginBottom: '24px'
            }}>
              {/* Icon */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '24px',
                background: `${color}20`,
                border: `2px solid ${color}40`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '36px',
                margin: '0 auto 20px'
              }}>
                {featureIcon}
              </div>

              <h1 style={{
                fontSize: '28px', fontWeight: '900',
                color: 'white', marginBottom: '10px'
              }}>
                {featureName}
              </h1>

              <p style={{
                color: '#64748b', fontSize: '15px',
                lineHeight: '1.7', marginBottom: '28px',
                maxWidth: '400px', margin: '0 auto 28px'
              }}>
                {featureDesc}
              </p>

              {/* What you get */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px', padding: '20px',
                marginBottom: '28px', textAlign: 'left' as const
              }}>
                <p style={{
                  fontSize: '12px', fontWeight: '700', color: '#475569',
                  letterSpacing: '0.08em', marginBottom: '14px'
                }}>
                  WHAT YOU GET WITH {requiredPlan.toUpperCase()} PLAN
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {features.map((feature, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '8px', alignItems: 'flex-start'
                    }}>
                      <span style={{ color: color, fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      <span style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price + CTA */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '36px', fontWeight: '900',
                  color: 'white', marginBottom: '4px'
                }}>
                  {price}
                </div>
                <div style={{ color: '#475569', fontSize: '13px' }}>
                  Cancel anytime • UPI accepted
                </div>
              </div>

              <Link href="/billing" style={{
                display: 'block', padding: '16px 32px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                textDecoration: 'none', color: 'white',
                fontSize: '16px', fontWeight: '800',
                boxShadow: `0 8px 32px ${color}40`,
                marginBottom: '12px',
                transition: 'all 0.2s'
              }}>
                Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} — {price} →
              </Link>

              <Link href="/billing" style={{
                display: 'block', padding: '12px',
                color: '#475569', textDecoration: 'none',
                fontSize: '13px'
              }}>
                View all plans →
              </Link>
            </div>

            {/* Other plans hint */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '14px', padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  Not ready to upgrade?
                </p>
                <p style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>
                  Continue using free features
                </p>
              </div>
              <Link href="/dashboard" style={{
                padding: '9px 18px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', color: '#64748b',
                fontSize: '13px', fontWeight: '500'
              }}>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User has required plan — show the actual page
  return <>{children}</>
}