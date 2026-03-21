'use client'
import { useState, useEffect } from 'react'

interface ReferralData {
  id: string
  code: string
  total_referrals: number
  successful_referrals: number
  credits_earned: number
}

export default function ReferralSection({ userId, userEmail }: { userId: string, userEmail: string }) {
  const [referral, setReferral] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [applyCode, setApplyCode] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const [applyMsg, setApplyMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [discountCode, setDiscountCode] = useState('')
  const [activeTab, setActiveTab] = useState<'share' | 'apply'>('share')

  useEffect(() => {
    if (userId) loadReferral()
  }, [userId])

  const loadReferral = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/referral?userId=${userId}`)
      const data = await res.json()
      if (data.referral) setReferral(data.referral)
    } catch {}
    setLoading(false)
  }

  const referralLink = referral
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referral.code}`
    : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const copyCode = () => {
    if (!referral) return
    navigator.clipboard.writeText(referral.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleApplyCode = async () => {
    if (!applyCode.trim()) return
    setApplyLoading(true)
    setApplyMsg(null)
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          code: applyCode.trim(),
          referredUserId: userId,
          referredEmail: userEmail
        })
      })
      const data = await res.json()
      if (data.success) {
        setApplyMsg({ text: data.message, type: 'success' })
        setDiscountCode(data.discountCode)
        setApplyCode('')
        loadReferral()
      } else {
        setApplyMsg({ text: data.error, type: 'error' })
      }
    } catch {
      setApplyMsg({ text: 'Something went wrong', type: 'error' })
    }
    setApplyLoading(false)
  }

  const shareWhatsApp = () => {
    const msg = `🚀 Use my referral code *${referral?.code}* on AI Placement Coach and get ₹50 OFF your first plan!\n\n${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const shareText = () => {
    if (navigator.share) {
      navigator.share({ title: 'AI Placement Coach', text: `Use my code ${referral?.code} for ₹50 off!`, url: referralLink })
    }
  }

  if (loading) return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', marginTop: '24px', textAlign: 'center', color: '#64748b' }}>
      Loading referral program...
    </div>
  )

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
      border: '1px solid rgba(37,99,235,0.15)',
      borderRadius: '24px',
      overflow: 'hidden',
      marginTop: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>

      {/* Header */}
      <div style={{
        padding: '28px 28px 0',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎁</div>
              <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px' }}>Refer & Earn</h2>
              <span style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px' }}>LIVE</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Share your code → Friend gets <strong style={{ color: '#fbbf24' }}>₹50 off</strong> → You get <strong style={{ color: '#4ade80' }}>+50 credits</strong>
            </p>
          </div>
          {/* Stats pills */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' as const }}>
              <div style={{ color: '#4ade80', fontWeight: '900', fontSize: '22px' }}>{referral?.successful_referrals || 0}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Friends Joined</div>
            </div>
            <div style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' as const }}>
              <div style={{ color: '#60a5fa', fontWeight: '900', fontSize: '22px' }}>{(referral?.successful_referrals || 0) * 50}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Credits Earned</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'share', label: '📤 Share & Earn', desc: 'Share your code' },
            { id: 'apply', label: '🎟️ Apply Code', desc: 'Have a code?' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '10px 20px', border: 'none', borderRadius: '12px 12px 0 0',
                background: activeTab === t.id ? '#0a0f1a' : 'transparent',
                color: activeTab === t.id ? 'white' : '#64748b',
                fontWeight: activeTab === t.id ? '700' : '400',
                fontSize: '14px', cursor: 'pointer'
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '28px', background: '#0a0f1a' }}>

        {/* SHARE TAB */}
        {activeTab === 'share' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

              {/* Left — Code & Link */}
              <div>
                {/* Big Code Display */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
                  border: '2px dashed rgba(37,99,235,0.3)',
                  borderRadius: '16px', padding: '24px', textAlign: 'center' as const, marginBottom: '16px'
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>YOUR REFERRAL CODE</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <span style={{ color: 'white', fontWeight: '900', fontSize: '32px', letterSpacing: '4px' }}>
                      {referral?.code}
                    </span>
                    <button onClick={copyCode}
                      style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '8px', padding: '8px 12px', color: '#93c5fd', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                      {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <p style={{ color: '#475569', fontSize: '12px', marginTop: '10px' }}>
                    Friend saves <span style={{ color: '#fbbf24', fontWeight: '700' }}>₹50</span> · You earn <span style={{ color: '#4ade80', fontWeight: '700' }}>+50 credits</span>
                  </p>
                </div>

                {/* Referral Link */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>REFERRAL LINK</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      flex: 1, padding: '10px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', color: '#64748b', fontSize: '12px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const
                    }}>
                      {referralLink}
                    </div>
                    <button onClick={copyLink}
                      style={{ padding: '10px 16px', background: copied ? '#059669' : '#2563eb', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                      {copied ? '✅ Copied!' : '📋 Copy Link'}
                    </button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={shareWhatsApp}
                    style={{ flex: 1, padding: '12px', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '12px', color: '#25d366', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    📱 Share on WhatsApp
                  </button>
                  <button onClick={shareText}
                    style={{ flex: 1, padding: '12px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '12px', color: '#93c5fd', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    🔗 Share Link
                  </button>
                </div>
              </div>

              {/* Right — How it works + Leaderboard */}
              <div>
                {/* How It Works */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>🚀 How It Works</h3>
                  {[
                    { step: '1', icon: '🔗', title: 'Share your code', desc: 'Send your unique code to friends' },
                    { step: '2', icon: '📝', title: 'Friend registers', desc: 'They sign up using your link/code' },
                    { step: '3', icon: '💳', title: 'Friend gets ₹50 off', desc: 'Discount applied automatically at checkout' },
                    { step: '4', icon: '⚡', title: 'You get +50 credits', desc: 'Credits added to your account instantly' },
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

                {/* Milestone Rewards */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>🏆 Milestone Rewards</h3>
                  {[
                    { milestone: 1, reward: '+50 credits', icon: '⚡', unlocked: (referral?.successful_referrals || 0) >= 1 },
                    { milestone: 3, reward: '+200 credits', icon: '🚀', unlocked: (referral?.successful_referrals || 0) >= 3 },
                    { milestone: 5, reward: '1 Month Pro Free', icon: '👑', unlocked: (referral?.successful_referrals || 0) >= 5 },
                    { milestone: 10, reward: '3 Months Premium', icon: '💎', unlocked: (referral?.successful_referrals || 0) >= 10 },
                  ].map((item, i) => {
                    const current = referral?.successful_referrals || 0
                    const pct = Math.min((current / item.milestone) * 100, 100)
                    return (
                      <div key={i} style={{ marginBottom: i < 3 ? '12px' : '0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ color: item.unlocked ? 'white' : '#64748b', fontSize: '12px', fontWeight: item.unlocked ? '700' : '400', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span>{item.icon}</span>
                            {item.milestone} referral{item.milestone > 1 ? 's' : ''} → {item.reward}
                          </span>
                          <span style={{ fontSize: '11px', color: item.unlocked ? '#4ade80' : '#334155' }}>
                            {item.unlocked ? '✅ Unlocked!' : `${current}/${item.milestone}`}
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

            {/* Share Message Preview */}
            <div style={{ marginTop: '20px', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.1)', borderRadius: '14px', padding: '16px' }}>
              <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>📱 WHATSAPP MESSAGE PREVIEW</p>
              <p style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6' }}>
                🚀 Hey! I've been using <strong>AI Placement Coach</strong> to prep for campus placements — it's amazing!<br />
                Use my code <strong style={{ color: '#fbbf24' }}>{referral?.code}</strong> when you sign up and get <strong style={{ color: '#4ade80' }}>₹50 OFF</strong> your first plan 🎉<br />
                <span style={{ color: '#64748b' }}>{referralLink}</span>
              </p>
            </div>
          </div>
        )}

        {/* APPLY TAB */}
        {activeTab === 'apply' && (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' as const, marginBottom: '28px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎟️</div>
              <h3 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '6px' }}>Have a Referral Code?</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Enter your friend's code and get <strong style={{ color: '#fbbf24' }}>₹50 off</strong> on any plan!</p>
            </div>

            {/* Discount already applied */}
            {discountCode && (
              <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '20px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                <p style={{ color: '#4ade80', fontWeight: '800', fontSize: '16px', marginBottom: '6px' }}>₹50 Discount Applied!</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>Use this code at checkout:</p>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '2px dashed rgba(22,163,74,0.4)', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ color: 'white', fontWeight: '900', fontSize: '22px', letterSpacing: '3px' }}>{discountCode}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px' }}>Apply this code in Billing page for ₹50 off</p>
              </div>
            )}

            {/* Apply Code Form */}
            {!discountCode && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>ENTER REFERRAL CODE</label>
                  <input
                    type="text"
                    value={applyCode}
                    onChange={e => setApplyCode(e.target.value.toUpperCase())}
                    placeholder="e.g. REFABC123"
                    maxLength={12}
                    style={{
                      width: '100%', padding: '14px 16px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px', color: 'white',
                      fontSize: '18px', fontWeight: '700',
                      letterSpacing: '2px', outline: 'none',
                      boxSizing: 'border-box' as const,
                      textAlign: 'center' as const
                    }}
                  />
                </div>

                {applyMsg && (
                  <div style={{
                    background: applyMsg.type === 'success' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                    border: `1px solid ${applyMsg.type === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                    borderRadius: '10px', padding: '12px 14px', marginBottom: '14px'
                  }}>
                    <p style={{ color: applyMsg.type === 'success' ? '#4ade80' : '#fca5a5', fontSize: '13px', fontWeight: '600' }}>
                      {applyMsg.text}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleApplyCode}
                  disabled={!applyCode || applyLoading}
                  style={{
                    width: '100%', padding: '14px',
                    background: applyCode ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)',
                    border: 'none', borderRadius: '12px',
                    color: applyCode ? 'white' : '#334155',
                    fontSize: '16px', fontWeight: '700',
                    cursor: applyCode ? 'pointer' : 'not-allowed'
                  }}>
                  {applyLoading ? '⏳ Applying...' : '🎟️ Apply Code & Get ₹50 Off'}
                </button>
              </>
            )}

            {/* Benefits Box */}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { icon: '💸', title: '₹50 OFF', desc: 'On any plan purchase' },
                { icon: '⚡', title: 'Instant', desc: 'Applied at checkout' },
                { icon: '♾️', title: 'Any Plan', desc: 'Basic, Pro or Premium' },
                { icon: '🔒', title: 'One Time', desc: 'Per account use' },
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