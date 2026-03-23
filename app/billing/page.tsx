'use client'
// app/billing/page.tsx — FULL REPLACEMENT with discount code support
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const BASE_PLANS = [
  { id:'free',    name:'Free',    price:0,   priceLabel:'₹0',   credits:10,     creditsLabel:'10 credits total',    color:'#6b7280', features:['10 credits on signup','1 resume download','Basic Q&A bank'],                                       popular:false },
  { id:'basic',   name:'Basic',   price:99,  priceLabel:'₹99',  credits:50,     creditsLabel:'50 credits / month',  color:'#3b82f6', features:['50 credits per month','Unlimited resume downloads','Full Q&A bank','ATS score checker'],            popular:false },
  { id:'pro',     name:'Pro',     price:299, priceLabel:'₹299', credits:200,    creditsLabel:'200 credits / month', color:'#8b5cf6', features:['200 credits/month','Everything in Basic','WhatsApp daily questions','Mock HR interview','Salary coach'],popular:true  },
  { id:'premium', name:'Premium', price:499, priceLabel:'₹499', credits:999999, creditsLabel:'Unlimited credits',   color:'#f59e0b', features:['Unlimited credits','Everything in Pro','Salary negotiation coach','JD optimizer','Priority support'],popular:false },
]

declare global { interface Window { Razorpay: any } }

