'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

declare global {
  interface Window { Razorpay: any }
}

type ToastType = 'success' | 'error' | 'info'
interface Toast { show: boolean; message: string; type: ToastType }

export default function BuyCreditsPage() {
  const [user, setUser] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [currentCredits, setCurrentCredits] = useState(0)
  const [selectedPkg, setSelectedPkg] = useState<any>(null)
  const [customCredits, setCustomCredits] = useState(50)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'packages' | 'custom'>('packages')
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' })

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000)
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

    // Load Razorpay SDK
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { try { document.body.removeChild(script) } catch {} }
  }, [])

  const minCredits = parseInt(settings.min_purchase_credits || '20')
  const maxCredits = parseInt(settings.max_purchase_credits || '10000')
  const rate = parseFloat(settings.credits_per_rupee || '1')
  const customPrice = Math.ceil(customCredits / rate)

  // ── Main payment handler ──────────────────────────────────
  const handleBuy = async (pkg?: any) => {
    if (!user) { showToast('Please login first', 'error'); return }

    const isCustom = !pkg

    if (isCustom && customCredits < minCredits) {
      showToast(`Minimum purchase is ${minCredits} credits`, 'error')
      return
    }

    setLoading(true)

    try {
      // Step 1: Create Razorpay order on server
      const orderRes = await fetch('/api/credits/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          pkg
            ? { userId: user.id, email: user.email, packageId: pkg.id }
            : { userId: user.id, email: user.email, customCredits }
        ),
      })
      const orderData = await orderRes.json()

      if (!orderRes.ok || !orderData.orderId) {
        showToast(orderData.error || 'Failed to create order', 'error')
        setLoading(false)
        return
      }

      // Step 2: Check Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        showToast('Payment system is loading. Please try again in a moment.', 'error')
        setLoading(false)
        return
      }

      const creditsBeingBought = orderData.credits
      const pkgName = orderData.packageName
      const amountInr = orderData.amountInr

      // Step 3: Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'AI Placement Coach',
        description: `${creditsBeingBought} Credits — ${pkgName}`,
        order_id: orderData.orderId,
        prefill: {
          email: user.email,
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            showToast('Payment cancelled. Your credits were not added.', 'info')
          },
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          // Step 4: Verify payment on server
          try {
            showToast('Verifying payment...', 'info')

            const verifyRes = await fetch('/api/credits/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                credits: creditsBeingBought,
                packageName: pkgName,
                amountInr,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              // Step 5: Success — update UI
              showToast(verifyData.message, 'success')
              setCurrentCredits(prev => {
                if (prev === -1) return -1 // unlimited stays unlimited
                return prev + creditsBeingBought
              })
              setSelectedPkg(null)
            } else {
              showToast(
                verifyData.error || 'Payment verification failed. Please contact support.',
                'error'
              )
            }
          } catch (e) {
            showToast(
              `Payment may have gone through but verification failed. Please contact support with payment ID: ${response.razorpay_payment_id}`,
              'error'
            )
          } finally {
            setLoading(false)
          }
        },
      })

      rzp.on('payment.failed', (response: any) => {
        setLoading(false)
        showToast(
          `Payment failed: ${response.error?.description || 'Unknown error'}. No credits were added.`,
          'error'
        )
      })

      rzp.open()
    } catch (e: any) {
      setLoading(false)
      showToast(e.message || 'Something went wrong', 'error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success'
            ? 'rgba(22,163,74,0.95)'
            : toast.type === 'error'
              ? 'rgba(220,38,38,0.95)'
              : 'rgba(37,99,235,0.95)',
          color: 'white', padding: '14px 20px', borderRadius: '12px',
          fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          maxWidth: '420px', lineHeight: '1.5',
        }}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
        </div>
      )}

      {/* ── Nav ───────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
          ← Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentCredits === -1 ? (
            <span style={{ background: 'rgba(217,119,6,0.2)', color: '#fcd34d', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700' }}>
              👑 Unlimited Credits
            </span>
          ) : (
            <span style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700' }}>
              ⚡ {currentCredits} credits
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

        {/* ── Hero ──────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
            ⚡
          </div>
          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '900', marginBottom: '10px' }}>
            Buy Credits
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            Credits are used for AI features — Resume Builder, Cover Letter, ATS Scorer & more
          </p>
          {/* Payment security note */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', padding: '8px 16px' }}>
            <span style={{ fontSize: '14px' }}>🔒</span>
            <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: '600' }}>
              Secure payments via Razorpay · Credits added only after payment verification
            </span>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '36px' }}>
          {[
            { id: 'packages', label: '📦 Credit Packages' },
            { id: 'custom', label: '🔢 Custom Amount' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{
                padding: '10px 24px', borderRadius: '12px', border: 'none',
                background: tab === t.id ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.06)',
                color: tab === t.id ? 'white' : '#64748b',
                fontWeight: tab === t.id ? '700' : '400', fontSize: '14px', cursor: 'pointer',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PACKAGES TAB ────────────────────────────────────── */}
        {tab === 'packages' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {packages.map(pkg => (
                <div key={pkg.id}
                  onClick={() => setSelectedPkg(selectedPkg?.id === pkg.id ? null : pkg)}
                  style={{
                    background: selectedPkg?.id === pkg.id ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${selectedPkg?.id === pkg.id ? '#2563eb' : pkg.is_popular ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '20px', padding: '24px', cursor: 'pointer',
                    position: 'relative', transition: 'all 0.2s',
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
              <div style={{
                background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '16px', padding: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '16px',
              }}>
                <div>
                  <p style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
                    {selectedPkg.name} — {selectedPkg.credits + (selectedPkg.bonus_credits || 0)} credits
                  </p>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                    {selectedPkg.credits} credits {selectedPkg.bonus_credits > 0 ? `+ ${selectedPkg.bonus_credits} bonus` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '24px' }}>₹{selectedPkg.price_inr}</span>
                  <button
                    onClick={() => handleBuy(selectedPkg)}
                    disabled={loading}
                    style={{
                      padding: '14px 28px',
                      background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      border: 'none', borderRadius: '12px', color: loading ? '#475569' : 'white',
                      fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.4)',
                    }}>
                    {loading ? '⏳ Processing...' : '⚡ Pay & Get Credits'}
                  </button>
                </div>
              </div>
            )}

            {/* Payment note */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px', textAlign: 'center' }}>
              <p style={{ color: '#475569', fontSize: '13px' }}>
                🔒 You will be redirected to Razorpay's secure payment page.
                Credits are added <strong style={{ color: '#64748b' }}>only after successful payment verification</strong>.
              </p>
            </div>
          </div>
        )}

        {/* ── CUSTOM TAB ────────────────────────────────────── */}
        {tab === 'custom' && (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px', padding: '32px',
            }}>
              <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>
                🔢 Custom Credits
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
                Min: {minCredits} · Rate: ₹{(1 / rate).toFixed(2)}/credit
              </p>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>CREDITS TO BUY</label>
                  <span style={{ color: '#60a5fa', fontWeight: '900', fontSize: '18px' }}>{customCredits}</span>
                </div>
                <input
                  type="range" min={minCredits} max={maxCredits} step={10}
                  value={customCredits}
                  onChange={e => setCustomCredits(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#334155', fontSize: '11px' }}>{minCredits}</span>
                  <span style={{ color: '#334155', fontSize: '11px' }}>{maxCredits}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' as const }}>
                {[50, 100, 200, 500, 1000].map(n => (
                  <button key={n} onClick={() => setCustomCredits(n)}
                    style={{
                      padding: '7px 16px', borderRadius: '9px', border: 'none',
                      background: customCredits === n ? '#2563eb' : 'rgba(255,255,255,0.06)',
                      color: customCredits === n ? 'white' : '#64748b',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    }}>
                    {n}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  OR ENTER EXACT AMOUNT
                </label>
                <input
                  type="number" min={minCredits} max={maxCredits}
                  value={customCredits}
                  onChange={e => setCustomCredits(Math.min(maxCredits, Math.max(minCredits, parseInt(e.target.value) || minCredits)))}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: 'white',
                    fontSize: '16px', fontWeight: '700',
                    outline: 'none', boxSizing: 'border-box' as const, textAlign: 'center' as const,
                  }}
                />
              </div>

              {/* Price display */}
              <div style={{
                background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '14px', padding: '20px', marginBottom: '20px', textAlign: 'center' as const,
              }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>You pay</div>
                <div style={{ color: '#4ade80', fontSize: '36px', fontWeight: '900' }}>₹{customPrice}</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>for {customCredits} credits</div>
              </div>

              <button
                onClick={() => handleBuy()}
                disabled={loading || customCredits < minCredits}
                style={{
                  width: '100%', padding: '16px',
                  background: loading || customCredits < minCredits
                    ? 'rgba(255,255,255,0.05)'
                    : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', borderRadius: '14px', color: loading ? '#475569' : 'white',
                  fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
                }}>
                {loading ? '⏳ Processing...' : `⚡ Pay ₹${customPrice} & Get ${customCredits} Credits`}
              </button>

              <p style={{ color: '#334155', fontSize: '12px', textAlign: 'center' as const, marginTop: '12px' }}>
                🔒 Secured by Razorpay · Credits added only after verification
              </p>
            </div>
          </div>
        )}

        {/* ── How credits work ───────────────────────────── */}
        <div style={{
          marginTop: '48px', background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px',
        }}>
          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px', textAlign: 'center' as const }}>
            ⚡ How Credits Work
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { icon: '🤖', feature: 'AI Coach Chat', cost: '1 credit/msg' },
              { icon: '📄', feature: 'Resume Builder', cost: '5 credits' },
              { icon: '✍️', feature: 'Cover Letter', cost: '4 credits' },
              { icon: '🎯', feature: 'ATS Scorer', cost: '2 credits' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' as const, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
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