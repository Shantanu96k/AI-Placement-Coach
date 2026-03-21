'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminSuperWidget({ adminKey }: { adminKey: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeWidget, setActiveWidget] = useState('revenue')
  const [loading, setLoading] = useState(false)

  // Data states
  const [stats, setStats] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [flags, setFlags] = useState<any[]>([])
  const [colleges, setColleges] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])

  const apiCall = async (url: string) => {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }
    })
    return res.json()
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      const [statsData, ticketsData, flagsData, collegesData, referralsData, activityData] = await Promise.all([
        apiCall('/api/admin/stats'),
        apiCall('/api/admin/tickets'),
        apiCall('/api/admin/flags'),
        apiCall('/api/admin/colleges'),
        apiCall('/api/admin/referrals'),
        apiCall('/api/admin/activity?limit=10'),
      ])
      if (statsData.stats) setStats(statsData.stats)
      if (ticketsData.tickets) setTickets(ticketsData.tickets)
      if (flagsData.flags) setFlags(flagsData.flags)
      if (collegesData.colleges) setColleges(collegesData.colleges)
      if (referralsData.referrals) setReferrals(referralsData.referrals)
      if (activityData.logs) setActivity(activityData.logs)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) loadAll()
  }, [isOpen])

  const monthlyRevenue = ((stats?.planCounts?.basic || 0) * 99 +
    (stats?.planCounts?.pro || 0) * 299 +
    (stats?.planCounts?.premium || 0) * 499)

  const WIDGETS = [
    { id: 'revenue', icon: '💰', label: 'Revenue' },
    { id: 'tickets', icon: '🎫', label: 'Tickets', badge: tickets.filter(t => t.status === 'open').length },
    { id: 'flags', icon: '🚩', label: 'Flags', badge: flags.filter(f => f.enabled).length },
    { id: 'colleges', icon: '🎓', label: 'B2B' },
    { id: 'referrals', icon: '🤝', label: 'Referrals' },
    { id: 'activity', icon: '📋', label: 'Activity' },
  ]

  return (
    <div style={{
      marginTop: '32px',
      background: 'linear-gradient(135deg, rgba(220,38,38,0.05), rgba(124,58,237,0.05))',
      border: '1px solid rgba(220,38,38,0.15)',
      borderRadius: '20px',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>

      {/* Header — always visible */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '18px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #dc2626, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
          }}>🛡️</div>
          <div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
              Admin Intelligence Center
            </div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
              {isOpen ? 'Click to collapse' : 'Revenue • Tickets • Flags • B2B • Referrals • Activity'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isOpen && stats && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', padding: '4px 10px' }}>
                <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '700' }}>
                  ₹{monthlyRevenue.toLocaleString('en-IN')}/mo
                </span>
              </div>
              {tickets.filter(t => t.status === 'open').length > 0 && (
                <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', padding: '4px 10px' }}>
                  <span style={{ color: '#fca5a5', fontSize: '12px', fontWeight: '700' }}>
                    {tickets.filter(t => t.status === 'open').length} tickets
                  </span>
                </div>
              )}
            </div>
          )}
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', fontSize: '14px',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s'
          }}>▼</div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Top Summary Bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1px', background: 'rgba(255,255,255,0.04)'
          }}>
            {[
              { label: 'Monthly Revenue', value: `₹${monthlyRevenue.toLocaleString('en-IN')}`, color: '#4ade80', icon: '💰' },
              { label: 'Total Users', value: stats?.totalUsers || 0, color: '#60a5fa', icon: '👥' },
              { label: 'Open Tickets', value: tickets.filter(t => t.status === 'open').length, color: tickets.filter(t => t.status === 'open').length > 0 ? '#fca5a5' : '#4ade80', icon: '🎫' },
              { label: 'Active Flags', value: flags.filter(f => f.enabled).length, color: '#a78bfa', icon: '🚩' },
              { label: 'B2B Colleges', value: colleges.length, color: '#fbbf24', icon: '🎓' },
              { label: 'Pending Rewards', value: referrals.filter(r => !r.reward_given && r.status === 'signed_up').length, color: '#f472b6', icon: '🎁' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '16px', background: '#0a0f1a', textAlign: 'center' as const }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Widget Tabs */}
          <div style={{ padding: '16px 24px 0', display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)' }}>
            {WIDGETS.map(w => (
              <button key={w.id} onClick={() => setActiveWidget(w.id)}
                style={{
                  padding: '8px 16px', borderRadius: '10px 10px 0 0', border: 'none',
                  background: activeWidget === w.id ? '#0a0f1a' : 'transparent',
                  color: activeWidget === w.id ? 'white' : '#64748b',
                  fontSize: '13px', fontWeight: activeWidget === w.id ? '700' : '400',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  position: 'relative' as const
                }}>
                {w.icon} {w.label}
                {w.badge ? (
                  <span style={{
                    background: '#dc2626', color: 'white',
                    fontSize: '10px', fontWeight: '800',
                    padding: '1px 6px', borderRadius: '9999px'
                  }}>{w.badge}</span>
                ) : null}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={loadAll} style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>
                {loading ? '⏳' : '🔄'} Refresh
              </button>
              <Link href="/admin" style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.2)', color: '#fca5a5', fontSize: '12px', textDecoration: 'none', fontWeight: '600' }}>
                Full Admin →
              </Link>
            </div>
          </div>

          {/* Widget Content */}
          <div style={{ padding: '24px', background: '#0a0f1a', minHeight: '280px' }}>

            {loading && (
              <div style={{ textAlign: 'center' as const, padding: '40px', color: '#64748b' }}>
                Loading data...
              </div>
            )}

            {/* REVENUE WIDGET */}
            {!loading && activeWidget === 'revenue' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
                    💰 Revenue by Plan
                  </h3>
                  {[
                    { plan: 'Basic', price: 99, count: stats?.planCounts?.basic || 0, color: '#2563eb' },
                    { plan: 'Pro', price: 299, count: stats?.planCounts?.pro || 0, color: '#7c3aed' },
                    { plan: 'Premium', price: 499, count: stats?.planCounts?.premium || 0, color: '#d97706' },
                  ].map((item, i) => {
                    const revenue = item.price * item.count
                    const pct = monthlyRevenue > 0 ? Math.round((revenue / monthlyRevenue) * 100) : 0
                    return (
                      <div key={i} style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>{item.plan} × {item.count}</span>
                          <span style={{ color: item.color, fontWeight: '800', fontSize: '14px' }}>
                            ₹{revenue.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '9999px' }} />
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Total Monthly</span>
                    <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '20px' }}>
                      ₹{monthlyRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
                    📊 User Breakdown
                  </h3>
                  {[
                    { plan: 'Free', key: 'free', color: '#64748b', icon: '🆓' },
                    { plan: 'Basic', key: 'basic', color: '#2563eb', icon: '⚡' },
                    { plan: 'Pro', key: 'pro', color: '#7c3aed', icon: '🚀' },
                    { plan: 'Premium', key: 'premium', color: '#d97706', icon: '👑' },
                  ].map((item, i) => {
                    const count = stats?.planCounts?.[item.key] || 0
                    const total = stats?.totalUsers || 1
                    const pct = Math.round((count / total) * 100)
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', gap: '6px' }}>
                          <span>{item.icon}</span>{item.plan}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '9999px' }} />
                          </div>
                          <span style={{ color: item.color, fontWeight: '700', fontSize: '13px', minWidth: '28px', textAlign: 'right' as const }}>{count}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ marginTop: '16px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>Paid Conversion</span>
                      <span style={{ color: '#4ade80', fontWeight: '700', fontSize: '14px' }}>
                        {Math.round(((stats?.planCounts?.basic || 0) + (stats?.planCounts?.pro || 0) + (stats?.planCounts?.premium || 0)) / (stats?.totalUsers || 1) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TICKETS WIDGET */}
            {!loading && activeWidget === 'tickets' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>🎫 Support Tickets</h3>
                  <Link href="/admin" style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}>Manage All →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: '#4ade80' },
                    { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length, color: '#fbbf24' },
                    { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: '#60a5fa' },
                    { label: 'Urgent', value: tickets.filter(t => t.priority === 'urgent').length, color: '#fca5a5' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.value}</div>
                      <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {tickets.length === 0 ? (
                  <div style={{ textAlign: 'center' as const, padding: '20px', color: '#475569', fontSize: '13px' }}>
                    🎉 No tickets yet — all good!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', maxHeight: '200px', overflowY: 'auto' as const }}>
                    {tickets.slice(0, 5).map((ticket, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{ticket.subject}</span>
                          <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>{ticket.email}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ background: ticket.status === 'open' ? 'rgba(22,163,74,0.2)' : 'rgba(100,116,139,0.2)', color: ticket.status === 'open' ? '#4ade80' : '#94a3b8', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                            {ticket.status}
                          </span>
                          <span style={{ background: ticket.priority === 'urgent' ? 'rgba(220,38,38,0.2)' : 'rgba(37,99,235,0.2)', color: ticket.priority === 'urgent' ? '#fca5a5' : '#93c5fd', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FLAGS WIDGET */}
            {!loading && activeWidget === 'flags' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>🚩 Feature Flags</h3>
                  <Link href="/admin" style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}>Manage All →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {flags.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center' as const, padding: '20px', color: '#475569', fontSize: '13px' }}>No feature flags configured</div>
                  ) : flags.map((flag, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${flag.enabled ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{flag.name}</div>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>{flag.rollout_percent}% rollout</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ background: flag.enabled ? 'rgba(22,163,74,0.2)' : 'rgba(100,116,139,0.15)', color: flag.enabled ? '#4ade80' : '#64748b', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                          {flag.enabled ? '✅ LIVE' : '⏸ OFF'}
                        </span>
                        <span style={{ color: '#334155', fontSize: '10px' }}>{flag.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COLLEGES WIDGET */}
            {!loading && activeWidget === 'colleges' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>🎓 College / B2B Summary</h3>
                  <Link href="/admin" style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}>Manage All →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Total Colleges', value: colleges.length, color: '#60a5fa', icon: '🎓' },
                    { label: 'Total Students', value: colleges.reduce((a, c) => a + (c.students_count || 0), 0), color: '#4ade80', icon: '👥' },
                    { label: 'B2B Revenue', value: `₹${colleges.reduce((a, c) => a + c.students_count * c.price_per_student, 0).toLocaleString('en-IN')}`, color: '#fbbf24', icon: '💰' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.value}</div>
                      <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {colleges.length === 0 ? (
                  <div style={{ textAlign: 'center' as const, padding: '20px', color: '#475569', fontSize: '13px' }}>
                    No colleges added yet. <Link href="/admin" style={{ color: '#93c5fd' }}>Add colleges →</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', maxHeight: '160px', overflowY: 'auto' as const }}>
                    {colleges.map((college, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{college.name}</span>
                          <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>{college.city} • {college.students_count} students</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ color: '#4ade80', fontWeight: '700', fontSize: '13px' }}>
                            ₹{(college.students_count * college.price_per_student).toLocaleString('en-IN')}
                          </span>
                          <span style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' as const }}>
                            {college.plan}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REFERRALS WIDGET */}
            {!loading && activeWidget === 'referrals' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>🤝 Referral Stats</h3>
                  <Link href="/admin" style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}>Manage All →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Total', value: referrals.length, color: '#60a5fa', icon: '🤝' },
                    { label: 'Signed Up', value: referrals.filter(r => r.status !== 'pending').length, color: '#4ade80', icon: '✅' },
                    { label: 'Converted', value: referrals.filter(r => r.status === 'converted').length, color: '#fbbf24', icon: '💰' },
                    { label: 'Rewards Due', value: referrals.filter(r => !r.reward_given && r.status === 'signed_up').length, color: '#f472b6', icon: '🎁' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: s.color }}>{s.value}</div>
                      <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {referrals.filter(r => !r.reward_given && r.status === 'signed_up').length > 0 && (
                  <div style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#f472b6', fontWeight: '700', fontSize: '13px' }}>
                        🎁 {referrals.filter(r => !r.reward_given && r.status === 'signed_up').length} referral rewards pending!
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>Go to admin to give credit rewards</p>
                    </div>
                    <Link href="/admin" style={{ background: 'rgba(244,114,182,0.2)', border: '1px solid rgba(244,114,182,0.3)', color: '#f472b6', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>
                      Give Rewards →
                    </Link>
                  </div>
                )}
                {referrals.length === 0 && (
                  <div style={{ textAlign: 'center' as const, padding: '20px', color: '#475569', fontSize: '13px' }}>
                    No referrals yet. Share your platform to get referrals!
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY WIDGET */}
            {!loading && activeWidget === 'activity' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>📋 Recent Activity</h3>
                  <Link href="/admin" style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}>View All →</Link>
                </div>
                {activity.length === 0 ? (
                  <div style={{ textAlign: 'center' as const, padding: '20px', color: '#475569', fontSize: '13px' }}>
                    No activity logs yet. Users need to interact with the app first.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', maxHeight: '260px', overflowY: 'auto' as const }}>
                    {activity.map((log, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                          {log.action?.includes('resume') ? '📄' : log.action?.includes('interview') ? '🎯' : log.action?.includes('login') ? '🔑' : log.action?.includes('pay') ? '💳' : '⚡'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600' }}>{log.email || 'Unknown'}</div>
                          <div style={{ color: '#64748b', fontSize: '11px' }}>{log.action}</div>
                        </div>
                        <div style={{ color: '#334155', fontSize: '10px', flexShrink: 0 }}>
                          {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 24px',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.04)'
          }}>
            <span style={{ color: '#334155', fontSize: '11px' }}>
              🔒 Admin view — visible only to you
            </span>
            <Link href="/admin" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Full Admin Panel →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}