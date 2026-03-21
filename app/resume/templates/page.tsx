'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TEMPLATES = [
  {
    id: 'nova',
    name: 'Nova',
    subtitle: 'Clean & Modern',
    badge: 'Most Popular',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    atsScore: 98,
    columns: 1,
    photo: false,
    bestFor: 'Software Engineer, Data Analyst',
    colors: ['#1e40af','#7c3aed','#065f46','#9a3412','#1e293b','#831843'],
    defaultColor: '#1e40af',
    layout: 'nova'
  },
  {
    id: 'pulse',
    name: 'Pulse',
    subtitle: 'Bold Two-Column',
    badge: 'Trending',
    badgeBg: '#ede9fe',
    badgeColor: '#5b21b6',
    atsScore: 95,
    columns: 2,
    photo: true,
    bestFor: 'MBA, Marketing, HR',
    colors: ['#0891b2','#7c3aed','#059669','#dc2626','#0f172a','#b45309'],
    defaultColor: '#0891b2',
    layout: 'pulse'
  },
  {
    id: 'apex',
    name: 'Apex',
    subtitle: 'Executive Bold',
    badge: 'Premium',
    badgeBg: '#dbeafe',
    badgeColor: '#1e40af',
    atsScore: 97,
    columns: 1,
    photo: true,
    bestFor: 'Senior roles, Management',
    colors: ['#1e3a5f','#6d28d9','#b91c1c','#065f46','#1e293b','#92400e'],
    defaultColor: '#1e3a5f',
    layout: 'apex'
  },
  {
    id: 'zen',
    name: 'Zen',
    subtitle: 'Ultra Minimal',
    badge: 'ATS Best',
    badgeBg: '#dcfce7',
    badgeColor: '#166534',
    atsScore: 100,
    columns: 1,
    photo: false,
    bestFor: 'Any role, Fresher',
    colors: ['#111827','#1e40af','#065f46','#7c3aed','#9a3412','#1e3a5f'],
    defaultColor: '#111827',
    layout: 'zen'
  },
  {
    id: 'spark',
    name: 'Spark',
    subtitle: 'Creative Sidebar',
    badge: 'Designer Pick',
    badgeBg: '#fce7f3',
    badgeColor: '#9d174d',
    atsScore: 92,
    columns: 2,
    photo: true,
    bestFor: 'UI/UX, Creative roles',
    colors: ['#7c3aed','#1e40af','#b91c1c','#065f46','#0891b2','#92400e'],
    defaultColor: '#7c3aed',
    layout: 'spark'
  },
  {
    id: 'bloom',
    name: 'Bloom',
    subtitle: 'Fresher Special',
    badge: 'For Students',
    badgeBg: '#ecfdf5',
    badgeColor: '#065f46',
    atsScore: 96,
    columns: 1,
    photo: false,
    bestFor: 'Freshers, Campus placement',
    colors: ['#2563eb','#7c3aed','#059669','#dc2626','#0f172a','#d97706'],
    defaultColor: '#2563eb',
    layout: 'bloom'
  }
]

