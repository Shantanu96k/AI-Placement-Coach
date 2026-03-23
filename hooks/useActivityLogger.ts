'use client'
import { useEffect } from 'react'

export function useActivityLogger(userId: string | null, email: string | null, action: string) {
  useEffect(() => {
    if (!userId || !action) return
    fetch('/api/admin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, action })
    }).catch(() => {})
  }, [userId, action])  // runs once when userId is available
}