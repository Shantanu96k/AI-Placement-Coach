'use client'
import { useState, useEffect } from 'react'

interface ReferralData {
  id: string
  code: string
  total_referrals: number
  successful_referrals: number
  credits_earned: number
}

export default function ReferralSection({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [referral, setReferral] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)
  const [applyCode, setApplyCode] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const [applyMsg, setApplyMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [discountInfo, setDiscountInfo] = useState('')
  const [activeTab, setActiveTab] = useState<'share' | 'apply'>('share')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (userId) loadReferral()
  }, [userId])

  const loadReferral = async () => {
    setLoading(true)
    try {
      // Use the correct endpoint path
      const res = await fetch(`/api/referrals?userId=${userId}`)
      const data = await res.json()
      if (data.referral) setReferral(data.referral)
    } catch (e) {
      console.error('Failed to load referral:', e)
    } finally {
      setLoading(false)
    }
  }

  // Construct the referral link using window.location.origin
  const referralLink = referral && origin
    ? `${origin}/register?ref=${referral.code}`
    : ''

  const copyText = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2500)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(type)
      setTimeout(() => setCopied(null), 2500)
    }
  }

  const handleApplyCode = async () => {
    if (!applyCode.trim()) return
    setApplyLoading(true)
    setApplyMsg(null)
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          code: applyCode.trim().toUpperCase(),
          referredUserId: userId,
          referredEmail: userEmail,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setApplyMsg({ text: data.message, type: 'success' })
        setDiscountInfo(data.message)
        setApplyCode('')
        loadReferral()
      } else {
        setApplyMsg({ text: data.error, type: 'error' })
      }
    } catch {
      setApplyMsg({ text: 'Something went wrong. Try again.', type: 'error' })
    } finally {
      setApplyLoading(false)
    }
  }

  const shareWhatsApp = () => {
    if (!referral) return
    const msg = `🚀 Hey! Use my referral code *${referral.code}* on AI Placement Coach and we BOTH get 20 free credits when you make your first purchase! 🎁\n\nSign up here: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const shareNative = () => {
    if (!referral) return
    if (navigator.share) {
      navigator.share({ title: 'AI Placement Coach', text: `Use my referral code ${referral.code} — we both get 20 credits!`, url: referralLink })
    }
  }

  if (loading) return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', marginTop: '24px', textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
      Loading referral program...
    </div>
  )

  if (!referral) return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', marginTop: '24px', textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
      Could not load referral program. Make sure you are logged in.
    </div>
  )

  const successfulRefs = referral.successful_referrals || 0
  const creditsEarned = referral.credits_earned || successfulRefs * 20

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '24px', overflow: 'hidden', marginTop: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '28px 28px 0', background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎁</div>
              <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px' }}>Refer & Earn</h2>
              <span style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px' }}>LIVE</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Share your code → Friend pays for 1st time →
              <strong style={{ color: '#fbbf24' }}> Both get 20 credits 🎉</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' as const }}>
              <div style={{ color: '#4ade80', fontWeight: '900', fontSize: '22px' }}>{successfulRefs}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Friends Joined</div>
            </div>
            <div style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' as const }}>
              <div style={{ color: '#60a5fa', fontWeight: '900', fontSize: '22px' }}>{creditsEarned}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Credits Earned</div>
            </div>
          </div>
        </div>

        {/* How it works banner */}
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <p style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>
            Credits are awarded to BOTH of you only when your friend completes their first payment. Each referral code works once per friend.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[{ id: 'share', label: '📤 Share & Earn' }, { id: 'apply', label: '🎟️ Apply a Code' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              style={{ padding: '10px 20px', border: 'none', borderRadius: '12px 12px 0 0', background: activeTab === t.id ? '#0a0f1a' : 'transparent', color: activeTab === t.id ? 'white' : '#64748b', fontWeight: activeTab === t.id ? '700' : '400', fontSize: '14px', cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px', background: '#0a0f1a' }}>

        {/* ── SHARE TAB ─────────────────────────────────── */}
        {activeTab === 'share' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

              {/* Left: Code + Link */}
              <div>
                {/* Big code display */}
                <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))', border: '2px dashed rgba(37,99,235,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' as const, marginBottom: '16px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>YOUR REFERRAL CODE</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <span style={{ color: 'white', fontWeight: '900', fontSize: '32px', letterSpacing: '6px', fontFamily: 'monospace' }}>
                      {referral.code}
                    </span>
                    <button onClick={() => copyText(referral.code, 'code')}
                      style={{ background: copied === 'code' ? 'rgba(22,163,74,0.2)' : 'rgba(37,99,235,0.2)', border: `1px solid ${copied === 'code' ? 'rgba(22,163,74,0.3)' : 'rgba(37,99,235,0.3)'}`, borderRadius: '8px', padding: '7px 12px', color: copied === 'code' ? '#4ade80' : '#93c5fd', fontSize: '13px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                      {copied === 'code' ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <p style={{ color: '#475569', fontSize: '12px', marginTop: '10px' }}>
                    Friend pays for first time → You both get <span style={{ color: '#4ade80', fontWeight: '700' }}>+20 credits</span>
                  </p>
                </div>

                {/* Referral link */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>REFERRAL LINK</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#64748b', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {referralLink || 'Loading link...'}
                    </div>
                    <button onClick={() => referralLink && copyText(referralLink, 'link')} disabled={!referralLink}
                      style={{ padding: '10px 16px', background: copied === 'link' ? '#059669' : '#2563eb', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: referralLink ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' as const, transition: 'background 0.2s' }}>
                      {copied === 'link' ? '✅ Copied!' : '📋 Copy Link'}
                    </button>
                  </div>
                </div>

                {/* Share buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={shareWhatsApp}
                    style={{ flex: 1, padding: '12px', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '12px', color: '#25d366', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    📱 WhatsApp
                  </button>
                  <button onClick={shareNative}
                    style={{ flex: 1, padding: '12px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '12px', color: '#93c5fd', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    🔗 Share Link
                  </button>
                </div>
              </div>

              {/* Right: How it works + Milestones */}
              <div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>🚀 How It Works</h3>
                  {[
                    { step: '1', icon: '🔗', title: 'Share your code', desc: 'Send your unique code/link to a friend' },
                    { step: '2', icon: '📝', title: 'Friend registers', desc: 'They sign up using your referral link' },
                    { step: '3', icon: '💳', title: 'Friend makes first payment', desc: 'Any plan or credit purchase works' },
                    { step: '4', icon: '⚡', title: 'Both get +20 credits', desc: 'Instantly added to both accounts' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: i < 3 ? '14px' : '0' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{item.title}</div>
                        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Milestones */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>🏆 Milestone Rewards</h3>
                  {[
                    { milestone: 1, reward: '+20 credits each', icon: '⚡', unlocked: successfulRefs >= 1 },
                    { milestone: 3, reward: '+60 credits total', icon: '🚀', unlocked: successfulRefs >= 3 },
                    { milestone: 5, reward: '+100 credits + Pro badge', icon: '👑', unlocked: successfulRefs >= 5 },
                  ].map((item, i) => {
                    const pct = Math.min((successfulRefs / item.milestone) * 100, 100)
                    return (
                      <div key={i} style={{ marginBottom: i < 2 ? '12px' : '0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ color: item.unlocked ? 'white' : '#64748b', fontSize: '12px', fontWeight: item.unlocked ? '700' : '400', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span>{item.icon}</span>
                            {item.milestone} friend{item.milestone > 1 ? 's' : ''} → {item.reward}
                          </span>
                          <span style={{ fontSize: '11px', color: item.unlocked ? '#4ade80' : '#334155' }}>
                            {item.unlocked ? '✅ Done!' : `${successfulRefs}/${item.milestone}`}
                          </span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: item.unlocked ? 'linear-gradient(90deg, #059669, #4ade80)' : 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: '9999px', transition: 'width 0.6s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* WhatsApp message preview */}
            <div style={{ marginTop: '20px', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.1)', borderRadius: '14px', padding: '16px' }}>
              <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>📱 MESSAGE PREVIEW (Click WhatsApp to send)</p>
              <p style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.7' }}>
                🚀 Hey! Use my referral code <strong style={{ color: '#fbbf24' }}>{referral.code}</strong> on AI Placement Coach!<br />
                We <strong style={{ color: '#4ade80' }}>both get 20 free credits</strong> when you make your first purchase 🎁<br />
                <span style={{ color: '#475569', fontSize: '12px' }}>{referralLink}</span>
              </p>
            </div>
          </div>
        )}

        {/* ── APPLY TAB ─────────────────────────────────── */}
        {activeTab === 'apply' && (
          <div style={{ maxWidth: '460px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' as const, marginBottom: '28px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎟️</div>
              <h3 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '6px' }}>Got a Friend's Referral Code?</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Enter it here. After your first payment, you both get <strong style={{ color: '#fbbf24' }}>20 credits</strong>!</p>
            </div>

            {discountInfo && (
              <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '14px', padding: '18px', marginBottom: '20px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
                <p style={{ color: '#4ade80', fontWeight: '800', fontSize: '15px' }}>{discountInfo}</p>
              </div>
            )}

            {!discountInfo && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>ENTER REFERRAL CODE</label>
                  <input
                    type="text"
                    value={applyCode}
                    onChange={e => setApplyCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
                    placeholder="e.g. REFABC123"
                    maxLength={12}
                    style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '20px', fontWeight: '900', letterSpacing: '3px', outline: 'none', boxSizing: 'border-box' as const, textAlign: 'center' as const, fontFamily: 'monospace', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {applyMsg && (
                  <div style={{ background: applyMsg.type === 'success' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', border: `1px solid ${applyMsg.type === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
                    <p style={{ color: applyMsg.type === 'success' ? '#4ade80' : '#fca5a5', fontSize: '13px', fontWeight: '600' }}>
                      {applyMsg.type === 'success' ? '✅' : '❌'} {applyMsg.text}
                    </p>
                  </div>
                )}

                <button onClick={handleApplyCode} disabled={!applyCode || applyLoading}
                  style={{ width: '100%', padding: '14px', background: applyCode ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: applyCode ? 'white' : '#334155', fontSize: '16px', fontWeight: '700', cursor: applyCode ? 'pointer' : 'not-allowed', boxShadow: applyCode ? '0 4px 16px rgba(37,99,235,0.3)' : 'none' }}>
                  {applyLoading ? '⏳ Applying...' : '🎟️ Apply Code'}
                </button>

                <p style={{ color: '#334155', fontSize: '12px', textAlign: 'center' as const, marginTop: '12px' }}>
                  Credits are added to both accounts after your first payment is verified.
                </p>
              </>
            )}

            {/* Benefits */}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { icon: '⚡', title: '+20 Credits', desc: 'For you after 1st payment' },
                { icon: '🎁', title: '+20 Credits', desc: 'For your friend too' },
                { icon: '♾️', title: 'Any Plan', desc: 'Works on any payment' },
                { icon: '🔒', title: 'One Time', desc: 'Per account, per referral' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{item.icon}</div>
                  <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}