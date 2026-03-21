// @ts-nocheck
'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'credits', label: 'Add Credits', icon: '⚡' },
  { id: 'feature_costs', label: 'Credit Costs', icon: '🎮' },
  { id: 'revenue', label: 'Revenue', icon: '💰' },
  { id: 'tickets', label: 'Support', icon: '🎫' },
  { id: 'referrals', label: 'Referrals', icon: '🔗' },
  { id: 'colleges', label: 'Colleges', icon: '🎓' },
  { id: 'flags', label: 'Feature Flags', icon: '🚩' },
  { id: 'notifications', label: 'Notifications', icon: '📧' },
  { id: 'activity', label: 'Activity Logs', icon: '📋' },
  { id: 'discounts', label: 'Discounts', icon: '🎟️' },
  { id: 'pdfs', label: 'PDF Manager', icon: '📄' },
  { id: 'announcements', label: 'Announce', icon: '📢' },
  { id: 'templates', label: 'Templates', icon: '🎨' },
  { id: 'plan_features', label: 'Plan Features', icon: '🗂️' },
  { id: 'credit_packages', label: 'Credit Packages', icon: '⚡' },
  { id: 'plan_pricing', label: 'Plan Pricing', icon: '💳' },
]
const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'HCL', 'Tech Mahindra', 'Cognizant', 'Amazon', 'Google', 'Microsoft', 'Deloitte', 'KPMG', 'General']
const TOPICS = ['SQL', 'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOPs', 'System Design', 'HR Questions', 'Aptitude', 'General']
const ROUND_TYPES = ['Technical', 'HR', 'Aptitude', 'Mixed']

// ✅ ADD THIS — was missing/deleted
const FEATURE_DEFAULTS = [
  { key: 'ai_chat', label: 'AI Coach Chat', icon: '🤖', desc: 'Credits per message sent', default: 1 },
  { key: 'resume_builder', label: 'Resume Builder (AI Fill)', icon: '📄', desc: 'Credits for AI auto-fill', default: 5 },
  { key: 'cover_letter', label: 'Cover Letter Generator', icon: '✍️', desc: 'Credits per letter generated', default: 4 },
  { key: 'salary_evaluator', label: 'Salary Offer Evaluator', icon: '📊', desc: 'Credits per offer analysis', default: 3 },
  { key: 'salary_counter', label: 'Salary Counter Script', icon: '💬', desc: 'Credits per script generated', default: 4 },
  { key: 'salary_benchmark', label: 'Market Benchmark', icon: '📈', desc: 'Credits per benchmark lookup', default: 2 },
  { key: 'salary_roleplay', label: 'Negotiation Simulator', icon: '🎭', desc: 'Credits per roleplay session', default: 2 },
  { key: 'ats_score', label: 'ATS Resume Scorer', icon: '🎯', desc: 'Credits per ATS check', default: 3 },
  { key: 'interview_session', label: 'Interview Session', icon: '🎤', desc: 'Credits per mock interview round', default: 0 },
]

// ── Feature Cost Card ─────────────────────────────────────
function FeatureCostCard({ feature, costs, setCosts, adminKey, showToast }) {
  const [saving, setSaving] = useState(false)

  const saveCost = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/feature-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ feature: feature.key, cost: costs[feature.key] })
      })
      const data = await res.json()
      if (data.success) showToast(`✅ ${feature.label} set to ${costs[feature.key]} credits`)
      else showToast(data.error || 'Failed to save', 'error')
    } catch {
      showToast('Save failed', 'error')
    }
    setSaving(false)
  }

  const currentCost = costs[feature.key] ?? feature.default

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
          {feature.icon}
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{feature.label}</div>
          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{feature.desc}</div>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credits</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4, 5, 10].map(n => (
            <button key={n}
              onClick={() => setCosts(prev => ({ ...prev, [feature.key]: n }))}
              style={{ padding: '6px 11px', borderRadius: '8px', border: 'none', background: currentCost === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: currentCost === n ? 'white' : '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {n === 0 ? 'Free' : n}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
        <span style={{ color: '#64748b', fontSize: '12px' }}>Default: {feature.default} credits</span>
        <span style={{ color: currentCost === 0 ? '#4ade80' : '#60a5fa', fontWeight: '700', fontSize: '14px' }}>
          {currentCost === 0 ? 'FREE' : `${currentCost} credit${currentCost !== 1 ? 's' : ''}`}
        </span>
      </div>

      <button onClick={saveCost} disabled={saving}
        style={{ width: '100%', padding: '10px', background: saving ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', color: saving ? '#475569' : 'white', fontSize: '13px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>
        {saving ? 'Saving...' : '💾 Save'}
      </button>
    </div>
  )
}

// ── Feature Cost Manager ──────────────────────────────────
function FeatureCostManager({ adminKey, showToast }) {
  const [costs, setCosts] = useState(() =>
    Object.fromEntries(FEATURE_DEFAULTS.map(f => [f.key, f.default]))
  )
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/feature-costs', {
          headers: { 'x-admin-key': adminKey }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.costs) {
            const map = {}
            data.costs.forEach(c => { map[c.feature] = c.cost })
            setCosts(prev => ({ ...prev, ...map }))
          }
        }
      } catch { }
      setLoaded(true)
    }
    load()
  }, [adminKey])

  return (
    <div>
      <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px' }}>
        <p style={{ color: '#93c5fd', fontSize: '13px', lineHeight: '1.6' }}>
          💡 Set how many credits each feature costs. Set to <strong>0</strong> to make it free.
          Premium users are never gated. Changes apply immediately.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {FEATURE_DEFAULTS.map(f => (
          <FeatureCostCard
            key={f.key}
            feature={f}
            costs={costs}
            setCosts={setCosts}
            adminKey={adminKey}
            showToast={showToast}
          />
        ))}
      </div>
    </div>
  )
}

