'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BuyCreditsPage() {
  const [user, setUser] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [currentCredits, setCurrentCredits] = useState(0)
  const [selectedPkg, setSelectedPkg] = useState<any>(null)
  const [customCredits, setCustomCredits] = useState(50)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [tab, setTab] = useState<'packages' | 'custom'>('packages')

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('credits_remaining')
          .eq('user_id', user.id)
          .single()
        if (sub) setCurrentCredits(sub.credits_remaining >= 999999 ? -1 : sub.credits_remaining)
      }
      const res = await fetch('/api/credits/buy')
      const data = await res.json()
      if (data.packages) setPackages(data.packages)
      if (data.settings) setSettings(data.settings)
    }
    load()
  }, [])

  const minCredits = parseInt(settings.min_purchase_credits || '10')
  const maxCredits = parseInt(settings.max_purchase_credits || '10000')
  const rate = parseFloat(settings.credits_per_rupee || '1')
  const customPrice = Math.ceil(customCredits / rate)

  const handleBuy = async (pkg?: any) => {
    if (!user) { showToast('Please login first', 'error'); return }
    setLoading(true)
    try {
      const body = pkg
        ? { userId: user.id, email: user.email, packageId: pkg.id }
        : { userId: user.id, email: user.email, customCredits }

      const res = await fetch('/api/credits/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message)
        setCurrentCredits(prev => prev + data.credits)
        setSelectedPkg(null)
      } else {
        showToast(data.error || 'Purchase failed', 'error')
      }
    } catch {
      showToast('Something went wrong', 'error')
    }
    setLoading(false)
  }

  const PLAN_COLORS: Record<string, string> = {
    free: '#64748b', basic: '#2563eb', pro: '#7c3aed', premium: '#d97706'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: toast.type === 'success' ? 'rgba(22,163,74,0.95)' : 'rgba(220,38,38,0.95)', color: 'white', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Nav */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentCredits === -1 ? (
            <span style={{ background: 'rgba(217,119,6,0.2)', color: '#fcd34d', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700' }}>👑 Unlimited Credits</span>
          ) : (
            <span style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700' }}>⚡ {currentCredits} credits</span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>⚡</div>
          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '900', marginBottom: '10px' }}>Buy Credits</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>Use credits for AI features — Resume Builder, Cover Letter, ATS Scorer & more</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '36px' }}>
          {[
            { id: 'packages', label: '📦 Credit Packages' },
            { id: 'custom', label: '🔢 Custom Amount' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: tab === t.id ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.06)', color: tab === t.id ? 'white' : '#64748b', fontWeight: tab === t.id ? '700' : '400', fontSize: '14px', cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Packages Tab */}
        {tab === 'packages' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {packages.map((pkg, i) => (
                <div key={pkg.id}
                  onClick={() => setSelectedPkg(selectedPkg?.id === pkg.id ? null : pkg)}
                  style={{
                    background: selectedPkg?.id === pkg.id ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${selectedPkg?.id === pkg.id ? '#2563eb' : pkg.is_popular ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '20px', padding: '24px', cursor: 'pointer',
                    position: 'relative', transition: 'all 0.2s'
                  }}>
                  {pkg.is_popular && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', fontSize: '11px', fontWeight: '800', padding: '4px 14px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>{pkg.name}</div>
                    <div style={{ color: '#60a5fa', fontSize: '40px', fontWeight: '900', lineHeight: '1' }}>{pkg.credits}</div>
                    <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>credits</div>
                    {pkg.bonus_credits > 0 && (
                      <div style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px', marginTop: '8px', display: 'inline-block' }}>
                        +{pkg.bonus_credits} bonus!
                      </div>
                    )}
                    <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                      <div style={{ color: 'white', fontSize: '24px', fontWeight: '900' }}>₹{pkg.price_inr}</div>
                      <div style={{ color: '#475569', fontSize: '11px', marginTop: '4px' }}>
                        ₹{(pkg.price_inr / (pkg.credits + (pkg.bonus_credits || 0))).toFixed(2)}/credit
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPkg && (
              <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{selectedPkg.name} — {selectedPkg.credits + (selectedPkg.bonus_credits || 0)} credits</p>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                    {selectedPkg.credits} credits {selectedPkg.bonus_credits > 0 ? `+ ${selectedPkg.bonus_credits} bonus` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '24px' }}>₹{selectedPkg.price_inr}</span>
                  <button onClick={() => handleBuy(selectedPkg)} disabled={loading}
                    style={{ padding: '14px 28px', background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? '⏳ Processing...' : '⚡ Buy Now'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Tab */}
        {tab === 'custom' && (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px' }}>
              <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>🔢 Custom Credits</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
                Min: {minCredits} credits · Rate: ₹{(1 / rate).toFixed(2)}/credit
              </p>

              {/* Slider */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>CREDITS TO BUY</label>
                  <span style={{ color: '#60a5fa', fontWeight: '900', fontSize: '18px' }}>{customCredits}</span>
                </div>
                <input type="range" min={minCredits} max={maxCredits} step={10} value={customCredits}
                  onChange={e => setCustomCredits(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb', marginBottom: '12px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#334155', fontSize: '11px' }}>{minCredits}</span>
                  <span style={{ color: '#334155', fontSize: '11px' }}>{maxCredits}</span>
                </div>
              </div>

              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[50, 100, 200, 500, 1000].map(n => (
                  <button key={n} onClick={() => setCustomCredits(n)}
                    style={{ padding: '7px 16px', borderRadius: '9px', border: 'none', background: customCredits === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: customCredits === n ? 'white' : '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    {n}
                  </button>
                ))}
              </div>

              {/* Manual input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>OR ENTER EXACT AMOUNT</label>
                <input type="number" min={minCredits} max={maxCredits} value={customCredits}
                  onChange={e => setCustomCredits(Math.min(maxCredits, Math.max(minCredits, parseInt(e.target.value) || minCredits)))}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
              </div>

              {/* Price display */}
              <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>You pay</div>
                <div style={{ color: '#4ade80', fontSize: '36px', fontWeight: '900' }}>₹{customPrice}</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>for {customCredits} credits</div>
              </div>

              <button onClick={() => handleBuy()} disabled={loading || customCredits < minCredits}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⏳ Processing...' : `⚡ Buy ${customCredits} Credits for ₹${customPrice}`}
              </button>

              <p style={{ color: '#334155', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
                🔒 Secured by Razorpay · Instant credit delivery
              </p>
            </div>
          </div>
        )}

        {/* How credits work */}
        <div style={{ marginTop: '48px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}>⚡ How Credits Work</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { icon: '🤖', feature: 'AI Coach Chat', cost: '1 credit/msg' },
              { icon: '📄', feature: 'Resume Builder', cost: '5 credits' },
              { icon: '✍️', feature: 'Cover Letter', cost: '4 credits' },
              { icon: '🎯', feature: 'ATS Scorer', cost: '3 credits' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{item.feature}</div>
                <div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '700' }}>{item.cost}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}