export default function BillingPage() {
  const [userId, setUserId]             = useState('')
  const [userEmail, setUserEmail]       = useState('')
  const [currentPlan, setCurrentPlan]   = useState('free')
  const [credits, setCredits]           = useState(0)
  const [plans, setPlans]               = useState(BASE_PLANS)
  const [loading, setLoading]           = useState<string|null>(null)
  const [msg, setMsg]                   = useState({ text:'', type:'' })

  // Discount state
  const [code, setCode]                 = useState('')
  const [discountData, setDiscountData] = useState<any>(null)
  const [codeLoading, setCodeLoading]   = useState(false)
  const [codeError, setCodError]        = useState('')
  const [codeSuccess, setCodSuccess]    = useState('')
  const [selectedPlan, setSelPlan]      = useState('')

  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id); setUserEmail(user.email||'')
      const { data } = await supabase.from('subscriptions').select('plan,credits_remaining').eq('user_id', user.id).single()
      if (data) { setCurrentPlan(data.plan); setCredits(data.credits_remaining) }
      // Load dynamic pricing from admin
      try {
        const r = await fetch('/api/admin/plan-pricing')
        const d = await r.json()
        if (d.plans?.length) {
          setPlans(BASE_PLANS.map(p => {
            const db = d.plans.find((x:any) => x.plan_key === p.id)
            return db ? { ...p, price: Math.round(db.price_monthly), priceLabel:`₹${Math.round(db.price_monthly)}` } : p
          }))
        }
      } catch {}
    })()
    const s = document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.async=true; document.body.appendChild(s)
    return () => { try { document.body.removeChild(s) } catch {} }
  }, [router])

  const validateCode = async () => {
    if (!code.trim()) return
    setCodeLoading(true); setCodError(''); setCodSuccess(''); setDiscountData(null)
    try {
      const r = await fetch('/api/discount/validate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ code, planId:selectedPlan, userId })
      })
      const d = await r.json()
      if (d.valid) { setDiscountData(d); setCodSuccess(d.message) }
      else setCodError(d.error || 'Invalid code')
    } catch { setCodError('Failed to validate. Try again.') }
    setCodeLoading(false)
  }

  const clearDiscount = () => { setCode(''); setDiscountData(null); setCodError(''); setCodSuccess('') }

  const getDiscountedPrice = (orig: number) => {
    if (!discountData || orig === 0) return orig
    if (discountData.discount_percent > 0) return Math.round(orig * (1 - discountData.discount_percent/100))
    if (discountData.discount_amount > 0)  return Math.max(0, orig - discountData.discount_amount)
    return orig
  }

  const pay = async (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan || planId==='free' || planId===currentPlan) return
    setSelPlan(planId); setLoading(planId); setMsg({ text:'', type:'' })
    const finalPrice = getDiscountedPrice(plan.price)
    try {
      const r = await fetch('/api/billing/create', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId, planId, discountCode: discountData?code:undefined, finalPrice })
      })
      const d = await r.json()
      if (!r.ok) { setMsg({ text:d.error||'Failed to create order', type:'error' }); setLoading(null); return }
      if (discountData) {
        await fetch('/api/discount/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ code, action:'apply' }) })
      }
      if (typeof window.Razorpay==='undefined') { setMsg({ text:'Payment loading. Try again.', type:'error' }); setLoading(null); return }
      new window.Razorpay({
        key:d.keyId, amount:d.amount, currency:'INR',
        name:'AI Placement Coach', description:`${plan.name} Plan`, order_id:d.orderId,
        prefill:{ email:userEmail }, theme:{ color:plan.color },
        handler: async (response:any) => {
          const v = await fetch('/api/billing/webhook', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ ...response, userId, planId })
          })
          const vd = await v.json()
          if (v.ok) { setMsg({ text:`🎉 Payment successful! You are now on ${planId} plan.`, type:'success' }); setCurrentPlan(planId); setCredits(vd.credits); clearDiscount() }
          else setMsg({ text:vd.error||'Verification failed', type:'error' })
          setLoading(null)
        },
        modal:{ ondismiss:()=>setLoading(null) }
      }).open()
    } catch { setMsg({ text:'Payment failed.', type:'error' }); setLoading(null) }
  }

  const s: any = {
    page: { minHeight:'100vh', background:'linear-gradient(135deg,#f8fafc 0%,#eef2ff 50%,#faf5ff 100%)', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', position:'relative', overflow:'hidden' },
    nav:  { position:'relative' as const, zIndex:10, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.5)', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' },
    main: { maxWidth:'1100px', margin:'0 auto', padding:'48px 24px', position:'relative' as const, zIndex:10 },
    card: { background:'rgba(255,255,255,0.88)', backdropFilter:'blur(16px)', borderRadius:'20px', padding:'28px 22px', transition:'all 0.3s', border:'1px solid rgba(255,255,255,0.5)', display:'flex', flexDirection:'column' as const },
    inp:  { width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'12px', color:'white', fontSize:'14px', outline:'none', letterSpacing:'1.5px', fontWeight:'700', textTransform:'uppercase' as const, transition:'border 0.2s', boxSizing:'border-box' as const },
  }

  return (
    <div style={s.page}>
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'50vw', height:'50vw', background:'radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)', filter:'blur(60px)', zIndex:0, pointerEvents:'none' }} />

      <nav style={s.nav}>
        <Link href="/dashboard" style={{ color:'#4b5563', textDecoration:'none', fontSize:'14px', fontWeight:'600' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'white', fontSize:'13px', fontWeight:'600', padding:'6px 14px', borderRadius:'9999px' }}>
            🪙 {credits>=999999?'Unlimited':credits} credits
          </span>
          <span style={{ background:'rgba(243,244,246,0.8)', color:'#374151', fontSize:'12px', fontWeight:'700', padding:'6px 12px', borderRadius:'9999px', border:'1px solid #e5e7eb' }}>
            {currentPlan.toUpperCase()} PLAN
          </span>
        </div>
      </nav>

      <main style={s.main}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <h1 style={{ fontSize:'44px', fontWeight:'900', color:'#111827', marginBottom:'12px', letterSpacing:'-1px' }}>Choose Your Plan</h1>
          <p style={{ color:'#4b5563', fontSize:'16px', maxWidth:'480px', margin:'0 auto' }}>
            Start free. Upgrade anytime. UPI & cards accepted instantly.
          </p>
        </div>

        {/* Alert */}
        {msg.text && (
          <div style={{ background:msg.type==='error'?'#fef2f2':'#f0fdf4', border:`1px solid ${msg.type==='error'?'#fecaca':'#bbf7d0'}`, color:msg.type==='error'?'#dc2626':'#059669', padding:'14px', borderRadius:'12px', maxWidth:'560px', margin:'0 auto 24px', fontWeight:'500', textAlign:'center' }}>
            {msg.text}
          </div>
        )}

        {/* ── DISCOUNT CODE BOX ── */}
        <div style={{ maxWidth:'480px', margin:'0 auto 36px', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'20px', padding:'22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
            <span style={{ fontSize:'22px' }}>🎟️</span>
            <div>
              <div style={{ color:'white', fontWeight:'800', fontSize:'15px' }}>Have a Discount Code?</div>
              <div style={{ color:'#94a3b8', fontSize:'12px', marginTop:'2px' }}>Apply it here to get a discount on your chosen plan</div>
            </div>
            {discountData && <button onClick={clearDiscount} style={{ marginLeft:'auto', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'7px', padding:'4px 10px', color:'#94a3b8', cursor:'pointer', fontSize:'12px' }}>Clear ✕</button>}
          </div>

          <div style={{ display:'flex', gap:'8px' }}>
            <input type="text" value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setCodError('');setCodSuccess('');setDiscountData(null)}}
              placeholder="e.g. SAVE50"
              style={{ ...s.inp, flex:1 }}
              onFocus={e=>e.currentTarget.style.borderColor='#7c3aed'}
              onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}
            />
            <button onClick={validateCode} disabled={!code.trim()||codeLoading} style={{
              padding:'12px 18px', background:code.trim()?'linear-gradient(135deg,#7c3aed,#2563eb)':'rgba(255,255,255,0.08)',
              border:'none', borderRadius:'12px', color:'white', fontWeight:'700', fontSize:'14px',
              cursor:code.trim()?'pointer':'not-allowed', flexShrink:0, whiteSpace:'nowrap' as const
            }}>
              {codeLoading ? '⏳' : 'Apply'}
            </button>
          </div>

          {codeError && (
            <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', color:'#fca5a5', fontSize:'13px' }}>
              {codeError}
            </div>
          )}
          {codeSuccess && (
            <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'10px', color:'#4ade80', fontSize:'13px', fontWeight:'700' }}>
              {codeSuccess}
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:'20px', marginBottom:'40px' }}>
          {plans.map((plan, idx) => {
            const isCurrent = currentPlan === plan.id
            const discounted = getDiscountedPrice(plan.price)
            const hasDisc = discountData && discounted < plan.price && plan.price > 0

            return (
              <div key={plan.id} style={{ ...s.card, border: plan.popular ? `2px solid #8b5cf6` : '1px solid rgba(255,255,255,0.5)', boxShadow: plan.popular ? '0 8px 32px rgba(139,92,246,0.2)' : '0 4px 20px rgba(0,0,0,0.04)', position:'relative' as const }}>
                {plan.popular && (
                  <div style={{ position:'absolute' as const, top:'-13px', left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#8b5cf6,#7c3aed)', color:'white', fontSize:'11px', fontWeight:'700', padding:'5px 16px', borderRadius:'9999px', whiteSpace:'nowrap' as const }}>
                    ⭐ Most Popular
                  </div>
                )}
                {isCurrent && <div style={{ background:'#dcfce7', color:'#065f46', fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'9999px', display:'inline-block', marginBottom:'10px', border:'1px solid #bbf7d0' }}>✅ Current Plan</div>}

                <h3 style={{ fontSize:'22px', fontWeight:'800', color:'#111827', marginBottom:'6px' }}>{plan.name}</h3>
                <div style={{ marginBottom:'6px', display:'flex', alignItems:'baseline', gap:'6px' }}>
                  {hasDisc && <span style={{ fontSize:'16px', color:'#9ca3af', textDecoration:'line-through' }}>{plan.priceLabel}</span>}
                  <span style={{ fontSize:'38px', fontWeight:'800', color:plan.color }}>{hasDisc ? `₹${discounted}` : plan.priceLabel}</span>
                  {plan.price>0 && <span style={{ color:'#6b7280', fontSize:'14px' }}>/mo</span>}
                </div>
                {hasDisc && (
                  <div style={{ background:'#dcfce7', color:'#059669', fontSize:'12px', fontWeight:'700', padding:'3px 10px', borderRadius:'9999px', display:'inline-block', marginBottom:'8px' }}>
                    {discountData.discount_percent>0?`${discountData.discount_percent}% OFF`:`₹${discountData.discount_amount} OFF`} applied!
                  </div>
                )}
                <p style={{ color:'#4b5563', fontSize:'13px', marginBottom:'18px', fontWeight:'600' }}>{plan.creditsLabel}</p>
                <div style={{ marginBottom:'22px', flex:1 }}>
                  {plan.features.map((f,i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'9px', alignItems:'flex-start' }}>
                      <span style={{ color:plan.color, flexShrink:0, fontWeight:'bold', marginTop:'1px' }}>✓</span>
                      <span style={{ fontSize:'13px', color:'#374151', fontWeight:'500', lineHeight:'1.4' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => pay(plan.id)} disabled={loading===plan.id||plan.id==='free'||isCurrent}
                  style={{
                    width:'100%', padding:'14px', borderRadius:'14px', border:'none', fontSize:'15px', fontWeight:'700', marginTop:'auto',
                    cursor:(isCurrent||plan.id==='free'||loading===plan.id)?'not-allowed':'pointer',
                    background:isCurrent?'#e5e7eb':plan.id==='free'?'#f3f4f6':loading===plan.id?'#cbd5e1':plan.popular?'linear-gradient(135deg,#8b5cf6,#7c3aed)':plan.color,
                    color:(isCurrent||plan.id==='free')?'#6b7280':'white',
                    boxShadow:(!isCurrent&&plan.id!=='free')?`0 6px 16px ${plan.color}40`:'none',
                    transition:'all 0.25s'
                  }}>
                  {loading===plan.id?'⏳ Processing...'
                    :isCurrent?'Current Plan'
                    :plan.id==='free'?'Free Forever'
                    :`Upgrade → ${hasDisc?`₹${discounted}`:plan.priceLabel}`}
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ textAlign:'center', color:'#6b7280', fontSize:'13px' }}>
          🔒 Secured by Razorpay · UPI, Cards & Net Banking · Cancel anytime
        </div>
      </main>
    </div>
  )
}