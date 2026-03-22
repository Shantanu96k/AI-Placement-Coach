'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Tab = 'profile' | 'security' | 'notifications' | 'preferences' | 'privacy' | 'billing'

const TARGET_COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'HCL', 'Cognizant', 'Amazon', 'Google', 'Microsoft', 'Flipkart', 'Deloitte', 'KPMG']
const GRAD_YEARS = Array.from({ length: 10 }, (_, i) => 2020 + i)
const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'MBA', 'BCA', 'MCA', 'Other']
const DEFAULT_COMPANIES = ['TCS/Infosys/Wipro', 'Amazon/Google/Microsoft', 'General']
const ROUND_TYPES = ['HR', 'Technical', 'Mixed', 'Aptitude']

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState('free')
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [branch, setBranch] = useState('')
  const [city, setCity] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [targetCompanies, setTargetCompanies] = useState<string[]>([])
  const [bio, setBio] = useState('')

  // Security state
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Notifications state
  const [notifs, setNotifs] = useState({
    daily_tips: true,
    achievement_alerts: true,
    low_credits: true,
    whatsapp_reminders: false,
    weekly_report: true,
    product_updates: false,
    interview_reminders: true,
  })

  // Preferences state
  const [prefs, setPrefs] = useState({
    default_company: 'TCS/Infosys/Wipro',
    default_round: 'HR',
    whatsapp_questions: '10',
    language: 'English',
    autosave_resume: true,
    show_ats_tips: true,
    dark_mode: true,
    compact_mode: false,
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan, credits_remaining')
          .eq('user_id', user.id)
          .single()
        if (sub) { setPlan(sub.plan); setCredits(sub.credits_remaining) }

        // Load profile from user metadata
        const meta = user.user_metadata || {}
        setDisplayName(meta.display_name || meta.full_name || user.email?.split('@')[0] || '')
        setPhone(meta.phone || '')
        setCollege(meta.college || '')
        setBranch(meta.branch || '')
        setCity(meta.city || '')
        setGradYear(meta.grad_year || '')
        setTargetRole(meta.target_role || '')
        setTargetCompanies(meta.target_companies || [])
        setBio(meta.bio || '')

        // Load saved settings
        try {
          const { data: settingsRow } = await supabase
            .from('user_settings')
            .select('notifications, preferences')
            .eq('user_id', user.id)
            .single()
          if (settingsRow?.notifications) setNotifs(prev => ({ ...prev, ...settingsRow.notifications }))
          if (settingsRow?.preferences) setPrefs(prev => ({ ...prev, ...settingsRow.preferences }))
        } catch { /* table may not exist — use defaults */ }

      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [router])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          full_name: displayName,
          phone, college, branch, city,
          grad_year: gradYear,
          target_role: targetRole,
          target_companies: targetCompanies,
          bio,
        }
      })
      showToast('Profile updated successfully!')
    } catch (e: any) {
      showToast(e.message || 'Failed to save profile', 'error')
    } finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!newPwd || newPwd.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }
    if (newPwd !== confirmPwd) { showToast('Passwords do not match', 'error'); return }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error
      showToast('Password changed successfully!')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch (e: any) {
      showToast(e.message || 'Failed to change password', 'error')
    } finally { setSaving(false) }
  }

  const saveNotifications = async () => {
    setSaving(true)
    try {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        notifications: notifs,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      showToast('Notification preferences saved!')
    } catch { showToast('Saved locally (settings table not set up yet)', 'info') }
    finally { setSaving(false) }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        preferences: prefs,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      showToast('Preferences saved!')
    } catch { showToast('Saved locally (settings table not set up yet)', 'info') }
    finally { setSaving(false) }
  }

  const downloadData = async () => {
    const data = {
      profile: { email: user?.email, displayName, phone, college, branch, city, gradYear, targetRole, targetCompanies, bio },
      plan, credits,
      notifications: notifs,
      preferences: prefs,
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'my-placement-coach-data.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('Data downloaded!')
  }

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { showToast('Type DELETE to confirm', 'error'); return }
    showToast('Account deletion requested. Contact support@placementcoach.in to complete deletion.', 'info')
    setShowDeleteConfirm(false)
  }

  const toggleCompany = (c: string) =>
    setTargetCompanies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'security', icon: '🔐', label: 'Security' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'preferences', icon: '⚙️', label: 'Preferences' },
    { id: 'privacy', icon: '🛡️', label: 'Privacy & Data' },
    { id: 'billing', icon: '💳', label: 'Billing' },
  ]

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: 'white',
    fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block', color: '#94a3b8',
    fontSize: '11px', fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px', marginBottom: '7px',
  }

  const Toggle = ({ checked, onChange, color = '#2563eb' }: { checked: boolean; onChange: () => void; color?: string }) => (
    <div onClick={onChange}
      style={{ width: '46px', height: '26px', borderRadius: '13px', background: checked ? color : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'all 0.25s' }}>
      <div style={{ position: 'absolute', top: '3px', left: checked ? '23px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: '48px', height: '48px', border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const PLAN_COLORS: Record<string, string> = { free: '#64748b', basic: '#2563eb', pro: '#7c3aed', premium: '#d97706' }
  const planColor = PLAN_COLORS[plan] || '#64748b'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .settings-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; }
        .settings-input::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #1e293b; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        .tab-item { transition: all 0.2s; }
        .tab-item:hover { transform: translateX(3px); }
        .section-fade { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0f1a', fontFamily: "'Inter', sans-serif", color: 'white', display: 'flex' }}>

        {/* Toast */}
        {toast.show && (
          <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: toast.type === 'success' ? 'rgba(22,163,74,0.95)' : toast.type === 'error' ? 'rgba(220,38,38,0.95)' : 'rgba(37,99,235,0.95)', color: 'white', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'toastIn 0.3s ease', maxWidth: '380px' }}>
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
          </div>
        )}

        {/* Sidebar */}
        <div style={{ width: '260px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '28px 16px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          {/* Back to dashboard */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '13px', fontWeight: '600', marginBottom: '28px', padding: '8px 10px', borderRadius: '8px', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748b'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
            ← Dashboard
          </Link>

          {/* User pill */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px', marginBottom: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>
              {(displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '700', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {displayName || user?.email?.split('@')[0]}
            </div>
            <div style={{ color: '#64748b', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {user?.email}
            </div>
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${planColor}20`, border: `1px solid ${planColor}40`, borderRadius: '6px', padding: '3px 10px' }}>
              <span style={{ color: planColor, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' as const }}>{plan}</span>
            </div>
          </div>

          <p style={{ fontSize: '10px', fontWeight: '700', color: '#334155', letterSpacing: '0.15em', padding: '0 8px', marginBottom: '8px' }}>SETTINGS</p>

          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="tab-item"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer', marginBottom: '3px', background: activeTab === tab.id ? 'rgba(124,58,237,0.15)' : 'transparent', color: activeTab === tab.id ? 'white' : '#64748b', fontWeight: activeTab === tab.id ? '600' : '400', fontSize: '14px', textAlign: 'left' as const, borderLeft: `3px solid ${activeTab === tab.id ? '#a78bfa' : 'transparent'}` }}>
              <span style={{ fontSize: '17px', filter: activeTab === tab.id ? 'drop-shadow(0 0 6px rgba(167,139,250,0.6))' : 'none' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', maxHeight: '100vh' }}>

          {/* ── PROFILE ─────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="section-fade">
              <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>👤 Profile</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Your personal information and placement targets.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '700px' }}>
                {[
                  { label: 'Display Name', val: displayName, set: setDisplayName, ph: 'Rahul Sharma' },
                  { label: 'Phone Number', val: phone, set: setPhone, ph: '+91 9876543210' },
                  { label: 'College / University', val: college, set: setCollege, ph: 'VNIT Nagpur' },
                  { label: 'City', val: city, set: setCity, ph: 'Nagpur, Maharashtra' },
                  { label: 'Target Role', val: targetRole, set: setTargetRole, ph: 'Software Engineer' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="settings-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ ...inputStyle }} />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>Branch / Degree</label>
                  <select value={branch} onChange={e => setBranch(e.target.value)} className="settings-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select branch</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Graduation Year</label>
                  <select value={gradYear} onChange={e => setGradYear(e.target.value)} className="settings-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select year</option>
                    {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Bio / About Me</label>
                  <textarea className="settings-input" value={bio} onChange={e => setBio(e.target.value)} placeholder="A passionate CS student targeting product companies..." rows={3} style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: '1.6' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Target Companies (select multiple)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '4px' }}>
                    {TARGET_COMPANIES.map(c => (
                      <button key={c} onClick={() => toggleCompany(c)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${targetCompanies.includes(c) ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.08)'}`, background: targetCompanies.includes(c) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', color: targetCompanies.includes(c) ? '#c4b5fd' : '#64748b', fontSize: '13px', fontWeight: targetCompanies.includes(c) ? '700' : '400', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {targetCompanies.includes(c) ? '✓ ' : ''}{c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={saveProfile} disabled={saving}
                style={{ marginTop: '28px', padding: '13px 32px', background: saving ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none', borderRadius: '12px', color: saving ? '#475569' : 'white', fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 16px rgba(124,58,237,0.35)' }}>
                {saving ? '⏳ Saving...' : '💾 Save Profile'}
              </button>
            </div>
          )}

          {/* ── SECURITY ────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="section-fade">
              <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>🔐 Security</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Manage your account password and security settings.</p>

              {/* Email (readonly) */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', maxWidth: '500px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✉️</div>
                  <div>
                    <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', marginBottom: '3px' }}>ACCOUNT EMAIL</p>
                    <p style={{ color: 'white', fontSize: '15px', fontWeight: '600' }}>{user?.email}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '6px', padding: '3px 10px' }}>
                    <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: '700' }}>✓ Verified</span>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px', maxWidth: '500px', marginBottom: '28px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>🔑 Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
                  {[
                    { label: 'New Password', val: newPwd, set: setNewPwd, ph: 'Min 6 characters' },
                    { label: 'Confirm New Password', val: confirmPwd, set: setConfirmPwd, ph: 'Repeat new password' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type="password" className="settings-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={inputStyle} />
                    </div>
                  ))}

                  {newPwd && confirmPwd && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: newPwd === confirmPwd ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)' }}>
                      <span>{newPwd === confirmPwd ? '✅' : '❌'}</span>
                      <span style={{ color: newPwd === confirmPwd ? '#4ade80' : '#fca5a5', fontSize: '13px' }}>
                        {newPwd === confirmPwd ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}

                  <button onClick={changePassword} disabled={saving || !newPwd || newPwd !== confirmPwd}
                    style={{ padding: '12px', background: (saving || !newPwd || newPwd !== confirmPwd) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #1e40af)', border: 'none', borderRadius: '10px', color: (saving || !newPwd || newPwd !== confirmPwd) ? '#334155' : 'white', fontWeight: '700', cursor: (saving || !newPwd || newPwd !== confirmPwd) ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                    {saving ? '⏳ Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* Security Tips */}
              <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px', padding: '16px 20px', maxWidth: '500px', marginBottom: '28px' }}>
                <p style={{ color: '#93c5fd', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>🛡️ Security Tips</p>
                {['Use a password with 8+ characters, numbers and symbols', 'Never share your password with anyone', 'Log out from shared devices after use'].map((tip, i) => (
                  <p key={i} style={{ color: '#64748b', fontSize: '13px', marginBottom: i < 2 ? '5px' : '0' }}>• {tip}</p>
                ))}
              </div>

              {/* Danger Zone */}
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '24px', maxWidth: '500px' }}>
                <h3 style={{ color: '#fca5a5', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>⚠️ Danger Zone</h3>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  Deleting your account is permanent. All data including resumes, interview history, and credits will be lost.
                </p>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', color: '#fca5a5', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    🗑 Delete My Account
                  </button>
                ) : (
                  <div>
                    <p style={{ color: '#fca5a5', fontSize: '13px', marginBottom: '10px' }}>Type <strong>DELETE</strong> to confirm:</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE" className="settings-input" style={{ ...inputStyle, flex: 1 }} />
                      <button onClick={deleteAccount} style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Confirm</button>
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ───────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="section-fade">
              <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>🔔 Notifications</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Control what alerts you receive and when.</p>

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', maxWidth: '580px' }}>
                {[
                  { key: 'daily_tips', icon: '💡', title: 'Daily Interview Tips', desc: 'Get a new strategy tip every morning via email', color: '#7c3aed' },
                  { key: 'achievement_alerts', icon: '🏆', title: 'Achievement Alerts', desc: 'Notify when you unlock a milestone or badge', color: '#d97706' },
                  { key: 'low_credits', icon: '⚡', title: 'Low Credits Warning', desc: 'Alert when credits drop below 5', color: '#2563eb' },
                  { key: 'whatsapp_reminders', icon: '📱', title: 'WhatsApp Practice Reminders', desc: 'Daily questions delivered to your WhatsApp', color: '#25d366' },
                  { key: 'weekly_report', icon: '📊', title: 'Weekly Progress Report', desc: 'Summary of your practice activity each Sunday', color: '#059669' },
                  { key: 'interview_reminders', icon: '🎯', title: 'Interview Practice Reminders', desc: 'Remind you to practice when you haven\'t in 2 days', color: '#6366f1' },
                  { key: 'product_updates', icon: '🚀', title: 'Product Updates', desc: 'New features, templates, and improvements', color: '#64748b' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '3px' }}>{item.title}</p>
                        <p style={{ color: '#64748b', fontSize: '12px' }}>{item.desc}</p>
                      </div>
                    </div>
                    <Toggle
                      checked={notifs[item.key as keyof typeof notifs]}
                      onChange={() => setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifs] }))}
                      color={item.color}
                    />
                  </div>
                ))}
              </div>

              <button onClick={saveNotifications} disabled={saving}
                style={{ marginTop: '24px', padding: '13px 32px', background: saving ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none', borderRadius: '12px', color: saving ? '#475569' : 'white', fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Saving...' : '💾 Save Notification Settings'}
              </button>
            </div>
          )}

          {/* ── PREFERENCES ─────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="section-fade">
              <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>⚙️ Preferences</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Customize your experience and interview defaults.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '680px' }}>

                {/* Interview defaults */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '14px' }}>🎯 INTERVIEW DEFAULTS</p>
                </div>

                <div>
                  <label style={labelStyle}>Default Company Type</label>
                  <select value={prefs.default_company} onChange={e => setPrefs(p => ({ ...p, default_company: e.target.value }))} className="settings-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                    {DEFAULT_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Default Round Type</label>
                  <select value={prefs.default_round} onChange={e => setPrefs(p => ({ ...p, default_round: e.target.value }))} className="settings-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                    {ROUND_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Daily WhatsApp Questions</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['5', '10', '15'].map(n => (
                      <button key={n} onClick={() => setPrefs(p => ({ ...p, whatsapp_questions: n }))}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: prefs.whatsapp_questions === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: prefs.whatsapp_questions === n ? 'white' : '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Answer Language</label>
                  <select value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))} className="settings-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['English', 'Hindi', 'Hinglish'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* App preferences */}
                <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '14px' }}>📱 APP BEHAVIOR</p>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                    {[
                      { key: 'autosave_resume', title: 'Auto-save resume drafts', desc: 'Automatically save while you type in the resume builder' },
                      { key: 'show_ats_tips', title: 'Show ATS tips while building', desc: 'Real-time improvement suggestions in the resume editor' },
                      { key: 'compact_mode', title: 'Compact dashboard layout', desc: 'Reduce card sizes for a denser view' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 18px' }}>
                        <div>
                          <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{item.title}</p>
                          <p style={{ color: '#64748b', fontSize: '12px' }}>{item.desc}</p>
                        </div>
                        <Toggle
                          checked={prefs[item.key as keyof typeof prefs] as boolean}
                          onChange={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={savePreferences} disabled={saving}
                style={{ marginTop: '24px', padding: '13px 32px', background: saving ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none', borderRadius: '12px', color: saving ? '#475569' : 'white', fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Saving...' : '💾 Save Preferences'}
              </button>
            </div>
          )}

          {/* ── PRIVACY ─────────────────────────────────── */}
          {activeTab === 'privacy' && (
            <div className="section-fade">
              <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>🛡️ Privacy & Data</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Manage your data and privacy settings.</p>

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px', maxWidth: '560px' }}>

                {/* Data Usage */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '12px' }}>📊 What We Store</h3>
                  {['Your resume content and ATS scores', 'Interview practice sessions and scores', 'AI chat history (current session only)', 'Account email, name, and subscription data', 'We never sell your data to third parties'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: i === 4 ? '#4ade80' : '#93c5fd', fontSize: '14px', flexShrink: 0 }}>{i === 4 ? '✅' : 'ℹ️'}</span>
                      <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{item}</p>
                    </div>
                  ))}
                </div>

                {/* Download data */}
                <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '14px', padding: '22px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>⬇️ Download My Data</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                    Get a JSON export of your profile, preferences, and activity data.
                  </p>
                  <button onClick={downloadData}
                    style={{ padding: '11px 22px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '10px', color: '#93c5fd', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    📥 Download My Data
                  </button>
                </div>

                {/* Chat history */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>💬 AI Chat History</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                    Chat conversations are not stored persistently. Each session starts fresh.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', padding: '6px 12px' }}>
                    <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>✅ Not stored after session ends</span>
                  </div>
                </div>

                {/* Privacy policy link */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                  <a href="/privacy" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>Privacy Policy →</a>
                  <span style={{ color: '#1e293b' }}>·</span>
                  <a href="/terms" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>Terms of Service →</a>
                </div>
              </div>
            </div>
          )}

          {/* ── BILLING ─────────────────────────────────── */}
          {activeTab === 'billing' && (
            <div className="section-fade">
              <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>💳 Billing & Subscription</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Manage your plan, credits, and payment history.</p>

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px', maxWidth: '560px' }}>

                {/* Current plan */}
                <div style={{ background: `${planColor}12`, border: `1px solid ${planColor}30`, borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '6px' }}>CURRENT PLAN</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>{plan === 'premium' ? '👑' : plan === 'pro' ? '🚀' : plan === 'basic' ? '⚡' : '🆓'}</span>
                        <span style={{ color: planColor, fontWeight: '900', fontSize: '24px', textTransform: 'uppercase' as const }}>{plan}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '6px' }}>CREDITS</p>
                      <span style={{ color: credits >= 999999 ? '#fcd34d' : '#60a5fa', fontWeight: '900', fontSize: '28px' }}>
                        {credits >= 999999 ? '∞' : credits}
                      </span>
                    </div>
                  </div>

                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ height: '100%', width: credits >= 999999 ? '100%' : `${Math.min((credits / (plan === 'pro' ? 200 : plan === 'basic' ? 50 : 10)) * 100, 100)}%`, background: planColor, borderRadius: '9999px' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href="/billing" style={{ flex: 1, padding: '11px', background: `${planColor}20`, border: `1px solid ${planColor}30`, borderRadius: '10px', color: planColor, fontSize: '13px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' as const }}>
                      {plan === 'free' || plan === 'basic' ? '⬆️ Upgrade Plan' : '✏️ Manage Plan'}
                    </Link>
                    <Link href="/buy-credits" style={{ flex: 1, padding: '11px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '10px', color: '#93c5fd', fontSize: '13px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' as const }}>
                      ⚡ Buy Credits
                    </Link>
                  </div>
                </div>

                {/* Credit costs reference */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '14px' }}>⚡ Credit Costs Reference</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { icon: '🤖', feature: 'AI Coach Chat', cost: '1 credit/msg' },
                      { icon: '📄', feature: 'Resume Builder', cost: '5 credits' },
                      { icon: '✍️', feature: 'Cover Letter', cost: '4 credits' },
                      { icon: '🎯', feature: 'ATS Scorer', cost: '2 credits' },
                      { icon: '🎤', feature: 'Voice Interview', cost: 'Included (Premium)' },
                      { icon: '📱', feature: 'WhatsApp Coach', cost: 'Included (Pro+)' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{item.icon}</span>
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>{item.feature}</div>
                          <div style={{ color: '#60a5fa', fontSize: '11px', fontWeight: '700' }}>{item.cost}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}