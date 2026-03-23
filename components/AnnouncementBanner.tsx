'use client'
// components/AnnouncementBanner.tsx
// Add to dashboard/any user page:
//   import AnnouncementBanner from '@/components/AnnouncementBanner'
//   <AnnouncementBanner plan={plan} />
import { useEffect, useState } from 'react'

const TYPE_STYLES: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  info:    { bg: 'rgba(37,99,235,0.12)',   border: 'rgba(37,99,235,0.3)',    color: '#93c5fd', icon: '💡' },
  success: { bg: 'rgba(22,163,74,0.12)',   border: 'rgba(22,163,74,0.35)',   color: '#4ade80', icon: '🎉' },
  warning: { bg: 'rgba(217,119,6,0.12)',   border: 'rgba(217,119,6,0.35)',   color: '#fcd34d', icon: '⚠️' },
  promo:   { bg: 'rgba(124,58,237,0.12)',  border: 'rgba(124,58,237,0.35)', color: '#c4b5fd', icon: '🎁' },
  error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   color: '#fca5a5', icon: '🚨' },
}

export default function AnnouncementBanner({ plan = 'free' }: { plan?: string }) {
  const [banners, setBanners] = useState<any[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/announcements?plan=${plan}`)
      .then(r => r.json())
      .then(d => { if (d.announcements?.length) setBanners(d.announcements) })
      .catch(() => {})
  }, [plan])

  const visible = banners.filter(b => !dismissed.has(b.id))
  if (!visible.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
      {visible.map(banner => {
        const s = TYPE_STYLES[banner.type] || TYPE_STYLES.info
        return (
          <div key={banner.id} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: '14px', padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: '14px',
            animation: 'fadeSlideDown 0.4s ease both',
            fontFamily: 'system-ui, sans-serif'
          }}>
            <style>{`@keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              {banner.title && (
                <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '3px' }}>{banner.title}</p>
              )}
              <p style={{ color: s.color, fontSize: '13px', lineHeight: '1.5' }}>{banner.message}</p>
            </div>
            <button
              onClick={() => setDismissed(prev => new Set([...prev, banner.id]))}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}
            >✕</button>
          </div>
        )
      })}
    </div>
  )
}