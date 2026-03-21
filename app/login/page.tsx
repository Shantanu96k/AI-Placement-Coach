'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .auth-body {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          position: relative;
          overflow: hidden;
        }

        /* Animated orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: floatOrb 8s ease-in-out infinite;
        }
        .orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #7c3aed, transparent);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #2563eb, transparent);
          bottom: -80px; right: -80px;
          animation-delay: -3s;
        }
        .orb-3 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, #06b6d4, transparent);
          top: 50%; left: 60%;
          animation-delay: -6s;
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          33% { transform: translateY(-30px) scale(1.05); }
          66% { transform: translateY(20px) scale(0.95); }
        }

        /* Floating particles */
        .particle {
          position: absolute;
          width: 4px; height: 4px;
          background: rgba(255,255,255,0.5);
          border-radius: 50%;
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(60px); opacity: 0; }
        }

        /* Glass card */
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative;
          z-index: 10;
          animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(40px);
        }
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Logo area */
        .logo-icon {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 20px;
          box-shadow: 0 8px 32px rgba(124, 58, 237, 0.5);
          animation: logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(124, 58, 237, 0.5); }
          50% { box-shadow: 0 8px 48px rgba(124, 58, 237, 0.8); }
        }

        .card-title {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          text-align: center;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .card-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          text-align: center;
          margin-bottom: 36px;
        }

        /* Input group */
        .input-group {
          margin-bottom: 20px;
          position: relative;
        }
        .input-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          margin-bottom: 8px;
          letter-spacing: 0.3px;
          transition: color 0.3s;
        }
        .input-label.focused { color: #a78bfa; }

        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          pointer-events: none;
          transition: all 0.3s;
          opacity: 0.6;
        }
        .input-wrapper.focused .input-icon { opacity: 1; }

        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px 14px 46px;
          font-size: 14px;
          color: #ffffff;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-input:focus {
          border-color: #7c3aed;
          background: rgba(124, 58, 237, 0.1);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15);
        }
        .toggle-password {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          font-size: 16px;
          padding: 4px;
          transition: color 0.2s;
        }
        .toggle-password:hover { color: rgba(255,255,255,0.8); }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          margin-top: 8px;
          letter-spacing: 0.3px;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .submit-btn:hover:not(:disabled)::after { opacity: 1; }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.5);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0px); }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Loading spinner */
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Error */
        .error-box {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shakeError 0.4s ease;
        }
        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }
        .divider-text {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
        }

        /* Footer link */
        .footer-text {
          text-align: center;
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-top: 24px;
        }
        .footer-link {
          color: #a78bfa;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
        }
        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 1px;
          background: #a78bfa;
          transform: scaleX(0);
          transition: transform 0.3s;
        }
        .footer-link:hover::after { transform: scaleX(1); }
        .footer-link:hover { color: #c4b5fd; }

        /* Features strip */
        .features-strip {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }
        .feature-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
        }
      `}</style>

      <div className="auth-body">
        {/* Background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Floating particles */}
        {mounted && Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${6 + Math.random() * 8}s`,
              animationDelay: `${Math.random() * 8}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              opacity: 0.2 + Math.random() * 0.4,
            }}
          />
        ))}

        <div className="glass-card">
          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div className="logo-icon">🎯</div>
            <h1 className="card-title">Welcome Back</h1>
            <p className="card-subtitle">Sign in to your AI Placement Coach</p>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div className="input-group">
              <label
                className={`input-label${focusedField === 'email' ? ' focused' : ''}`}
              >
                Email Address
              </label>
              <div className={`input-wrapper${focusedField === 'email' ? ' focused' : ''}`}>
                <span className="input-icon">✉️</span>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label
                className={`input-label${focusedField === 'password' ? ' focused' : ''}`}
              >
                Password
              </label>
              <div className={`input-wrapper${focusedField === 'password' ? ' focused' : ''}`}>
                <span className="input-icon">🔒</span>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '46px' }}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                '🚀 Sign In'
              )}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">NEW HERE?</span>
            <div className="divider-line" />
          </div>

          <p className="footer-text">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="footer-link">
              Create one free →
            </Link>
          </p>

          <div className="features-strip">
            {['AI-Powered', '10 Free Credits', 'No Card Needed'].map((f) => (
              <div key={f} className="feature-item">
                <div className="feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}