'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Apply referral code if present in URL
      const refCode = new URLSearchParams(window.location.search).get('ref')
      if (refCode && authData?.user?.id) {
        await fetch('/api/referals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'apply',
            code: refCode,
            referredUserId: authData.user.id,
            referredEmail: authData.user.email
          })
        })
      }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '440px',
          width: '100%',
          animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px', animation: 'bounceTop 1s ease' }}>✨</div>
          <h2 style={{ fontSize: '28px', color: '#fff', fontWeight: '800', marginBottom: '12px' }}>
            Account Created!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6' }}>
            Check your email to verify your account.<br />
            Redirecting you to login...
          </p>
        </div>
        <style>{`
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          @keyframes bounceTop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        `}</style>
      </div>
    )
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

        /* Animated grid background */
        .grid-bg {
          position: absolute;
          width: 200%; height: 200%;
          top: -50%; left: -50%;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
          animation: planeMove 15s linear infinite;
          z-index: 1;
        }
        @keyframes planeMove {
          from { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
          to { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); }
        }

        /* Animated orbs for register */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: floatOrb 8s ease-in-out infinite;
          z-index: 2;
        }
        .orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #ec4899, transparent);
          top: -50px; right: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #8b5cf6, transparent);
          bottom: -50px; left: -50px;
          animation-delay: -3s;
        }

        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }

        /* Glass card */
        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          position: relative;
          z-index: 10;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(40px);
        }
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Logo area */
        .logo-icon {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 20px;
          box-shadow: 0 8px 32px rgba(236, 72, 153, 0.4);
          animation: logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(236, 72, 153, 0.4); transform: scale(1); }
          50% { box-shadow: 0 8px 48px rgba(236, 72, 153, 0.7); transform: scale(1.05); }
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
          color: rgba(255,255,255,0.6);
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
        .input-label.focused { color: #f472b6; }

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
          border-color: #ec4899;
          background: rgba(236, 72, 153, 0.1);
          box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.15);
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
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
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
          box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
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

        /* Footer link */
        .footer-text {
          text-align: center;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin-top: 24px;
        }
        .footer-link {
          color: #f472b6;
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
          background: #f472b6;
          transform: scaleX(0);
          transition: transform 0.3s;
        }
        .footer-link:hover::after { transform: scaleX(1); }
        .footer-link:hover { color: #fbcfe8; }
      `}</style>

      <div className="auth-body">
        {/* Animated grid background */}
        <div className="grid-bg" />

        {/* Background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="glass-card">
          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div className="logo-icon">🚀</div>
            <h1 className="card-title">Join AI Coach</h1>
            <p className="card-subtitle">Create a free account — 10 credits included</p>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} noValidate>

            {/* Full Name */}
            <div className="input-group" style={{ animation: 'slideUp 0.8s 0.1s both' }}>
              <label className={`input-label${focusedField === 'name' ? ' focused' : ''}`}>
                Full Name
              </label>
              <div className={`input-wrapper${focusedField === 'name' ? ' focused' : ''}`}>
                <span className="input-icon">👤</span>
                <input
                  className="auth-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Rahul Sharma"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="input-group" style={{ animation: 'slideUp 0.8s 0.2s both' }}>
              <label className={`input-label${focusedField === 'email' ? ' focused' : ''}`}>
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
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group" style={{ animation: 'slideUp 0.8s 0.3s both' }}>
              <label className={`input-label${focusedField === 'password' ? ' focused' : ''}`}>
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
                  placeholder="Minimum 6 characters"
                  required
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

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
              style={{ animation: 'slideUp 0.8s 0.4s both' }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating Account...
                </>
              ) : (
                '✨ Create Free Account'
              )}
            </button>
          </form>

          <p className="footer-text" style={{ animation: 'slideUp 0.8s 0.5s both' }}>
            Already have an account?{' '}
            <Link href="/login" className="footer-link">
              Sign in here →
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}