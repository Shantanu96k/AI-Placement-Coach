'use client'
// components/SupportWidget.tsx
// Add to dashboard or any user page:
//   import SupportWidget from '@/components/SupportWidget'
//   <SupportWidget userId={user?.id} userEmail={user?.email} />
import { useState } from 'react'

const TYPES = [
  { id: 'bug',        label: '🐛 Bug Report',      desc: 'Something is broken' },
  { id: 'feature',    label: '💡 Feature Request',  desc: 'Suggest something new' },
  { id: 'feedback',   label: '⭐ Feedback',          desc: 'Share your experience' },
  { id: 'billing',    label: '💳 Billing Issue',     desc: 'Payment / credits problem' },
  { id: 'other',      label: '💬 Other',             desc: 'Anything else' },
]
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

export default function SupportWidget({
  userId, userEmail
}: { userId?: string; userEmail?: string }) {
  const [open, setOpen]   = useState(false)
  const [type, setType]   = useState('bug')
  const [subject, setSub] = useState('')
  const [message, setMsg] = useState('')
  const [priority, setPri]= useState('medium')
  const [loading, setLoad]= useState(false)
  const [done, setDone]   = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!subject.trim() || !message.trim()) { setError('Subject and message are required.'); return }
    setLoad(true); setError('')
    try {
      const res = await fetch('/api/support', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || null,
          email: userEmail || 'anonymous@user.com',
          subject: subject.trim(),
          message: message.trim(),
          type, priority
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to submit'); setLoad(false); return }
      setDone(true)
    } catch { setError('Network error. Please try again.') }
    setLoad(false)
  }

  const reset = () => {
    setOpen(false); setDone(false); setSub(''); setMsg(''); setType('bug')
    setPri('medium'); setError('')
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          border: 'none', borderRadius: '50px', padding: '12px 20px',
          color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        💬 Support
      </button>

      {/* Modal */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={e => { if (e.target === e.currentTarget) reset() }}>
          <div style={{
            background: '#0d1424', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '540px',
            maxHeight: '90vh', overflowY: 'auto', fontFamily: 'system-ui, sans-serif'
          }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ color: 'white', fontWeight: '800', fontSize: '22px', marginBottom: '10px' }}>Ticket Submitted!</h3>
                <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  We've received your message and will reply within 24 hours.
                </p>
                <button onClick={reset} style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', borderRadius: '12px', padding: '12px 32px', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ color: 'white', fontWeight: '800', fontSize: '20px' }}>💬 Contact Support</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Report a bug, request a feature, or just say hi!</p>
                  </div>
                  <button onClick={reset} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px' }}>⚠️ {error}</div>
                )}

                {/* Type selector */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TYPES.map(t => (
                      <button key={t.id} onClick={() => setType(t.id)} style={{
                        padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px',
                        background: type === t.id ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'rgba(255,255,255,0.06)',
                        color: type === t.id ? 'white' : '#94a3b8', fontWeight: type === t.id ? '700' : '400',
                        transition: 'all 0.15s'
                      }}>{t.label}</button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {PRIORITIES.map(p => {
                      const c = p === 'urgent' ? '#ef4444' : p === 'high' ? '#f97316' : p === 'medium' ? '#f59e0b' : '#22c55e'
                      return (
                        <button key={p} onClick={() => setPri(p)} style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                          background: priority === p ? `${c}25` : 'rgba(255,255,255,0.04)',
                          color: priority === p ? c : '#64748b',
                          border: priority === p ? `1px solid ${c}50` : '1px solid rgba(255,255,255,0.06)',
                          textTransform: 'capitalize'
                        } as any}>{p}</button>
                      )
                    })}
                  </div>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject *</label>
                  <input value={subject} onChange={e => setSub(e.target.value)} placeholder="Brief description of your issue..."
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message *</label>
                  <textarea value={message} onChange={e => setMsg(e.target.value)} rows={5}
                    placeholder="Describe in detail — include steps to reproduce, screenshots URLs, or suggestions..."
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                {userEmail && (
                  <p style={{ color: '#475569', fontSize: '12px', marginBottom: '16px' }}>
                    📧 Reply will be sent to <strong style={{ color: '#64748b' }}>{userEmail}</strong>
                  </p>
                )}

                <button onClick={submit} disabled={loading}
                  style={{ width: '100%', padding: '14px', background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', borderRadius: '12px', color: loading ? '#475569' : 'white', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  {loading ? '⏳ Submitting...' : '📨 Submit Ticket'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}