'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role,     setRole]     = useState<'STUDENT'|'TUTOR'>((searchParams.get('role') as any) ?? 'STUDENT')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
    await signIn('credentials', { email, password, redirect: false })
    router.push(role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard')
  }

  const ROLE_BENEFITS = {
    STUDENT: ['Find verified tutors fast', 'Book sessions securely', 'Get model papers & feedback', 'Track your progress'],
    TUTOR:   ['Reach 10,000+ students', 'Get paid securely', 'Manage your schedule', 'Build your reputation'],
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-lg">T</div>
            <span className="text-2xl font-black text-white">Tutor<span className="text-brand-400">Spot</span></span>
          </Link>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300 font-medium">
              {role === 'STUDENT' ? 'Joining as a student' : 'Joining as a tutor'}
            </span>
          </div>

          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            {role === 'STUDENT' ? 'Start learning\nsmarter today' : 'Start earning\nfrom your expertise'}
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            {role === 'STUDENT' ? 'Join thousands of students acing their exams with TutorSpot.' : 'Connect with students island-wide. Earn on your own schedule.'}
          </p>

          <div className="space-y-3 mb-8">
            {ROLE_BENEFITS[role].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-400 text-xs">✓</span>
                </div>
                <span className="text-gray-300 text-sm">{b}</span>
              </div>
            ))}
          </div>

          {/* Role toggle preview */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-xs text-gray-500 mb-2">Switch account type</p>
            <button onClick={() => setRole(role === 'STUDENT' ? 'TUTOR' : 'STUDENT')}
              className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors">
              {role === 'STUDENT' ? '→ Register as a tutor instead' : '→ Register as a student instead'}
            </button>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} TutorSpot · Built in Sri Lanka 🇱🇰
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black shadow-md">T</div>
              <span className="text-xl font-black text-gray-900">Tutor<span className="text-brand-600">Spot</span></span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm">Join TutorSpot for free — no credit card needed</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            {(['STUDENT', 'TUTOR'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  role === r
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {r === 'STUDENT' ? '👤 I am a student' : '📚 I am a tutor'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={() => signIn('google', { callbackUrl: role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard' })}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 bg-white rounded-2xl h-12 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span>⚠️</span> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required
                className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required
                className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters" minLength={8} required
                  className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : `Create ${role === 'STUDENT' ? 'student' : 'tutor'} account →`}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-3">
            By signing up you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