// ── Template Card ─────────────────────────────────────────
function TemplateCard({ template, adminKey, showToast }) {
  const [cost, setCost] = useState(template.credit_cost || 0)
  const [isFree, setIsFree] = useState(template.is_free ?? true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ action: 'update', templateId: template.id, updates: { credit_cost: cost, is_free: isFree } })
      })
      const data = await res.json()
      if (data.success) showToast(`${template.name} updated!`)
      else showToast(data.error || 'Failed', 'error')
    } catch { showToast('Failed to save', 'error') }
    setSaving(false)
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{template.name}</h3>
          <p style={{ color: '#64748b', fontSize: '12px' }}>{template.subtitle}</p>
        </div>
        <div style={{ background: isFree ? 'rgba(22,163,74,0.2)' : 'rgba(37,99,235,0.2)', color: isFree ? '#4ade80' : '#93c5fd', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', height: 'fit-content' }}>
          {isFree ? 'FREE' : `${cost} CREDITS`}
        </div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>CREDIT COST</label>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          {[0, 1, 2, 3, 5, 10].map(n => (
            <button key={n} onClick={() => { setCost(n); setIsFree(n === 0) }}
              style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: cost === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: cost === n ? 'white' : '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {n === 0 ? 'Free' : n}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleSave} disabled={saving}
        style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
        {saving ? 'Saving...' : '💾 Save Changes'}
      </button>
    </div>
  )
}

// ── Template Manager ──────────────────────────────────────
function TemplateManager({ adminKey, showToast }) {
  const [tab, setTab] = useState('upload')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [creditCost, setCreditCost] = useState(0)
  const [bestFor, setBestFor] = useState('All roles')
  const [columns, setColumns] = useState(1)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [atsScore, setAtsScore] = useState(95)
  const [badge, setBadge] = useState('Free')
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editCost, setEditCost] = useState(0)
  const fileInputRef = useRef(null)

  const defaultTemplates = [
    { id: 'nova', name: 'Nova', subtitle: 'Clean & Modern', credit_cost: 0, is_free: true },
    { id: 'pulse', name: 'Pulse', subtitle: 'Bold Two-Column', credit_cost: 3, is_free: false },
    { id: 'apex', name: 'Apex', subtitle: 'Executive Bold', credit_cost: 5, is_free: false },
    { id: 'zen', name: 'Zen', subtitle: 'Ultra Minimal', credit_cost: 0, is_free: true },
    { id: 'spark', name: 'Spark', subtitle: 'Creative Sidebar', credit_cost: 3, is_free: false },
    { id: 'bloom', name: 'Bloom', subtitle: 'Fresher Special', credit_cost: 0, is_free: true },
  ]

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const res = await fetch('/api/admin/templates', { headers: { 'x-admin-key': adminKey } })
      const data = await res.json()
      if (data.templates && data.templates.length > 0) setTemplates(data.templates)
      else setTemplates(defaultTemplates)
    } catch { setTemplates(defaultTemplates) }
    setLoadingTemplates(false)
  }

  useEffect(() => { loadTemplates() }, [adminKey])

  const handleFile = (f) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowed.includes(f.type)) { showToast('Only JPG, PNG, WebP, PDF, DOCX allowed', 'error'); return }
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result)
      reader.readAsDataURL(f)
    } else setPreview('')
    if (!name) setName(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file || !name) { showToast('Select a file and enter a name', 'error'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('name', name); fd.append('subtitle', subtitle || name)
      fd.append('credit_cost', creditCost.toString()); fd.append('best_for', bestFor)
      fd.append('columns', columns.toString()); fd.append('has_photo', hasPhoto.toString())
      fd.append('ats_score', atsScore.toString()); fd.append('badge', creditCost === 0 ? 'Free' : badge)
      fd.append('display_order', '99')
      const res = await fetch('/api/admin/upload-template', {
        method: 'POST', headers: { 'x-admin-key': adminKey }, body: fd
      })
      const data = await res.json()
      if (data.success) {
        showToast('✅ Template uploaded!')
        setFile(null); setPreview(''); setName(''); setSubtitle(''); setCreditCost(0)
        setTab('manage'); loadTemplates()
      } else showToast(data.error || 'Upload failed', 'error')
    } catch { showToast('Upload failed', 'error') }
    setUploading(false)
  }

  const handleToggle = async (id, current) => {
    const res = await fetch('/api/admin/upload-template', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id, is_active: !current })
    })
    const data = await res.json()
    if (data.success) { showToast(`Template ${!current ? 'enabled' : 'hidden'}`); loadTemplates() }
    else showToast(data.error, 'error')
  }

  const handleDelete = async (id, tName) => {
    if (!confirm(`Delete "${tName}"?`)) return
    const res = await fetch('/api/admin/upload-template', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id })
    })
    const data = await res.json()
    if (data.success) { showToast('Template deleted'); loadTemplates() }
    else showToast(data.error, 'error')
  }

  const handleEditCost = async (id) => {
    const res = await fetch('/api/admin/upload-template', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id, credit_cost: editCost, is_free: editCost === 0 })
    })
    const data = await res.json()
    if (data.success) { showToast(`Cost updated to ${editCost}`); setEditingId(null); loadTemplates() }
    else showToast(data.error, 'error')
  }

  const inp = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: 'white',
    fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit'
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        {[
          { id: 'upload', label: '📤 Upload New Template' },
          { id: 'manage', label: `📋 Manage Templates (${templates.length})` }
        ].map(t => (
          <button key={t.id}
            onClick={() => { setTab(t.id); if (t.id === 'manage') loadTemplates() }}
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', background: tab === t.id ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)', color: tab === t.id ? 'white' : '#64748b' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? '#2563eb' : file ? '#22c55e' : 'rgba(255,255,255,0.12)'}`, borderRadius: '16px', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(37,99,235,0.08)' : file ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
              {file ? (
                <div>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{file.type.startsWith('image') ? '🖼' : file.type.includes('pdf') ? '📄' : '📝'}</div>
                  <div style={{ color: '#22c55e', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{file.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{(file.size / 1024).toFixed(0)} KB</div>
                  <div style={{ color: '#2563eb', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>Click to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                  <div style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>Drop template file here</div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>or click to browse</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                    {['🖼 JPG/PNG', '📄 PDF', '📝 DOCX'].map(t => (
                      <span key={t} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '8px' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.doc" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            {[
              { label: 'Template Name *', val: name, set: setName, pl: 'e.g. Modern Pro, Executive Classic' },
              { label: 'Subtitle', val: subtitle, set: setSubtitle, pl: 'e.g. Clean & Minimal, Bold Two-Column' },
              { label: 'Best For', val: bestFor, set: setBestFor, pl: 'e.g. Software Engineer, Freshers' }
            ].map(f => (
              <div key={f.label}>
                <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                <input style={inp} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.pl} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Preview */}
            {preview ? (
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#f8fafc', maxHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: '260px', objectFit: 'contain' }} />
              </div>
            ) : file ? (
              <div style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>{file.type.includes('pdf') ? '📄' : '📝'}</div>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Preview not available for this file type</p>
              </div>
            ) : (
              <div style={{ borderRadius: '14px', border: '2px dashed rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🖼</div>
                <p style={{ color: '#334155', fontSize: '13px' }}>Image preview here</p>
              </div>
            )}

            {/* Credit Cost */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px' }}>
              <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Credit Cost: <span style={{ color: creditCost === 0 ? '#4ade80' : '#60a5fa' }}>{creditCost === 0 ? 'FREE' : `${creditCost} credits`}</span>
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[0, 1, 2, 3, 5, 8, 10].map(n => (
                  <button key={n}
                    onClick={() => { setCreditCost(n); setBadge(n === 0 ? 'Free' : n <= 3 ? 'Pro' : 'Premium') }}
                    style={{ padding: '8px 14px', borderRadius: '9px', border: 'none', background: creditCost === n ? (n === 0 ? '#16a34a' : '#2563eb') : 'rgba(255,255,255,0.06)', color: creditCost === n ? 'white' : '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                    {n === 0 ? '🆓 Free' : `⚡ ${n}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                <label style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>Columns</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2].map(n => (
                    <button key={n} onClick={() => setColumns(n)}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: columns === n ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: columns === n ? 'white' : '#64748b', fontWeight: '700', cursor: 'pointer' }}>{n} Col</button>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                <label style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>ATS Score</label>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {[88, 92, 95, 97, 100].map(n => (
                    <button key={n} onClick={() => setAtsScore(n)}
                      style={{ padding: '5px 9px', borderRadius: '7px', border: 'none', background: atsScore === n ? '#059669' : 'rgba(255,255,255,0.06)', color: atsScore === n ? 'white' : '#64748b', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>{n}%</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Photo toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
              <div onClick={() => setHasPhoto(!hasPhoto)}
                style={{ width: '44px', height: '24px', borderRadius: '12px', background: hasPhoto ? '#2563eb' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                <div style={{ position: 'absolute', top: '2px', left: hasPhoto ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <div>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Has Photo Placeholder</div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Does this template include a photo section?</div>
              </div>
            </div>

            <button onClick={handleUpload} disabled={uploading || !file || !name}
              style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', fontSize: '16px', fontWeight: '800', cursor: uploading || !file || !name ? 'not-allowed' : 'pointer', background: uploading || !file || !name ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #7c3aed)', color: !file || !name ? '#334155' : 'white', transition: 'all 0.3s' }}>
              {uploading ? '⏳ Uploading...' : !file ? '📁 Select file first' : !name ? '✍️ Enter a name' : '🚀 Upload Template'}
            </button>
          </div>
        </div>
      )}

      {tab === 'manage' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>{templates.length} templates</p>
            <button onClick={loadTemplates} style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>🔄 Refresh</button>
          </div>

          {loadingTemplates ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</div>
          ) : templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
              <p style={{ color: '#475569' }}>No templates yet. Upload one first!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {templates.map((t, i) => (
                <div key={t.id || i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.is_active !== false ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.1)'}`, borderRadius: '14px', padding: '16px 20px', opacity: t.is_active !== false ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {t.file_url && (t.file_type === 'image' || !t.file_type) ? (
                        <img src={t.file_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <span style={{ fontSize: '28px' }}>{t.file_type === 'pdf' ? '📄' : t.file_type === 'docx' ? '📝' : '🖼'}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>{t.name}</span>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>{t.subtitle}</span>
                        <span style={{ background: t.is_active !== false ? 'rgba(22,163,74,0.2)' : 'rgba(239,68,68,0.2)', color: t.is_active !== false ? '#4ade80' : '#fca5a5', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                          {t.is_active !== false ? 'ACTIVE' : 'HIDDEN'}
                        </span>
                        {t.source === 'admin_upload' && (
                          <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a78bfa', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>UPLOADED</span>
                        )}
                      </div>
                      <div style={{ color: '#475569', fontSize: '12px', marginBottom: '8px' }}>
                        {t.file_name || 'Built-in'} • {t.columns || 1} col • ATS {t.ats_score || 95}% • {t.best_for || 'All roles'}
                      </div>
                      {editingId === t.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {[0, 1, 2, 3, 5, 8, 10].map(n => (
                            <button key={n} onClick={() => setEditCost(n)}
                              style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: editCost === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: editCost === n ? 'white' : '#64748b', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                              {n === 0 ? 'Free' : n}
                            </button>
                          ))}
                          <button onClick={() => handleEditCost(t.id)} style={{ padding: '4px 12px', background: '#059669', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>✓ Save</button>
                          <button onClick={() => setEditingId(null)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: t.credit_cost === 0 ? 'rgba(22,163,74,0.2)' : 'rgba(37,99,235,0.2)', color: t.credit_cost === 0 ? '#4ade80' : '#93c5fd', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '7px' }}>
                            {t.credit_cost === 0 ? '🆓 FREE' : `⚡ ${t.credit_cost} credits`}
                          </span>
                          <button onClick={() => { setEditingId(t.id); setEditCost(t.credit_cost || 0) }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '11px', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                            ✏️ Edit Cost
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => handleToggle(t.id, t.is_active !== false)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: t.is_active !== false ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)', color: t.is_active !== false ? '#fca5a5' : '#4ade80', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        {t.is_active !== false ? '🔕 Hide' : '✅ Show'}
                      </button>
                      {t.source === 'admin_upload' && (
                        <button onClick={() => handleDelete(t.id, t.name)}
                          style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>🗑 Delete</button>
                      )}
                      {t.file_url && (
                        <a href={t.file_url} target="_blank" rel="noreferrer"
                          style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>👁 View</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
const DEFAULT_FEATURES = [
  { feature_key: 'ai_chat', feature_name: 'AI Coach Chat', feature_icon: '🤖', free_access: true, basic_access: true, pro_access: true, premium_access: true, free_credits: 1, basic_credits: 1, pro_credits: 1, premium_credits: 0, category: 'ai' },
  { feature_key: 'resume_builder', feature_name: 'Resume Builder', feature_icon: '📄', free_access: false, basic_access: true, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 5, pro_credits: 3, premium_credits: 0, category: 'resume' },
  { feature_key: 'cover_letter', feature_name: 'Cover Letter Generator', feature_icon: '✍️', free_access: false, basic_access: true, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 4, pro_credits: 2, premium_credits: 0, category: 'resume' },
  { feature_key: 'ats_score', feature_name: 'ATS Resume Scorer', feature_icon: '🎯', free_access: false, basic_access: true, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 3, pro_credits: 2, premium_credits: 0, category: 'resume' },
  { feature_key: 'interview_session', feature_name: 'Mock Interview', feature_icon: '🎤', free_access: false, basic_access: false, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 0, premium_credits: 0, category: 'interview' },
  { feature_key: 'voice_interview', feature_name: 'Voice Mock Interview', feature_icon: '🎙️', free_access: false, basic_access: false, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 0, premium_credits: 0, category: 'interview' },
  { feature_key: 'whatsapp_coach', feature_name: 'WhatsApp Daily Coach', feature_icon: '📱', free_access: false, basic_access: false, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 0, premium_credits: 0, category: 'coaching' },
  { feature_key: 'salary_evaluator', feature_name: 'Salary Offer Evaluator', feature_icon: '📊', free_access: false, basic_access: false, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 3, premium_credits: 0, category: 'salary' },
  { feature_key: 'salary_counter', feature_name: 'Salary Counter Script', feature_icon: '💬', free_access: false, basic_access: false, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 4, premium_credits: 0, category: 'salary' },
  { feature_key: 'salary_benchmark', feature_name: 'Market Benchmark', feature_icon: '📈', free_access: false, basic_access: false, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 2, premium_credits: 0, category: 'salary' },
  { feature_key: 'salary_roleplay', feature_name: 'Negotiation Simulator', feature_icon: '🎭', free_access: false, basic_access: false, pro_access: false, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 0, premium_credits: 0, category: 'salary' },
  { feature_key: 'career_center', feature_name: 'Career Center', feature_icon: '🎓', free_access: true, basic_access: true, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 0, premium_credits: 0, category: 'general' },
  { feature_key: 'referral', feature_name: 'Referral Program', feature_icon: '🤝', free_access: true, basic_access: true, pro_access: true, premium_access: true, free_credits: 0, basic_credits: 0, pro_credits: 0, premium_credits: 0, category: 'general' },
]
function PlanFeatureManager({ adminKey, showToast }) {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  const PLANS = [
    { key: 'free', label: 'Free', color: '#64748b', icon: '🆓' },
    { key: 'basic', label: 'Basic ₹99', color: '#2563eb', icon: '⚡' },
    { key: 'pro', label: 'Pro ₹299', color: '#7c3aed', icon: '🚀' },
    { key: 'premium', label: 'Premium ₹499', color: '#d97706', icon: '👑' },
  ]

  const CATEGORIES = ['all', 'ai', 'resume', 'interview', 'coaching', 'salary', 'general']

  useEffect(() => { if (adminKey) loadFeatures() }, [adminKey])

  const loadFeatures = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/plan-features', {
        headers: { 'x-admin-key': adminKey }
      })
      const data = await res.json()
      if (data.features && data.features.length > 0) {
        setFeatures(data.features)
      } else {
        setFeatures(DEFAULT_FEATURES)
      }
    } catch {
      setFeatures(DEFAULT_FEATURES)
    }
    setLoading(false)
  }

  const saveFeature = async (feature) => {
    setSaving(feature.feature_key)
    try {
      const res = await fetch('/api/admin/plan-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(feature)
      })
      const data = await res.json()
      if (data.success) showToast(data.message)
      else showToast(data.error, 'error')
    } catch { showToast('Save failed', 'error') }
    setSaving('')
  }

  const toggle = (featureKey, planKey) => {
    setFeatures(prev => prev.map(f => {
      if (f.feature_key !== featureKey) return f
      return { ...f, [`${planKey}_access`]: !f[`${planKey}_access`] }
    }))
  }

  const setCredits = (featureKey, planKey, value) => {
    setFeatures(prev => prev.map(f => {
      if (f.feature_key !== featureKey) return f
      return { ...f, [`${planKey}_credits`]: parseInt(value) || 0 }
    }))
  }

  const filtered = filterCat === 'all' ? features : features.filter(f => f.category === filterCat)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>🗂️ Plan & Feature Manager</h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Control which features each plan can access and how many credits they cost</p>
        </div>
        <button onClick={loadFeatures} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>🔄 Refresh</button>
      </div>

      {/* Plan Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {PLANS.map(plan => (
          <div key={plan.key} style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{plan.icon}</div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{plan.label}</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
              {features.filter(f => f[`${plan.key}_access`]).length} features
            </div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: filterCat === cat ? '#2563eb' : 'rgba(255,255,255,0.06)', color: filterCat === cat ? 'white' : '#64748b', fontSize: '12px', fontWeight: filterCat === cat ? '700' : '400', cursor: 'pointer', textTransform: 'capitalize' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px' }}>
        <p style={{ color: '#93c5fd', fontSize: '13px' }}>
          🔒 Toggle access on/off per plan. Set credits to <strong>0</strong> for unlimited use. Changes save per feature row.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading features...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(4, 1fr) 100px', gap: '0', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '12px 16px' }}>
            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700' }}>FEATURE</div>
            {PLANS.map(p => (
              <div key={p.key} style={{ color: p.color, fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>{p.icon} {p.label.split(' ')[0].toUpperCase()}</div>
            ))}
            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>ACTIONS</div>
          </div>

          {filtered.map((feature, i) => (
            <div key={feature.feature_key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', display: 'grid', gridTemplateColumns: '220px repeat(4, 1fr) 100px', gap: '0', alignItems: 'center' }}>

              {/* Feature Name */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>{feature.feature_icon}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{feature.feature_name}</div>
                  <div style={{ color: '#475569', fontSize: '10px', textTransform: 'capitalize', marginTop: '2px' }}>{feature.category}</div>
                </div>
              </div>

              {/* Per Plan Toggle + Credits */}
              {PLANS.map(plan => {
                const hasAccess = feature[`${plan.key}_access`]
                const credits = feature[`${plan.key}_credits`]
                return (
                  <div key={plan.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {/* Toggle */}
                    <div onClick={() => toggle(feature.feature_key, plan.key)}
                      style={{ width: '44px', height: '24px', borderRadius: '12px', background: hasAccess ? plan.color : 'rgba(255,255,255,0.08)', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: '2px', left: hasAccess ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                    <span style={{ color: hasAccess ? plan.color : '#334155', fontSize: '10px', fontWeight: '700' }}>
                      {hasAccess ? '✅ ON' : '🔒 OFF'}
                    </span>
                    {/* Credits input */}
                    {hasAccess && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="number" min="0" max="20" value={credits}
                          onChange={e => setCredits(feature.feature_key, plan.key, e.target.value)}
                          style={{ width: '44px', padding: '3px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '11px', outline: 'none', textAlign: 'center' }} />
                        <span style={{ color: '#475569', fontSize: '10px' }}>cr</span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Save Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => saveFeature(feature)} disabled={saving === feature.feature_key}
                  style={{ padding: '7px 14px', background: saving === feature.feature_key ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '8px', color: saving === feature.feature_key ? '#475569' : 'white', fontSize: '12px', fontWeight: '700', cursor: saving === feature.feature_key ? 'not-allowed' : 'pointer' }}>
                  {saving === feature.feature_key ? '...' : '💾 Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save All Button */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={async () => {
          let saved = 0
          for (const f of filtered) {
            setSaving(f.feature_key)
            try {
              const res = await fetch('/api/admin/plan-features', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                body: JSON.stringify(f)
              })
              const data = await res.json()
              if (data.success) saved++
            } catch { }
          }
          setSaving('')
          showToast(`✅ Saved ${saved}/${filtered.length} features!`)
        }}
          style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
          💾 Save All {filtered.length} Features
        </button>
        <button onClick={() => { setFeatures(DEFAULT_FEATURES); showToast('Reset to defaults — click Save All to apply') }}
          style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#64748b', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          🔄 Reset Defaults
        </button>
      </div>
    </div>
  )
}
function CreditPackageManager({ adminKey, showToast }) {
  const [packages, setPackages] = useState([])
  const [settings, setSettings] = useState({
    min_purchase_credits: '10',
    max_purchase_credits: '10000',
    credits_per_rupee: '1',
    referral_reward_credits: '50',
    referee_discount_percent: '10'
  })
  const [showForm, setShowForm] = useState(false)
  const [editPkg, setEditPkg] = useState(null)
  const [newPkg, setNewPkg] = useState({
    name: '', credits: 100, price_inr: 99,
    bonus_credits: 0, is_popular: false, display_order: 99
  })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => { loadPackages() }, [adminKey])

  const loadPackages = async () => {
    const res = await fetch('/api/admin/credit-packages', {
      headers: { 'x-admin-key': adminKey }
    })
    const data = await res.json()
    if (data.packages) setPackages(data.packages)

    // Load settings
    const { data: sData } = await (await import('@supabase/supabase-js'))
      .createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      .from('credit_settings').select('*')
    if (sData) {
      const map = {}
      sData.forEach(s => { map[s.setting_key] = s.setting_value })
      setSettings(prev => ({ ...prev, ...map }))
    }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    const res = await fetch('/api/admin/credit-packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ action: 'save_settings', settings })
    })
    const data = await res.json()
    if (data.success) showToast(data.message)
    else showToast(data.error, 'error')
    setSavingSettings(false)
  }

  const createPackage = async () => {
    const res = await fetch('/api/admin/credit-packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ action: 'create', ...newPkg })
    })
    const data = await res.json()
    if (data.success) {
      showToast(data.message); loadPackages(); setShowForm(false)
      setNewPkg({ name: '', credits: 100, price_inr: 99, bonus_credits: 0, is_popular: false, display_order: 99 })
    } else showToast(data.error, 'error')
  }

  const updatePackage = async (pkg) => {
    const res = await fetch('/api/admin/credit-packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ action: 'update', ...pkg })
    })
    const data = await res.json()
    if (data.success) { showToast(data.message); loadPackages(); setEditPkg(null) }
    else showToast(data.error, 'error')
  }

  const deletePackage = async (id) => {
    const res = await fetch('/api/admin/credit-packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ action: 'delete', id })
    })
    const data = await res.json()
    if (data.success) { showToast(data.message); loadPackages() }
  }

  const inp = { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>⚡ Credit Packages & Pricing</h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Manage credit packages and system-wide credit settings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          ➕ New Package
        </button>
      </div>

      {/* Credit Settings */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>⚙️ Credit System Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          {[
            { key: 'credits_per_rupee', label: 'Credits per ₹1', help: 'How many credits = 1 rupee' },
            { key: 'min_purchase_credits', label: 'Minimum Purchase (credits)', help: 'Min credits a user can buy' },
            { key: 'max_purchase_credits', label: 'Maximum Purchase (credits)', help: 'Max credits a user can buy' },
            { key: 'referral_reward_credits', label: 'Referral Reward (credits)', help: 'Credits given to referrer' },
            { key: 'referee_discount_percent', label: 'Referee Discount (%)', help: 'Discount for referred user' },
          ].map(s => (
            <div key={s.key}>
              <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                {s.label}
                <span style={{ color: '#475569', fontWeight: '400', marginLeft: '6px' }}>— {s.help}</span>
              </label>
              <input type="number" value={settings[s.key] || ''}
                onChange={e => setSettings(prev => ({ ...prev, [s.key]: e.target.value }))}
                style={inp} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '12px', width: '100%' }}>
              <div style={{ color: '#93c5fd', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>💡 Current Rate</div>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>
                ₹1 = {settings.credits_per_rupee} credit{parseFloat(settings.credits_per_rupee) !== 1 ? 's' : ''}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                Min: {settings.min_purchase_credits} | Max: {settings.max_purchase_credits}
              </div>
            </div>
          </div>
        </div>
        <button onClick={saveSettings} disabled={savingSettings}
          style={{ padding: '10px 24px', background: savingSettings ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #059669, #047857)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
          {savingSettings ? 'Saving...' : '💾 Save Settings'}
        </button>
      </div>

      {/* New Package Form */}
      {showForm && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>➕ Create New Package</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
            {[
              { key: 'name', label: 'Package Name', pl: 'e.g. Starter, Pro Pack', type: 'text' },
              { key: 'credits', label: 'Credits', pl: '100', type: 'number' },
              { key: 'price_inr', label: 'Price (₹)', pl: '99', type: 'number' },
              { key: 'bonus_credits', label: 'Bonus Credits', pl: '0', type: 'number' },
              { key: 'display_order', label: 'Display Order', pl: '1', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                <input type={f.type} value={newPkg[f.key]} placeholder={f.pl}
                  onChange={e => setNewPkg(prev => ({ ...prev, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                  style={inp} />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px' }}>
              <div onClick={() => setNewPkg(prev => ({ ...prev, is_popular: !prev.is_popular }))}
                style={{ width: '46px', height: '26px', borderRadius: '13px', background: newPkg.is_popular ? '#7c3aed' : 'rgba(255,255,255,0.08)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', left: newPkg.is_popular ? '23px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <span style={{ color: newPkg.is_popular ? '#c4b5fd' : '#64748b', fontWeight: '600', fontSize: '13px' }}>
                {newPkg.is_popular ? '⭐ Popular' : 'Not Popular'}
              </span>
            </div>
          </div>

          {/* Preview */}
          <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
            <p style={{ color: '#93c5fd', fontSize: '13px' }}>
              📦 Preview: <strong>{newPkg.name || 'Package'}</strong> — {newPkg.credits} credits
              {newPkg.bonus_credits > 0 ? ` + ${newPkg.bonus_credits} bonus` : ''} for <strong>₹{newPkg.price_inr}</strong>
              {newPkg.credits > 0 ? ` (₹${(newPkg.price_inr / (newPkg.credits + newPkg.bonus_credits)).toFixed(2)}/credit)` : ''}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={createPackage}
              style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              ✅ Create Package
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Packages List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {packages.map((pkg, i) => (
          <div key={pkg.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${pkg.is_popular ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '20px', opacity: pkg.is_active ? 1 : 0.5 }}>
            {editPkg?.id === pkg.id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  {[
                    { key: 'name', label: 'Name', type: 'text' },
                    { key: 'credits', label: 'Credits', type: 'number' },
                    { key: 'price_inr', label: 'Price (₹)', type: 'number' },
                    { key: 'bonus_credits', label: 'Bonus', type: 'number' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                      <input type={f.type} value={editPkg[f.key]}
                        onChange={e => setEditPkg(prev => ({ ...prev, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                        style={{ ...inp, padding: '6px 10px', fontSize: '12px' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => updatePackage(editPkg)} style={{ flex: 1, padding: '8px', background: '#059669', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>✓ Save</button>
                  <button onClick={() => setEditPkg(null)} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>{pkg.name}</span>
                    {pkg.is_popular && <span style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>⭐ POPULAR</span>}
                    {!pkg.is_active && <span style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>DISABLED</span>}
                  </div>
                  <div style={{ color: '#60a5fa', fontWeight: '900', fontSize: '22px' }}>
                    {pkg.credits} credits
                    {pkg.bonus_credits > 0 && <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: '700', marginLeft: '6px' }}>+{pkg.bonus_credits} bonus</span>}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                    ₹{pkg.price_inr} · ₹{(pkg.price_inr / (pkg.credits + (pkg.bonus_credits || 0))).toFixed(2)}/credit
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setEditPkg({ ...pkg })}
                    style={{ padding: '6px 12px', background: 'rgba(37,99,235,0.15)', border: 'none', borderRadius: '7px', color: '#93c5fd', fontSize: '12px', cursor: 'pointer' }}>✏️ Edit</button>
                  <button onClick={() => deletePackage(pkg.id)}
                    style={{ padding: '6px 10px', background: 'rgba(220,38,38,0.1)', border: 'none', borderRadius: '7px', color: '#fca5a5', fontSize: '12px', cursor: 'pointer' }}>🗑</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanPricingManager({ adminKey, showToast }) {
  const [plans, setPlans] = useState([])
  const [saving, setSaving] = useState('')

  useEffect(() => { loadPlans() }, [adminKey])

  const loadPlans = async () => {
    const res = await fetch('/api/admin/plan-pricing', {
      headers: { 'x-admin-key': adminKey }
    })
    const data = await res.json()
    if (data.plans) setPlans(data.plans)
  }

  const savePlan = async (plan) => {
    setSaving(plan.plan_key)
    const res = await fetch('/api/admin/plan-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(plan)
    })
    const data = await res.json()
    if (data.success) showToast(data.message)
    else showToast(data.error, 'error')
    setSaving('')
  }

  const PLAN_CONFIG = {
    free: { color: '#64748b', icon: '🆓', gradient: 'rgba(100,116,139,0.15)' },
    basic: { color: '#2563eb', icon: '⚡', gradient: 'rgba(37,99,235,0.15)' },
    pro: { color: '#7c3aed', icon: '🚀', gradient: 'rgba(124,58,237,0.15)' },
    premium: { color: '#d97706', icon: '👑', gradient: 'rgba(217,119,6,0.15)' },
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>💳 Plan Pricing Manager</h1>
        <p style={{ color: '#64748b', fontSize: '13px' }}>Set monthly and yearly prices for each subscription plan</p>
      </div>

      <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px' }}>
        <p style={{ color: '#93c5fd', fontSize: '13px' }}>
          💡 Changes apply to new subscriptions only. Existing subscribers keep their current price until renewal.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {plans.map((plan, i) => {
          const config = PLAN_CONFIG[plan.plan_key] || PLAN_CONFIG.free
          return (
            <div key={plan.id} style={{ background: config.gradient, border: `1px solid ${config.color}30`, borderRadius: '20px', padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${config.color}25`, border: `1px solid ${config.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  {config.icon}
                </div>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{plan.plan_name}</h3>
                  <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{plan.plan_key} plan</p>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ color: config.color, fontWeight: '900', fontSize: '22px' }}>₹{plan.price_monthly}/mo</div>
                  {plan.price_yearly > 0 && <div style={{ color: '#64748b', fontSize: '11px' }}>₹{plan.price_yearly}/yr</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>MONTHLY PRICE (₹)</label>
                  <input type="number" value={plan.price_monthly}
                    onChange={e => setPlans(prev => prev.map(p => p.plan_key === plan.plan_key ? { ...p, price_monthly: parseFloat(e.target.value) || 0 } : p))}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${config.color}40`, borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>YEARLY PRICE (₹)</label>
                  <input type="number" value={plan.price_yearly || 0}
                    onChange={e => setPlans(prev => prev.map(p => p.plan_key === plan.plan_key ? { ...p, price_yearly: parseFloat(e.target.value) || 0 } : p))}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${config.color}40`, borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>CREDITS INCLUDED</label>
                  <input type="number" value={plan.credits_included}
                    onChange={e => setPlans(prev => prev.map(p => p.plan_key === plan.plan_key ? { ...p, credits_included: parseInt(e.target.value) || 0 } : p))}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${config.color}40`, borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
              </div>

              {/* Yearly savings badge */}
              {plan.price_yearly > 0 && plan.price_monthly > 0 && (
                <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '16px' }}>
                  <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '700' }}>
                    💰 Yearly saves ₹{Math.round(plan.price_monthly * 12 - plan.price_yearly)} ({Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}% off)
                  </span>
                </div>
              )}

              <button onClick={() => savePlan(plan)} disabled={saving === plan.plan_key}
                style={{ width: '100%', padding: '12px', background: saving === plan.plan_key ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${config.color}, ${config.color}cc)`, border: 'none', borderRadius: '12px', color: saving === plan.plan_key ? '#475569' : 'white', fontSize: '14px', fontWeight: '700', cursor: saving === plan.plan_key ? 'not-allowed' : 'pointer' }}>
                {saving === plan.plan_key ? '⏳ Saving...' : `💾 Save ${plan.plan_name} Pricing`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Save All */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <button onClick={async () => {
          for (const plan of plans) { await savePlan(plan) }
          showToast('✅ All plan prices saved!')
        }}
          style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
          💾 Save All Plan Prices
        </button>
      </div>
    </div>
  )
}
// ── Main Admin Page ───────────────────────────────────────
export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [creditUserId, setCreditUserId] = useState('')
  const [creditUserEmail, setCreditUserEmail] = useState('')
  const [creditsToAdd, setCreditsToAdd] = useState(50)
  const [creditReason, setCreditReason] = useState('')
  const [planToSet, setPlanToSet] = useState('pro')
  const [discounts, setDiscounts] = useState([])
  const [discountCode, setDiscountCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(20)
  const [discountMaxUses, setDiscountMaxUses] = useState(100)
  const [discountExpiry, setDiscountExpiry] = useState('')
  const [discountDesc, setDiscountDesc] = useState('')
  const [discountPlan, setDiscountPlan] = useState('')
  const [pdfCompany, setPdfCompany] = useState('TCS')
  const [pdfTopic, setPdfTopic] = useState('General')
  const [pdfRound, setPdfRound] = useState('Technical')
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfResult, setPdfResult] = useState(null)
  const [allPdfQuestions, setAllPdfQuestions] = useState([])
  const [uploadHistory, setUploadHistory] = useState([])
  const [announcement, setAnnouncement] = useState('')
  const [announcementType, setAnnouncementType] = useState('info')
  const [analytics, setAnalytics] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [ticketFilter, setTicketFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [ticketReply, setTicketReply] = useState('')
  const [referrals, setReferrals] = useState<any[]>([])
  const [referralCodes, setReferralCodes] = useState<any[]>([])
  const [colleges, setColleges] = useState<any[]>([])
  const [flags, setFlags] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [showCollegeForm, setShowCollegeForm] = useState(false)

  // New college form
  const [newCollege, setNewCollege] = useState({
    name: '', city: '', state: '',
    contact_name: '', contact_email: '',
    contact_phone: '', students_count: 0,
    plan: 'trial', price_per_student: 99, notes: ''
  })

  // New notification form
  const [newNotif, setNewNotif] = useState({
    title: '', subject: '', body: '', target: 'all'
  })
  // New flag form
  const [newFlag, setNewFlag] = useState({
    name: '', description: '', rollout_percent: 50,
    variant_a: 'Control', variant_b: 'Test'
  })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const apiCall = async (url, method = 'GET', body) => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: body ? JSON.stringify(body) : undefined
    })
    return res.json()
  }

  const handleAuth = async () => {
    if (adminKey === ADMIN_KEY) {
      setIsAuth(true)
      loadStats(); loadUsers(); loadDiscounts()
      loadPdfQuestions(); loadAnalytics()
      loadTickets(); loadReferrals()
      loadColleges(); loadFlags(); loadNotifications()
    } else showToast('Invalid admin key', 'error')
  }

  const loadStats = async () => { const data = await apiCall('/api/admin/stats'); if (data.stats) setStats(data.stats) }
  const loadUsers = async () => { const data = await apiCall('/api/admin/users'); if (data.users) setUsers(data.users) }
  const loadDiscounts = async () => { const data = await apiCall('/api/admin/discounts'); if (data.discounts) setDiscounts(data.discounts) }
  const loadPdfQuestions = async () => {
    const res = await fetch('/api/admin/pdf-questions?limit=200')
    const data = await res.json()
    if (data.questions) setAllPdfQuestions(data.questions)
  }
  const loadActivityLogs = async () => {
    const data = await apiCall('/api/admin/activity?limit=100')
    if (data.logs) setActivityLogs(data.logs)
  }
  const loadTickets = async () => {
    const data = await apiCall('/api/admin/tickets')
    if (data.tickets) setTickets(data.tickets)
  }
  const loadColleges = async () => {
    const data = await apiCall('/api/admin/colleges')
    if (data.colleges) setColleges(data.colleges)
  }
  const loadFlags = async () => {
    const data = await apiCall('/api/admin/flags')
    if (data.flags) setFlags(data.flags)
  }
  const loadReferrals = async () => {
    const data = await apiCall('/api/admin/referrals')
    if (data.referrals) setReferrals(data.referrals)
  }
  const loadNotifications = async () => {
    setNotifications([])
  }
  const loadAnalytics = async () => {
    const data = await apiCall('/api/admin/stats')
    if (data.stats) setAnalytics(data.stats)
  }
  const handleAddCredits = async () => {
    if (!creditUserId || !creditsToAdd) { showToast('Fill all fields', 'error'); return }
    setLoading(true)
    const data = await apiCall('/api/admin/users', 'POST', { action: 'add_credits', userId: creditUserId, credits: creditsToAdd, reason: creditReason })
    setLoading(false)
    if (data.success) { showToast(data.message); loadUsers(); setCreditUserId(''); setCreditUserEmail(''); setCreditReason('') }
    else showToast(data.error || 'Failed', 'error')
  }

  const handleChangePlan = async (userId, plan) => {
    setLoading(true)
    const data = await apiCall('/api/admin/users', 'POST', { action: 'change_plan', userId, plan })
    setLoading(false)
    if (data.success) { showToast(data.message); loadUsers() }
    else showToast(data.error || 'Failed', 'error')
  }

  const handleBan = async (userId, ban) => {
    const data = await apiCall('/api/admin/users', 'POST', { action: ban ? 'ban_user' : 'unban_user', userId })
    if (data.success) { showToast(data.message); loadUsers() }
    else showToast(data.error || 'Failed', 'error')
  }

  const handleCreateDiscount = async () => {
    if (!discountCode || !discountPercent) { showToast('Fill code and percent', 'error'); return }
    setLoading(true)
    const data = await apiCall('/api/admin/discounts', 'POST', { code: discountCode, discount_percent: discountPercent, max_uses: discountMaxUses, valid_until: discountExpiry || null, plan_restriction: discountPlan || null, description: discountDesc })
    setLoading(false)
    if (data.success) { showToast(data.message); loadDiscounts(); setDiscountCode(''); setDiscountDesc(''); setDiscountExpiry('') }
    else showToast(data.error || 'Failed', 'error')
  }

  const handleDeleteDiscount = async (id) => {
    const data = await apiCall('/api/admin/discounts', 'DELETE', { id })
    if (data.success) { showToast('Discount deactivated'); loadDiscounts() }
  }

  const handlePdfUpload = async () => {
    if (!pdfFile) { showToast('Select a PDF', 'error'); return }
    setPdfLoading(true); setPdfResult(null)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile); formData.append('company', pdfCompany)
      formData.append('topic', pdfTopic); formData.append('roundType', pdfRound)
      formData.append('adminKey', adminKey)
      const res = await fetch('/api/admin/upload-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        showToast(data.message); setPdfResult(data)
        setUploadHistory(prev => [{ name: pdfFile.name, company: pdfCompany, topic: pdfTopic, count: data.count, status: 'success' }, ...prev])
        loadPdfQuestions(); setPdfFile(null)
      } else {
        showToast(data.error || 'Failed', 'error')
        setUploadHistory(prev => [{ name: pdfFile.name, company: pdfCompany, topic: pdfTopic, count: 0, status: 'error' }, ...prev])
      }
    } catch { showToast('Upload failed', 'error') }
    setPdfLoading(false)
  }

  const handleDeleteQuestion = async (id) => {
    await fetch('/api/admin/pdf-questions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, adminKey }) })
    setAllPdfQuestions(prev => prev.filter(q => q.id !== id))
    showToast('Question removed')
  }

  const findUser = (email) => {
    const user = users.find(u => u.email?.toLowerCase().includes(email.toLowerCase()))
    if (user) { setCreditUserId(user.user_id); setCreditUserEmail(user.email); showToast(`Found: ${user.email} (${user.plan} plan)`) }
    else showToast('User not found', 'error')
  }
  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(userSearch.toLowerCase()))

  // ── Login ─────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🔐</div>
            <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>Admin Panel</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>AI Placement Coach</p>
          </div>
          <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} placeholder="Enter admin secret key..."
            style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
          <button onClick={handleAuth} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
            Enter Admin Panel →
          </button>
          <p style={{ color: '#1e293b', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>Default key: admin123</p>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', display: 'flex' }}>

      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: toast.type === 'success' ? 'rgba(22,163,74,0.9)' : 'rgba(220,38,38,0.9)', color: 'white', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: '220px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 12px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', padding: '0 8px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '12px' }}>AI</div>
          <div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>Admin Panel</div>
            <div style={{ color: '#475569', fontSize: '10px' }}>PlacementCoach</div>
          </div>
        </div>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: activeTab === tab.id ? 'rgba(37,99,235,0.2)' : 'transparent', color: activeTab === tab.id ? '#93c5fd' : '#64748b', fontSize: '13px', fontWeight: activeTab === tab.id ? '600' : '400', cursor: 'pointer', marginBottom: '2px', textAlign: 'left' }}>
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '16px', paddingTop: '16px' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#475569', fontSize: '13px' }}>
            ← Exit Admin
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>📊 Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#60a5fa' },
                { label: 'Resumes Created', value: stats?.totalResumes || 0, icon: '📄', color: '#a78bfa' },
                { label: 'Interview Sessions', value: stats?.totalSessions || 0, icon: '🎯', color: '#4ade80' },
                { label: 'WhatsApp Users', value: stats?.whatsappUsers || 0, icon: '📱', color: '#fbbf24' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: stat.color, lineHeight: '1' }}>{stat.value}</div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>📈 Plan Distribution</h3>
                {[
                  { plan: 'Free', key: 'free', color: '#64748b' },
                  { plan: 'Basic', key: 'basic', color: '#2563eb' },
                  { plan: 'Pro', key: 'pro', color: '#7c3aed' },
                  { plan: 'Premium', key: 'premium', color: '#d97706' },
                ].map((item, i) => {
                  const count = stats?.planCounts?.[item.key] || 0
                  const total = stats?.totalUsers || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={i} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>{item.plan}</span>
                        <span style={{ color: item.color, fontWeight: '700', fontSize: '13px' }}>{count} users ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>⚡ Quick Actions</h3>
                {[
                  { label: 'Manage Users', tab: 'users', icon: '👥', color: '#2563eb' },
                  { label: 'Add Credits', tab: 'credits', icon: '⚡', color: '#7c3aed' },
                  { label: 'Feature Credit Costs', tab: 'feature_costs', icon: '🎮', color: '#ec4899' },
                  { label: 'Create Discount', tab: 'discounts', icon: '🎟️', color: '#059669' },
                  { label: 'Upload PDFs', tab: 'pdfs', icon: '📄', color: '#d97706' },
                  { label: 'Manage Templates', tab: 'templates', icon: '🎨', color: '#0891b2' },
                ].map((item, i) => (
                  <button key={i} onClick={() => setActiveTab(item.tab)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', marginBottom: '6px', textAlign: 'left' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{item.icon}</div>
                    <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>{item.label}</span>
                    <span style={{ marginLeft: 'auto', color: '#334155' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* CREDIT PACKAGES */}
        {activeTab === 'credit_packages' && (
          <CreditPackageManager adminKey={adminKey} showToast={showToast} />
        )}

        {/* PLAN PRICING */}
        {activeTab === 'plan_pricing' && (
          <PlanPricingManager adminKey={adminKey} showToast={showToast} />
        )}
        {/* ── ANALYTICS ─────────────────────────── */}
        {activeTab === 'analytics' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>📈 Analytics Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#60a5fa', change: '+12%' },
                { label: 'Resumes Built', value: stats?.totalResumes || 0, icon: '📄', color: '#a78bfa', change: '+8%' },
                { label: 'Interview Sessions', value: stats?.totalSessions || 0, icon: '🎯', color: '#4ade80', change: '+23%' },
                { label: 'WhatsApp Users', value: stats?.whatsappUsers || 0, icon: '📱', color: '#fbbf24', change: '+5%' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                    <span style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>{stat.change}</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Plan breakdown */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>📊 Plan Breakdown</h3>
                {[
                  { plan: 'Free', key: 'free', color: '#64748b', icon: '🆓' },
                  { plan: 'Basic ₹99', key: 'basic', color: '#2563eb', icon: '⚡' },
                  { plan: 'Pro ₹299', key: 'pro', color: '#7c3aed', icon: '🚀' },
                  { plan: 'Premium ₹499', key: 'premium', color: '#d97706', icon: '👑' },
                ].map((item, i) => {
                  const count = stats?.planCounts?.[item.key] || 0
                  const total = stats?.totalUsers || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={i} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span>{item.icon}</span>{item.plan}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ color: item.color, fontWeight: '700', fontSize: '13px' }}>{count} users</span>
                          <span style={{ color: '#334155', fontSize: '11px' }}>({pct}%)</span>
                        </div>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`, borderRadius: '9999px', transition: 'width 0.8s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Key Metrics */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>🎯 Key Metrics</h3>
                {[
                  { label: 'Avg Credits per User', value: '24', icon: '⚡', color: '#60a5fa' },
                  { label: 'Paid Conversion Rate', value: `${Math.round(((stats?.planCounts?.basic || 0) + (stats?.planCounts?.pro || 0) + (stats?.planCounts?.premium || 0)) / (stats?.totalUsers || 1) * 100)}%`, icon: '💰', color: '#4ade80' },
                  { label: 'Resumes per User', value: stats?.totalUsers ? (stats.totalResumes / stats.totalUsers).toFixed(1) : '0', icon: '📄', color: '#a78bfa' },
                  { label: 'Interview Sessions/User', value: stats?.totalUsers ? (stats.totalSessions / stats.totalUsers).toFixed(1) : '0', icon: '🎯', color: '#fbbf24' },
                  { label: 'WhatsApp Adoption', value: `${Math.round((stats?.whatsappUsers || 0) / (stats?.totalUsers || 1) * 100)}%`, icon: '📱', color: '#34d399' },
                  { label: 'PDF Questions', value: allPdfQuestions.length, icon: '📚', color: '#f472b6' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span>{m.icon}</span>{m.label}
                    </span>
                    <span style={{ color: m.color, fontWeight: '800', fontSize: '15px' }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Refresh button */}
            <button onClick={loadStats}
              style={{ marginTop: '20px', padding: '10px 20px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '10px', color: '#93c5fd', fontSize: '13px', cursor: 'pointer' }}>
              🔄 Refresh Analytics
            </button>
          </div>
        )}

        {/* ── REVENUE ────────────────────────────── */}
        {activeTab === 'revenue' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>💰 Revenue Tracking</h1>

            {/* Revenue Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Est. Monthly Revenue', value: `₹${((stats?.planCounts?.basic || 0) * 99 + (stats?.planCounts?.pro || 0) * 299 + (stats?.planCounts?.premium || 0) * 499).toLocaleString('en-IN')}`, color: '#4ade80', icon: '💰' },
                { label: 'Basic Plan Users', value: stats?.planCounts?.basic || 0, color: '#60a5fa', icon: '⚡' },
                { label: 'Pro Plan Users', value: stats?.planCounts?.pro || 0, color: '#a78bfa', icon: '🚀' },
                { label: 'Premium Plan Users', value: stats?.planCounts?.premium || 0, color: '#fcd34d', icon: '👑' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{stat.icon}</span>
                  <div style={{ fontSize: i === 0 ? '20px' : '28px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Revenue by Plan */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>💳 Revenue by Plan</h3>
                {[
                  { plan: 'Basic', price: 99, count: stats?.planCounts?.basic || 0, color: '#2563eb' },
                  { plan: 'Pro', price: 299, count: stats?.planCounts?.pro || 0, color: '#7c3aed' },
                  { plan: 'Premium', price: 499, count: stats?.planCounts?.premium || 0, color: '#d97706' },
                ].map((item, i) => {
                  const revenue = item.price * item.count
                  const total = (stats?.planCounts?.basic || 0) * 99 + (stats?.planCounts?.pro || 0) * 299 + (stats?.planCounts?.premium || 0) * 499
                  const pct = total > 0 ? Math.round((revenue / total) * 100) : 0
                  return (
                    <div key={i} style={{ marginBottom: '16px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${item.color}20` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{item.plan} Plan</span>
                          <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>₹{item.price}/mo × {item.count} users</span>
                        </div>
                        <span style={{ color: item.color, fontWeight: '800', fontSize: '16px' }}>₹{revenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  )
                })}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8', fontWeight: '600' }}>Total Monthly</span>
                  <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '20px' }}>
                    ₹{((stats?.planCounts?.basic || 0) * 99 + (stats?.planCounts?.pro || 0) * 299 + (stats?.planCounts?.premium || 0) * 499).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Revenue Growth Tips */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>🎯 Growth Opportunities</h3>
                {[
                  { title: 'Free → Basic upgrades', value: `${stats?.planCounts?.free || 0} potential users`, action: 'Send upgrade email', color: '#2563eb', icon: '📧' },
                  { title: 'Basic → Pro upgrades', value: `${stats?.planCounts?.basic || 0} potential users`, action: 'Offer WhatsApp feature', color: '#7c3aed', icon: '📱' },
                  { title: 'Pro → Premium upgrades', value: `${stats?.planCounts?.pro || 0} potential users`, action: 'Highlight salary coach', color: '#d97706', icon: '💰' },
                  { title: 'Referral conversions', value: `${referrals.filter(r => r.status === 'pending').length} pending`, action: 'Give referral rewards', color: '#059669', icon: '🤝' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      <div>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{item.title}</div>
                        <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{item.value}</div>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('users')}
                      style={{ background: `${item.color}20`, border: `1px solid ${item.color}30`, color: item.color, fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer' }}>
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY LOGS ──────────────────────── */}
        {activeTab === 'activity' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>📋 User Activity Logs</h1>
              <button onClick={loadActivityLogs}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
                🔄 Refresh
              </button>
            </div>

            {activityLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <p style={{ color: '#475569', marginBottom: '8px' }}>No activity logs yet</p>
                <p style={{ color: '#334155', fontSize: '13px' }}>Logs will appear as users interact with the app</p>
                <button onClick={loadActivityLogs}
                  style={{ marginTop: '16px', padding: '10px 20px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '10px', color: '#93c5fd', fontSize: '13px', cursor: 'pointer' }}>
                  Load Logs
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                {activityLogs.map((log, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {log.action?.includes('resume') ? '📄' : log.action?.includes('interview') ? '🎯' : log.action?.includes('login') ? '🔑' : log.action?.includes('pay') ? '💳' : '⚡'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>{log.email || 'Unknown User'}</div>
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{log.action}</div>
                    </div>
                    <div style={{ color: '#334155', fontSize: '11px' }}>
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUPPORT TICKETS ────────────────────── */}
        {activeTab === 'tickets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>🎫 Support Tickets</h1>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                  {tickets.filter(t => t.status === 'open').length} open •
                  {tickets.filter(t => t.status === 'in_progress').length} in progress •
                  {tickets.filter(t => t.status === 'resolved').length} resolved
                </p>
              </div>
              <button onClick={loadTickets}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
                🔄 Refresh
              </button>
            </div>

            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎫</div>
                <p style={{ color: '#475569' }}>No support tickets yet</p>
                <button onClick={loadTickets} style={{ marginTop: '16px', padding: '10px 20px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '10px', color: '#93c5fd', fontSize: '13px', cursor: 'pointer' }}>Load Tickets</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 400px' : '1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tickets.map((ticket, i) => (
                    <div key={i}
                      onClick={() => setSelectedTicket(ticket)}
                      style={{
                        background: selectedTicket?.id === ticket.id ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedTicket?.id === ticket.id ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{
                            background: ticket.priority === 'urgent' ? 'rgba(220,38,38,0.2)' : ticket.priority === 'high' ? 'rgba(217,119,6,0.2)' : 'rgba(37,99,235,0.2)',
                            color: ticket.priority === 'urgent' ? '#fca5a5' : ticket.priority === 'high' ? '#fcd34d' : '#93c5fd',
                            fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase'
                          }}>{ticket.priority}</span>
                          <span style={{
                            background: ticket.status === 'open' ? 'rgba(22,163,74,0.2)' : ticket.status === 'resolved' ? 'rgba(100,116,139,0.2)' : 'rgba(217,119,6,0.2)',
                            color: ticket.status === 'open' ? '#4ade80' : ticket.status === 'resolved' ? '#94a3b8' : '#fcd34d',
                            fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px'
                          }}>{ticket.status}</span>
                        </div>
                        <span style={{ color: '#334155', fontSize: '11px' }}>{new Date(ticket.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{ticket.subject}</div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>{ticket.email} • {ticket.message?.substring(0, 80)}...</div>
                    </div>
                  ))}
                </div>

                {selectedTicket && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', position: 'sticky', top: '20px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Ticket Details</h3>
                      <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>FROM</div>
                      <div style={{ color: 'white', fontSize: '13px' }}>{selectedTicket.email}</div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>SUBJECT</div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{selectedTicket.subject}</div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>MESSAGE</div>
                      <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>{selectedTicket.message}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>STATUS</label>
                        <select defaultValue={selectedTicket.status}
                          onChange={async e => {
                            await apiCall('/api/admin/tickets', 'POST', { id: selectedTicket.id, status: e.target.value, priority: selectedTicket.priority })
                            showToast('Status updated!'); loadTickets()
                          }}
                          style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }}>
                          {['open', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>PRIORITY</label>
                        <select defaultValue={selectedTicket.priority}
                          onChange={async e => {
                            await apiCall('/api/admin/tickets', 'POST', { id: selectedTicket.id, status: selectedTicket.status, priority: e.target.value })
                            showToast('Priority updated!'); loadTickets()
                          }}
                          style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }}>
                          {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p} style={{ background: '#1e293b' }}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>REPLY TO USER</label>
                      <textarea value={ticketReply} onChange={e => setTicketReply(e.target.value)}
                        placeholder="Type your reply..." rows={4}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <button
                      onClick={async () => {
                        await apiCall('/api/admin/tickets', 'POST', { id: selectedTicket.id, status: 'resolved', priority: selectedTicket.priority, admin_reply: ticketReply })
                        showToast('Reply saved & ticket resolved!'); loadTickets(); setTicketReply(''); setSelectedTicket(null)
                      }}
                      style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      📧 Send Reply & Resolve
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── REFERRALS ──────────────────────────── */}
        {activeTab === 'referrals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>🤝 Referral Management</h1>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                  {referrals.length} total • {referrals.filter(r => !r.reward_given).length} pending rewards
                </p>
              </div>
              <button onClick={loadReferrals}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
                🔄 Refresh
              </button>
            </div>

            {/* Referral Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Referrals', value: referrals.length, color: '#60a5fa', icon: '🤝' },
                { label: 'Signed Up', value: referrals.filter(r => r.status !== 'pending').length, color: '#4ade80', icon: '✅' },
                { label: 'Converted', value: referrals.filter(r => r.status === 'converted').length, color: '#fbbf24', icon: '💰' },
                { label: 'Rewards Pending', value: referrals.filter(r => !r.reward_given && r.status === 'signed_up').length, color: '#f472b6', icon: '🎁' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '3px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {referrals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤝</div>
                <p style={{ color: '#475569' }}>No referrals yet</p>
                <button onClick={loadReferrals} style={{ marginTop: '16px', padding: '10px 20px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '10px', color: '#93c5fd', fontSize: '13px', cursor: 'pointer' }}>Load Referrals</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {referrals.map((ref, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤝</div>
                      <div>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{ref.referred_email}</div>
                        <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                          Referred by {ref.referrer_id?.substring(0, 8)}... • {new Date(ref.created_at).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        background: ref.status === 'converted' ? 'rgba(22,163,74,0.2)' : ref.status === 'signed_up' ? 'rgba(37,99,235,0.2)' : 'rgba(100,116,139,0.2)',
                        color: ref.status === 'converted' ? '#4ade80' : ref.status === 'signed_up' ? '#93c5fd' : '#64748b',
                        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px'
                      }}>{ref.status}</span>
                      {!ref.reward_given && ref.status === 'signed_up' && (
                        <button
                          onClick={async () => {
                            const data = await apiCall('/api/admin/referrals', 'POST', { action: 'give_reward', referralId: ref.id, rewardCredits: 50 })
                            if (data.success) { showToast('Reward given! +50 credits added'); loadReferrals() }
                            else showToast(data.error, 'error')
                          }}
                          style={{ padding: '6px 14px', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '8px', color: '#4ade80', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          🎁 Give +50 Credits
                        </button>
                      )}
                      {ref.reward_given && (
                        <span style={{ color: '#334155', fontSize: '11px' }}>✅ Rewarded</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COLLEGES / B2B ─────────────────────── */}
        {activeTab === 'colleges' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>🎓 College / B2B Portal</h1>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                  {colleges.length} colleges • {colleges.reduce((acc, c) => acc + (c.students_count || 0), 0)} total students
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={loadColleges}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
                  🔄 Refresh
                </button>
                <button onClick={() => setShowCollegeForm(!showCollegeForm)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  ➕ Add College
                </button>
              </div>
            </div>

            {/* Add College Form */}
            {showCollegeForm && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>➕ Add New College</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  {[
                    { key: 'name', label: 'College Name *', pl: 'e.g. VIT Vellore' },
                    { key: 'city', label: 'City', pl: 'e.g. Vellore' },
                    { key: 'state', label: 'State', pl: 'e.g. Tamil Nadu' },
                    { key: 'contact_name', label: 'Contact Person', pl: 'Placement Officer name' },
                    { key: 'contact_email', label: 'Contact Email', pl: 'placement@college.edu' },
                    { key: 'contact_phone', label: 'Contact Phone', pl: '+91 9876543210' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                      <input value={newCollege[f.key]} onChange={e => setNewCollege(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.pl}
                        style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>STUDENTS</label>
                    <input type="number" value={newCollege.students_count} onChange={e => setNewCollege(prev => ({ ...prev, students_count: parseInt(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>PLAN</label>
                    <select value={newCollege.plan} onChange={e => setNewCollege(prev => ({ ...prev, plan: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
                      {['trial', 'basic', 'pro', 'enterprise'].map(p => <option key={p} value={p} style={{ background: '#1e293b' }}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>₹/STUDENT</label>
                    <input type="number" value={newCollege.price_per_student} onChange={e => setNewCollege(prev => ({ ...prev, price_per_student: parseFloat(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>EST. REVENUE</label>
                    <div style={{ padding: '9px 12px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', color: '#4ade80', fontSize: '13px', fontWeight: '700' }}>
                      ₹{(newCollege.students_count * newCollege.price_per_student).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={async () => {
                      if (!newCollege.name) { showToast('College name required', 'error'); return }
                      const data = await apiCall('/api/admin/colleges', 'POST', { action: 'create', ...newCollege })
                      if (data.success) { showToast(data.message); loadColleges(); setShowCollegeForm(false); setNewCollege({ name: '', city: '', state: '', contact_name: '', contact_email: '', contact_phone: '', students_count: 0, plan: 'trial', price_per_student: 99, notes: '' }) }
                      else showToast(data.error, 'error')
                    }}
                    style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    ✅ Add College
                  </button>
                  <button onClick={() => setShowCollegeForm(false)}
                    style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Colleges List */}
            {colleges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎓</div>
                <p style={{ color: '#475569' }}>No colleges added yet</p>
                <p style={{ color: '#334155', fontSize: '13px', marginTop: '6px' }}>Click "Add College" to get started with B2B</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {colleges.map((college, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🎓</div>
                        <div>
                          <div style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{college.name}</div>
                          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>
                            {college.city}{college.state ? `, ${college.state}` : ''} • {college.students_count} students
                          </div>
                          <div style={{ color: '#475569', fontSize: '12px' }}>
                            📧 {college.contact_email} • 📞 {college.contact_phone}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#4ade80', fontWeight: '800', fontSize: '16px' }}>
                            ₹{(college.students_count * college.price_per_student).toLocaleString('en-IN')}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '11px' }}>est. revenue</div>
                        </div>
                        <span style={{
                          background: college.plan === 'enterprise' ? 'rgba(217,119,6,0.2)' : college.plan === 'pro' ? 'rgba(124,58,237,0.2)' : college.plan === 'basic' ? 'rgba(37,99,235,0.2)' : 'rgba(100,116,139,0.2)',
                          color: college.plan === 'enterprise' ? '#fcd34d' : college.plan === 'pro' ? '#c4b5fd' : college.plan === 'basic' ? '#93c5fd' : '#94a3b8',
                          fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase'
                        }}>{college.plan}</span>
                        <button onClick={async () => {
                          await apiCall('/api/admin/colleges', 'POST', { action: 'delete', id: college.id })
                          showToast('College removed'); loadColleges()
                        }}
                          style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', padding: '6px 10px', color: '#fca5a5', fontSize: '12px', cursor: 'pointer' }}>🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Total Revenue */}
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '12px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Total B2B Revenue Potential</span>
                  <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '20px' }}>
                    ₹{colleges.reduce((acc, c) => acc + c.students_count * c.price_per_student, 0).toLocaleString('en-IN')}/month
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FEATURE FLAGS ──────────────────────── */}
        {activeTab === 'flags' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>🚩 Feature Flags & A/B Tests</h1>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                  {flags.filter(f => f.enabled).length} active • {flags.filter(f => !f.enabled).length} disabled
                </p>
              </div>
              <button onClick={loadFlags}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
                🔄 Refresh
              </button>
            </div>

            <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px' }}>
              <p style={{ color: '#93c5fd', fontSize: '13px' }}>
                🚩 Feature flags let you enable/disable features or run A/B tests without deploying new code. Use rollout % to gradually release to users.
              </p>
            </div>

            {flags.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚩</div>
                <p style={{ color: '#475569' }}>No feature flags yet</p>
                <button onClick={loadFlags} style={{ marginTop: '16px', padding: '10px 20px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '10px', color: '#93c5fd', fontSize: '13px', cursor: 'pointer' }}>Load Flags</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {flags.map((flag, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${flag.enabled ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>{flag.name}</h3>
                          <span style={{ background: 'rgba(100,116,139,0.2)', color: '#94a3b8', fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '5px' }}>{flag.category}</span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '12px' }}>{flag.description}</p>
                      </div>
                      {/* Toggle */}
                      <div
                        onClick={async () => {
                          const newEnabled = !flag.enabled
                          const data = await apiCall('/api/admin/flags', 'POST', { id: flag.id, enabled: newEnabled, rollout_percent: flag.rollout_percent })
                          if (data.success) { showToast(`${flag.name} ${newEnabled ? 'enabled' : 'disabled'}!`); loadFlags() }
                          else showToast(data.error, 'error')
                        }}
                        style={{ width: '48px', height: '26px', borderRadius: '13px', background: flag.enabled ? '#16a34a' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                        <div style={{ position: 'absolute', top: '3px', left: flag.enabled ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                      </div>
                    </div>

                    {/* Rollout % slider */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>ROLLOUT</label>
                        <span style={{ color: flag.enabled ? '#4ade80' : '#475569', fontSize: '12px', fontWeight: '700' }}>{flag.rollout_percent}% of users</span>
                      </div>
                      <input type="range" min="0" max="100" value={flag.rollout_percent}
                        onChange={e => {
                          const newPct = parseInt(e.target.value)
                          setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, rollout_percent: newPct } : f))
                        }}
                        onMouseUp={async e => {
                          const data = await apiCall('/api/admin/flags', 'POST', { id: flag.id, enabled: flag.enabled, rollout_percent: flag.rollout_percent })
                          if (data.success) showToast(`Rollout updated to ${flag.rollout_percent}%`)
                        }}
                        style={{ width: '100%', accentColor: flag.enabled ? '#16a34a' : '#475569' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ color: '#334155', fontSize: '10px' }}>0%</span>
                        <span style={{ color: '#334155', fontSize: '10px' }}>50%</span>
                        <span style={{ color: '#334155', fontSize: '10px' }}>100%</span>
                      </div>
                    </div>

                    {/* Status pill */}
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                      <span style={{
                        background: flag.enabled ? 'rgba(22,163,74,0.15)' : 'rgba(100,116,139,0.15)',
                        color: flag.enabled ? '#4ade80' : '#64748b',
                        fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '8px'
                      }}>
                        {flag.enabled ? `✅ LIVE — ${flag.rollout_percent}% rollout` : '⏸ DISABLED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>👥 Users ({users.length})</h1>
              <button onClick={loadUsers} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>🔄 Refresh</button>
            </div>
            <input type="text" placeholder="Search by email..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredUsers.map((user, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '16px', flexShrink: 0 }}>
                        {user.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{user.email}</div>
                        <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>
                          {user.credits_remaining >= 999999 ? 'Unlimited' : user.credits_remaining} credits • {user.plan}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: user.plan === 'premium' ? 'rgba(217,119,6,0.2)' : user.plan === 'pro' ? 'rgba(124,58,237,0.2)' : 'rgba(37,99,235,0.2)', color: user.plan === 'premium' ? '#fcd34d' : user.plan === 'pro' ? '#c4b5fd' : '#93c5fd', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>{user.plan}</span>
                      <span style={{ background: user.active ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)', color: user.active ? '#4ade80' : '#fca5a5', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px' }}>{user.active ? 'Active' : 'Banned'}</span>
                      <select onChange={e => { if (e.target.value) { handleChangePlan(user.user_id, e.target.value); e.target.value = '' } }}
                        style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>
                        <option value="">Change Plan</option>
                        {['free', 'basic', 'pro', 'premium'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button onClick={() => { setCreditUserId(user.user_id); setCreditUserEmail(user.email); setActiveTab('credits') }}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '12px', cursor: 'pointer' }}>⚡ Credits</button>
                      <button onClick={() => handleBan(user.user_id, user.active)}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: user.active ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)', border: `1px solid ${user.active ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)'}`, color: user.active ? '#fca5a5' : '#4ade80', fontSize: '12px', cursor: 'pointer' }}>
                        {user.active ? '🚫 Ban' : '✅ Unban'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREDITS */}
        {activeTab === 'credits' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>⚡ Add Credits / Change Plan</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>⚡ Add Free Credits</h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>FIND USER BY EMAIL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="user@example.com" value={creditUserEmail} onChange={e => setCreditUserEmail(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }} />
                    <button onClick={() => findUser(creditUserEmail)} style={{ padding: '10px 16px', background: '#2563eb', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>Find</button>
                  </div>
                  {creditUserId && (
                    <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}>
                      <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>✅ Found: {creditUserEmail}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>CREDITS TO ADD</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {[10, 25, 50, 100, 200].map(n => (
                      <button key={n} onClick={() => setCreditsToAdd(n)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: creditsToAdd === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: creditsToAdd === n ? 'white' : '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{n}</button>
                    ))}
                  </div>
                  <input type="number" value={creditsToAdd} onChange={e => setCreditsToAdd(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>REASON (optional)</label>
                  <input type="text" value={creditReason} onChange={e => setCreditReason(e.target.value)} placeholder="e.g. Referral bonus"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button onClick={handleAddCredits} disabled={loading || !creditUserId}
                  style={{ width: '100%', padding: '14px', background: creditUserId ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: creditUserId ? 'white' : '#334155', fontSize: '15px', fontWeight: '700', cursor: creditUserId ? 'pointer' : 'not-allowed' }}>
                  {loading ? 'Adding...' : `⚡ Add ${creditsToAdd} Credits`}
                </button>
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>QUICK GIFT PACKAGES</p>
                  {[
                    { label: '🎁 Welcome Bonus', credits: 25 },
                    { label: '🎉 Referral Reward', credits: 50 },
                    { label: '🏆 Competition Winner', credits: 100 },
                    { label: '💝 Loyalty Bonus', credits: 200 },
                  ].map((pkg, i) => (
                    <button key={i} onClick={() => { setCreditsToAdd(pkg.credits); setCreditReason(pkg.label) }}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', marginBottom: '4px', textAlign: 'left' }}>
                      <span>{pkg.label}</span>
                      <span style={{ color: '#60a5fa', fontWeight: '700' }}>+{pkg.credits}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>🎖️ Change User Plan</h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>USER</label>
                  <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: creditUserId ? '#e2e8f0' : '#334155', fontSize: '13px' }}>
                    {creditUserEmail || 'Search user in Add Credits section first'}
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '10px' }}>SELECT PLAN</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { plan: 'free', label: 'Free', credits: '10 credits', color: '#64748b' },
                      { plan: 'basic', label: 'Basic', credits: '50 credits', color: '#2563eb' },
                      { plan: 'pro', label: 'Pro', credits: '200 credits', color: '#7c3aed' },
                      { plan: 'premium', label: 'Premium', credits: 'Unlimited', color: '#d97706' },
                    ].map(item => (
                      <button key={item.plan} onClick={() => setPlanToSet(item.plan)}
                        style={{ padding: '14px', borderRadius: '12px', border: `1px solid ${planToSet === item.plan ? item.color : 'rgba(255,255,255,0.06)'}`, background: planToSet === item.plan ? `${item.color}25` : 'rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ color: item.color, fontWeight: '800', fontSize: '14px', marginBottom: '3px' }}>{item.label}</div>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>{item.credits}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => creditUserId && handleChangePlan(creditUserId, planToSet)} disabled={!creditUserId || loading}
                  style={{ width: '100%', padding: '14px', background: creditUserId ? 'linear-gradient(135deg, #059669, #047857)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: creditUserId ? 'white' : '#334155', fontSize: '15px', fontWeight: '700', cursor: creditUserId ? 'pointer' : 'not-allowed' }}>
                  {loading ? 'Updating...' : `🎖️ Set to ${planToSet.toUpperCase()} Plan`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE CREDIT COSTS */}
        {activeTab === 'feature_costs' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>🎮 Feature Credit Costs</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
              Control how many credits each feature consumes. These settings are applied in real-time across the app.
            </p>
            <FeatureCostManager adminKey={adminKey} showToast={showToast} />
          </div>
        )}

        {/* DISCOUNTS */}
        {activeTab === 'discounts' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>🎟️ Discount Codes</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>➕ Create Discount Code</h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>CODE</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="e.g. SAVE50" value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                      style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', fontWeight: '700' }} />
                    <button onClick={() => setDiscountCode(['SAVE', 'GET', 'OFF', 'DEAL'][Math.floor(Math.random() * 4)] + Math.floor(Math.random() * 90 + 10))}
                      style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>Auto</button>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>DISCOUNT: <span style={{ color: '#60a5fa' }}>{discountPercent}%</span></label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    {[10, 20, 25, 30, 50, 75].map(n => (
                      <button key={n} onClick={() => setDiscountPercent(n)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: discountPercent === n ? '#2563eb' : 'rgba(255,255,255,0.06)', color: discountPercent === n ? 'white' : '#64748b', fontSize: '12px', cursor: 'pointer' }}>{n}%</button>
                    ))}
                  </div>
                  <input type="range" min="1" max="100" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>MAX USES</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[10, 50, 100, 500, 1000].map(n => (
                      <button key={n} onClick={() => setDiscountMaxUses(n)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: discountMaxUses === n ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: discountMaxUses === n ? 'white' : '#64748b', fontSize: '12px', cursor: 'pointer' }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>PLAN (optional)</label>
                  <select value={discountPlan} onChange={e => setDiscountPlan(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }}>
                    <option value="" style={{ background: '#1e293b' }}>All Plans</option>
                    <option value="basic" style={{ background: '#1e293b' }}>Basic Only</option>
                    <option value="pro" style={{ background: '#1e293b' }}>Pro Only</option>
                    <option value="premium" style={{ background: '#1e293b' }}>Premium Only</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>EXPIRY (optional)</label>
                  <input type="date" value={discountExpiry} onChange={e => setDiscountExpiry(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>DESCRIPTION</label>
                  <input type="text" value={discountDesc} onChange={e => setDiscountDesc(e.target.value)} placeholder="e.g. Launch offer"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {discountCode && (
                  <div style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <p style={{ color: 'white', fontWeight: '800', fontSize: '20px', letterSpacing: '0.1em' }}>{discountCode}</p>
                    <p style={{ color: '#93c5fd', fontSize: '13px', marginTop: '4px' }}>{discountPercent}% off • {discountMaxUses} uses</p>
                  </div>
                )}
                <button onClick={handleCreateDiscount} disabled={loading || !discountCode}
                  style={{ width: '100%', padding: '14px', background: discountCode ? 'linear-gradient(135deg, #059669, #047857)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: discountCode ? 'white' : '#334155', fontSize: '15px', fontWeight: '700', cursor: discountCode ? 'pointer' : 'not-allowed' }}>
                  {loading ? 'Creating...' : '🎟️ Create Discount Code'}
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>📋 Active Codes ({discounts.filter(d => d.active).length})</h2>
                {discounts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎟️</div>
                    <p style={{ color: '#64748b' }}>No codes yet. Create one!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {discounts.map((d, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 20px', opacity: d.active ? 1 : 0.5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                              <span style={{ color: '#fcd34d', fontWeight: '900', fontSize: '18px' }}>{d.code}</span>
                              <span style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>{d.discount_percent}% OFF</span>
                            </div>
                            <div style={{ color: '#64748b', fontSize: '12px' }}>{d.used_count}/{d.max_uses} used • {d.plan_restriction || 'All plans'}</div>
                          </div>
                          {d.active && (
                            <button onClick={() => handleDeleteDiscount(d.id)}
                              style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', padding: '6px 10px', color: '#fca5a5', fontSize: '12px', cursor: 'pointer' }}>
                              Deactivate
                            </button>
                          )}
                        </div>
                        <div style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(d.used_count / d.max_uses) * 100}%`, background: '#16a34a', borderRadius: '9999px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PDFs */}
        {activeTab === 'pdfs' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>📄 PDF Question Manager</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
              <div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
                  <h2 style={{ color: 'white', fontWeight: '700', fontSize: '17px', marginBottom: '20px' }}>📤 Upload PDF</h2>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>COMPANY</label>
                    <select value={pdfCompany} onChange={e => setPdfCompany(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
                      {COMPANIES.map(c => <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>TOPIC</label>
                    <select value={pdfTopic} onChange={e => setPdfTopic(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
                      {TOPICS.map(t => <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>ROUND TYPE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {ROUND_TYPES.map(r => (
                        <button key={r} onClick={() => setPdfRound(r)}
                          style={{ padding: '8px', borderRadius: '7px', border: 'none', background: pdfRound === r ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.04)', color: pdfRound === r ? 'white' : '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div onClick={() => document.getElementById('pdfUploadInput')?.click()}
                    style={{ border: `2px dashed ${pdfFile ? '#2563eb' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: pdfFile ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.02)', marginBottom: '14px' }}>
                    {pdfFile ? (
                      <div>
                        <div style={{ fontSize: '24px', marginBottom: '6px' }}>📄</div>
                        <div style={{ color: '#93c5fd', fontWeight: '600', fontSize: '13px' }}>{pdfFile.name}</div>
                        <div style={{ color: '#475569', fontSize: '11px' }}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '28px', marginBottom: '6px' }}>📁</div>
                        <div style={{ color: '#64748b', fontSize: '13px' }}>Click to select PDF</div>
                      </div>
                    )}
                  </div>
                  <input id="pdfUploadInput" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                  {pdfResult && (
                    <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                      <div style={{ color: '#4ade80', fontWeight: '700', fontSize: '13px' }}>✅ {pdfResult.message}</div>
                    </div>
                  )}
                  <button onClick={handlePdfUpload} disabled={!pdfFile || pdfLoading}
                    style={{ width: '100%', padding: '12px', background: pdfFile && !pdfLoading ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', color: pdfFile && !pdfLoading ? 'white' : '#334155', fontSize: '14px', fontWeight: '700', cursor: pdfFile && !pdfLoading ? 'pointer' : 'not-allowed' }}>
                    {pdfLoading ? '🤖 Extracting... (30-60s)' : '🚀 Extract & Save'}
                  </button>
                </div>
                {uploadHistory.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px' }}>
                    <h3 style={{ color: '#64748b', fontWeight: '700', fontSize: '13px', marginBottom: '12px' }}>UPLOAD HISTORY</h3>
                    {uploadHistory.slice(0, 5).map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <span>{item.status === 'success' ? '✅' : '❌'}</span>
                        <div>
                          <div style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600' }}>{item.name}</div>
                          <div style={{ color: '#475569', fontSize: '11px' }}>{item.company} • {item.topic} {item.status === 'success' ? `• ${item.count} Q&A` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ color: 'white', fontWeight: '700', fontSize: '17px' }}>📚 Questions ({allPdfQuestions.length})</h2>
                  <button onClick={loadPdfQuestions} style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>🔄</button>
                </div>
                {allPdfQuestions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                    <p style={{ color: '#64748b' }}>No questions yet. Upload a PDF!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                    {allPdfQuestions.map(q => (
                      <div key={q.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '5px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' }}>{q.company}</span>
                            <span style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' }}>{q.topic}</span>
                            <span style={{ background: 'rgba(5,150,105,0.2)', color: '#6ee7b7', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' }}>{q.round_type}</span>
                          </div>
                          <p style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '3px' }}>{q.question}</p>
                          <p style={{ color: '#475569', fontSize: '11px' }}>{q.model_answer?.substring(0, 80)}...</p>
                        </div>
                        <button onClick={() => handleDeleteQuestion(q.id)}
                          style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '7px', padding: '5px 8px', color: '#fca5a5', fontSize: '12px', cursor: 'pointer', flexShrink: 0, height: 'fit-content' }}>🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>📢 Announcements</h1>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>Create Announcement Banner</h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>TYPE</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { type: 'info', label: '💡 Info', color: '#2563eb' },
                      { type: 'success', label: '🎉 Success', color: '#059669' },
                      { type: 'warning', label: '⚠️ Warning', color: '#d97706' },
                      { type: 'promo', label: '🏷️ Promo', color: '#7c3aed' },
                    ].map(t => (
                      <button key={t.type} onClick={() => setAnnouncementType(t.type)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${announcementType === t.type ? t.color : 'transparent'}`, background: announcementType === t.type ? `${t.color}25` : 'rgba(255,255,255,0.05)', color: announcementType === t.type ? 'white' : '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>MESSAGE</label>
                  <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)}
                    placeholder="e.g. 🎉 New feature launched!" rows={4}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                {announcement && (
                  <div style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px' }}>
                    <p style={{ color: 'white', fontSize: '13px' }}>{announcement}</p>
                  </div>
                )}
                <button onClick={() => showToast('Announcement saved! Feature coming soon.', 'success')}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                  📢 Send Announcement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATES */}
        {activeTab === 'templates' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>🎨 Resume Template Manager</h1>
            <TemplateManager adminKey={adminKey} showToast={showToast} />
          </div>
        )}
        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>📧 Email / Notification System</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

              {/* Send Notification */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>📧 Send Notification</h2>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>TARGET AUDIENCE</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'all', label: '👥 All Users' },
                      { key: 'free', label: '🆓 Free Plan' },
                      { key: 'basic', label: '⚡ Basic Plan' },
                      { key: 'pro', label: '🚀 Pro Plan' },
                      { key: 'premium', label: '👑 Premium Plan' },
                    ].map(t => (
                      <button key={t.key}
                        onClick={() => setNewNotif(prev => ({ ...prev, target: t.key }))}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: newNotif.target === t.key ? '#2563eb' : 'rgba(255,255,255,0.06)', color: newNotif.target === t.key ? 'white' : '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>TITLE</label>
                  <input value={newNotif.title} onChange={e => setNewNotif(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. 🎉 New Feature Alert!"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>SUBJECT (Email)</label>
                  <input value={newNotif.subject} onChange={e => setNewNotif(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Your account has been updated"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>MESSAGE BODY</label>
                  <textarea value={newNotif.body} onChange={e => setNewNotif(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Write your notification message here..." rows={5}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                {/* Preview */}
                {newNotif.title && (
                  <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <p style={{ color: '#93c5fd', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>PREVIEW</p>
                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{newNotif.title}</p>
                    <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>{newNotif.body}</p>
                    <p style={{ color: '#475569', fontSize: '11px', marginTop: '8px' }}>
                      To: {newNotif.target === 'all' ? 'All users' : `${newNotif.target} plan users`}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!newNotif.title || !newNotif.body) { showToast('Fill title and message', 'error'); return }
                    showToast(`Notification sent to ${newNotif.target === 'all' ? 'all users' : newNotif.target + ' plan users'}! (Email integration coming soon)`)
                    setNewNotif({ title: '', subject: '', body: '', target: 'all' })
                  }}
                  style={{ width: '100%', padding: '14px', background: newNotif.title && newNotif.body ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: newNotif.title && newNotif.body ? 'white' : '#334155', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                  📧 Send Notification
                </button>
              </div>

              {/* Notification Tips */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
                <h2 style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>💡 Notification Templates</h2>
                {[
                  { title: '🎉 Welcome New User', body: 'Welcome to AI Placement Coach! Start building your resume and practicing interviews. You have 10 free credits.', target: 'free' },
                  { title: '⬆️ Upgrade Reminder', body: 'You are using free credits fast! Upgrade to Pro for ₹299/month and get 200 credits + WhatsApp coaching.', target: 'free' },
                  { title: '📱 WhatsApp Feature', body: 'Did you know Pro users get 10 daily interview questions on WhatsApp? Upgrade now and start practicing!', target: 'basic' },
                  { title: '🏆 New PDF Questions', body: 'We just added 50 new TCS and Infosys interview questions! Log in and practice now.', target: 'all' },
                  { title: '💰 Salary Negotiation', body: 'Premium feature: Our AI salary coach can help you negotiate ₹2-5 LPA more. Upgrade to Premium today!', target: 'pro' },
                ].map((template, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px', cursor: 'pointer' }}
                    onClick={() => setNewNotif(prev => ({ ...prev, title: template.title, body: template.body, target: template.target }))}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{template.title}</span>
                      <span style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '5px' }}>{template.target}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>{template.body.substring(0, 80)}...</p>
                    <p style={{ color: '#2563eb', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>← Click to use this template</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* PLAN FEATURES */}
        {activeTab === 'plan_features' && (
          <PlanFeatureManager adminKey={adminKey} showToast={showToast} />
        )}
      </div>
    </div>
  )
}