function ResumePreview({ layout, color }: { layout: string, color: string }) {
  if (layout === 'pulse' || layout === 'spark') {
    return (
      <div style={{ background: 'white', height: '100%', display: 'grid', gridTemplateColumns: layout === 'spark' ? '38% 62%' : '40% 60%', overflow: 'hidden' }}>
        <div style={{ background: color, padding: '20px 14px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
          </div>
          <div style={{ width: '60px', height: '7px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px', marginBottom: '4px' }} />
          <div style={{ width: '44px', height: '5px', background: 'rgba(255,255,255,0.5)', borderRadius: '3px', marginBottom: '16px' }} />
          {['SKILLS', 'CONTACT', 'EDUCATION'].map((s, i) => (
            <div key={i} style={{ width: '100%', marginBottom: '12px' }}>
              <div style={{ fontSize: '7px', fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', marginBottom: '5px' }}>{s}</div>
              {[70, 55, 40].map((w, j) => (
                <div key={j} style={{ height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: '20px 16px' }}>
          <div style={{ borderBottom: `2px solid ${color}`, paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '900', color: color, letterSpacing: '0.06em' }}>EXPERIENCE</div>
          </div>
          {[1, 2].map((_, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ width: '80px', height: '5px', background: '#1e293b', borderRadius: '2px', marginBottom: '4px' }} />
              <div style={{ width: '55px', height: '4px', background: color, opacity: 0.5, borderRadius: '2px', marginBottom: '6px' }} />
              {[90, 75, 60].map((w, j) => <div key={j} style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />)}
            </div>
          ))}
          <div style={{ borderBottom: `2px solid ${color}`, paddingBottom: '10px', marginBottom: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: '900', color: color, letterSpacing: '0.06em' }}>PROJECTS</div>
          </div>
          {[85, 70, 55].map((w, i) => <div key={i} style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '4px', width: `${w}%` }} />)}
        </div>
      </div>
    )
  }

  if (layout === 'zen') {
    return (
      <div style={{ background: 'white', height: '100%', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${color}`, paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ width: '100px', height: '8px', background: color, borderRadius: '3px', marginBottom: '5px' }} />
            <div style={{ width: '70px', height: '5px', background: '#94a3b8', borderRadius: '2px' }} />
          </div>
          <div style={{ textAlign: 'right' as const }}>
            {[50, 60, 40].map((w, i) => <div key={i} style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '3px', width: `${w}px` }} />)}
          </div>
        </div>
        {['EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS'].map((s, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '7px', fontWeight: '900', color: color, letterSpacing: '0.15em', marginBottom: '6px' }}>{s}</div>
            {[95, 80, 65].map((w, j) => <div key={j} style={{ height: '3px', background: j === 0 ? '#cbd5e1' : '#f1f5f9', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />)}
          </div>
        ))}
      </div>
    )
  }

  if (layout === 'apex') {
    return (
      <div style={{ background: 'white', height: '100%' }}>
        <div style={{ background: color, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
          <div>
            <div style={{ width: '90px', height: '7px', background: 'rgba(255,255,255,0.95)', borderRadius: '3px', marginBottom: '5px' }} />
            <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
          </div>
        </div>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['EXPERIENCE', 'SKILLS', 'EDUCATION', 'ACHIEVEMENTS'].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '6px', fontWeight: '900', color: color, letterSpacing: '0.12em', marginBottom: '5px', borderBottom: `1.5px solid ${color}`, paddingBottom: '3px' }}>{s}</div>
                {[90, 70, 50].map((w, j) => <div key={j} style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Nova + Bloom default
  return (
    <div style={{ background: 'white', height: '100%' }}>
      <div style={{ background: color, padding: '18px 20px' }}>
        <div style={{ width: '110px', height: '8px', background: 'rgba(255,255,255,0.95)', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ width: '75px', height: '5px', background: 'rgba(255,255,255,0.55)', borderRadius: '3px', marginBottom: '10px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[55, 65, 50].map((w, i) => <div key={i} style={{ height: '3px', background: 'rgba(255,255,255,0.35)', borderRadius: '2px', width: `${w}px` }} />)}
        </div>
      </div>
      <div style={{ padding: '14px 18px' }}>
        {['PROFESSIONAL SUMMARY', 'EXPERIENCE', 'SKILLS', 'EDUCATION', 'PROJECTS'].map((s, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <div style={{ fontSize: '6px', fontWeight: '900', color: color, letterSpacing: '0.12em' }}>{s}</div>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>
            {[i === 0 ? [95, 85] : [88, 72, 58]][0].map((w, j) => (
              <div key={j} style={{ height: '3px', background: j === 0 ? '#cbd5e1' : '#f1f5f9', borderRadius: '2px', marginBottom: '3px', width: `${w}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [colors, setColors] = useState<Record<string, string>>({})
  const [activeFilter, setActiveFilter] = useState('all')
  const [hovering, setHovering] = useState<string | null>(null)
  const router = useRouter()

  const filters = [
    { key: 'all', label: 'All Templates' },
    { key: '1col', label: '1 Column' },
    { key: '2col', label: '2 Columns' },
    { key: 'photo', label: 'With Photo' },
    { key: 'nophoto', label: 'No Photo' },
  ]

  const filtered = TEMPLATES.filter(t => {
    if (activeFilter === '1col') return t.columns === 1
    if (activeFilter === '2col') return t.columns === 2
    if (activeFilter === 'photo') return t.photo
    if (activeFilter === 'nophoto') return !t.photo
    return true
  })

  const selectedTemplate = TEMPLATES.find(t => t.id === selected)
  const getColor = (id: string) => colors[id] || TEMPLATES.find(t => t.id === id)?.defaultColor || '#1e40af'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Top Bar */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '12px' }}>AI</div>
              <span style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>PlacementCoach</span>
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {[{ num: '1', label: 'Choose Template', active: true }, { num: '2', label: 'Fill Details', active: false }, { num: '3', label: 'Download', active: false }].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: s.active ? '#2563eb' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.active ? 'white' : '#475569', fontSize: '11px', fontWeight: '700' }}>{s.num}</div>
                    <span style={{ fontSize: '12px', color: s.active ? 'white' : '#475569', fontWeight: s.active ? '600' : '400' }}>{s.label}</span>
                  </div>
                  {i < 2 && <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/resume" style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', fontSize: '13px', color: '#94a3b8' }}>
              Use AI Builder
            </Link>
            <Link href="/dashboard" style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', textDecoration: 'none', fontSize: '13px', color: '#93c5fd', fontWeight: '600' }}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '9999px', padding: '5px 14px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ color: '#93c5fd', fontSize: '12px', fontWeight: '600' }}>6 ATS-Verified Templates</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '42px', fontWeight: '900', color: 'white', lineHeight: '1.1', marginBottom: '10px' }}>
                Pick your perfect<br />
                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>resume style</span>
              </h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Every template is optimized for Indian companies — TCS, Infosys, Wipro & more
              </p>
            </div>
            {/* ATS badge */}
            <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '14px 20px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>100%</div>
              <div style={{ color: '#16a34a', fontSize: '11px', fontWeight: '600', marginTop: '2px' }}>ATS Compatible</div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {filters.map(f => (
            <button key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '8px 18px', borderRadius: '9999px', border: 'none',
                background: activeFilter === f.key ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)',
                color: activeFilter === f.key ? 'white' : '#64748b',
                fontSize: '13px', fontWeight: activeFilter === f.key ? '700' : '400',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {f.label}
              <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>
                {f.key === 'all' ? TEMPLATES.length : TEMPLATES.filter(t => f.key === '1col' ? t.columns === 1 : f.key === '2col' ? t.columns === 2 : f.key === 'photo' ? t.photo : !t.photo).length}
              </span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '100px' }}>
          {filtered.map(template => {
            const color = getColor(template.id)
            const isSelected = selected === template.id
            const isHovered = hovering === template.id

            return (
              <div key={template.id}
                onMouseEnter={() => setHovering(template.id)}
                onMouseLeave={() => setHovering(null)}
                onClick={() => setSelected(template.id)}
                style={{
                  borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                  border: isSelected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.25s',
                  transform: isHovered || isSelected ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isSelected ? `0 0 40px ${color}30` : isHovered ? '0 20px 60px rgba(0,0,0,0.4)' : 'none'
                }}
              >
                {/* Preview Area */}
                <div style={{ position: 'relative' as const, height: '280px', overflow: 'hidden' }}>
                  <ResumePreview layout={template.layout} color={color} />

                  {/* Gradient overlay at bottom */}
                  <div style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(10,15,26,0.8))' }} />

                  {/* Badge */}
                  <div style={{ position: 'absolute' as const, top: '12px', left: '12px', background: template.badgeBg, color: template.badgeColor, fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                    {template.badge}
                  </div>

                  {/* ATS Score */}
                  <div style={{ position: 'absolute' as const, top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: '8px', padding: '6px 10px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: template.atsScore >= 97 ? '#4ade80' : '#facc15' }}>{template.atsScore}%</div>
                    <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '600' }}>ATS</div>
                  </div>

                  {/* Selected overlay */}
                  {isSelected && (
                    <div style={{ position: 'absolute' as const, inset: 0, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${color}60` }}>
                        <span style={{ color: 'white', fontSize: '20px', fontWeight: '900' }}>✓</span>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  {isHovered && !isSelected && (
                    <div style={{ position: 'absolute' as const, inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'white', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        Select Template
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '2px' }}>{template.name}</h3>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{template.subtitle}</p>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>{template.columns} col {template.photo ? '• Photo' : ''}</div>
                    </div>
                  </div>

                  {/* Best For */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Best for: </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{template.bestFor}</span>
                  </div>

                  {/* Color Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600' }}>COLORS</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {template.colors.map((c, ci) => (
                        <div key={ci}
                          onClick={e => { e.stopPropagation(); setColors(prev => ({ ...prev, [template.id]: c })) }}
                          style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: c, cursor: 'pointer', transition: 'all 0.15s',
                            border: color === c ? `3px solid rgba(255,255,255,0.9)` : '2px solid transparent',
                            boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                            transform: color === c ? 'scale(1.2)' : 'scale(1)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div style={{ position: 'fixed' as const, bottom: 0, left: 0, right: 0, background: 'rgba(10,15,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', zIndex: 200 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {selectedTemplate ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: getColor(selected!), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900' }}>
                {selectedTemplate.name[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <p style={{ fontWeight: '700', color: 'white', fontSize: '15px' }}>{selectedTemplate.name} — {selectedTemplate.subtitle}</p>
                  <div style={{ background: selectedTemplate.badgeBg, color: selectedTemplate.badgeColor, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>{selectedTemplate.badge}</div>
                </div>
                <p style={{ color: '#64748b', fontSize: '12px' }}>ATS Score: {selectedTemplate.atsScore}% • {selectedTemplate.columns} column • {selectedTemplate.photo ? 'With photo' : 'No photo'}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }} />
              <p style={{ color: '#475569', fontSize: '14px' }}>Select a template above to continue</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/resume" style={{ padding: '11px 22px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', fontSize: '14px', color: '#64748b' }}>
              Choose later
            </Link>
            <button
              disabled={!selected}
              onClick={() => selected && router.push(`/resume/builder?template=${selected}&color=${encodeURIComponent(getColor(selected))}`)}
              style={{
                padding: '11px 32px', borderRadius: '10px', border: 'none',
                background: selected ? `linear-gradient(135deg, ${getColor(selected!)}, ${getColor(selected!)}cc)` : 'rgba(255,255,255,0.05)',
                fontSize: '15px', fontWeight: '700',
                color: selected ? 'white' : '#334155',
                cursor: selected ? 'pointer' : 'not-allowed',
                boxShadow: selected ? `0 4px 24px ${getColor(selected!)}50` : 'none',
                transition: 'all 0.2s'
              }}
            >
              {selected ? `Use ${selectedTemplate?.name} Template →` : 'Select a template first'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}