'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('admin@tutorlk.lk')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [show,     setShow]     = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Enter email and password'); return }
    setLoading(true); setError('')
    const result = await signIn('credentials', {
      email, password, redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid admin credentials')
    } else {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-brand-400/30">T</div>
          <h1 className="text-2xl font-bold text-white">TutorSpot Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Restricted access — administrators only</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-800/50 rounded-xl px-4 py-3 mb-6">
            <span className="text-amber-400 text-lg">🔒</span>
            <p className="text-amber-300 text-xs">Admin portal — not for students or tutors</p>
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Admin email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                placeholder="admin@tutorlk.lk"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 pr-12"
                  placeholder="Enter admin password"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-brand-400 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-brand-400/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Signing in…
                </span>
              ) : '🔐 Sign in to Admin Panel'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-600">Default credentials for first login:</p>
            <p className="text-xs text-gray-500 mt-1 font-mono">admin@tutorlk.lk / Admin@TutorSpot2024</p>
            <p className="text-xs text-gray-600 mt-2">Change password after first login</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Not an admin? <a href="/" className="text-brand-500 hover:text-brand-400">Go to TutorSpot →</a>
        </p>
      </div>
    </div>
  )
}
