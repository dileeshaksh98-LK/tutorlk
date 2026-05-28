'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TESTIMONIALS = [
  { name: 'Ayesha P.', school: 'Visakha Vidyalaya', text: 'Found my A/L Combined Maths tutor in 5 minutes. Went from C to A in 3 months!', rating: 5 },
  { name: 'Ravi J.',   school: 'Royal College',     text: 'The platform is so easy to use. My Physics tutor is amazing.', rating: 5 },
  { name: 'Nimali W.', school: 'Musaeus College',   text: 'Best decision I made for my O/L prep. Highly recommend TutorSpot!', rating: 5 },
]

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      router.push('/student/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-lg">T</div>
            <span className="text-2xl font-black text-white">Tutor<span className="text-brand-400">Spot</span></span>
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Sri Lanka's smartest<br />
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">tutor marketplace</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Find verified tutors for O/L, A/L and more. Sinhala, Tamil & English medium. Island-wide.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { value: '500+', label: 'Tutors' },
              { value: '25',   label: 'Districts' },
              { value: '4.8★', label: 'Rating' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex mb-2">
              {Array(5).fill(0).map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
            </div>
            <p className="text-gray-300 text-sm italic mb-3">"{TESTIMONIALS[0].text}"</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-400/30 flex items-center justify-center text-brand-300 text-xs font-bold">A</div>
              <div>
                <div className="text-white text-xs font-medium">{TESTIMONIALS[0].name}</div>
                <div className="text-gray-500 text-xs">{TESTIMONIALS[0].school}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} TutorSpot · Built in Sri Lanka 🇱🇰
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black shadow-md">T</div>
              <span className="text-xl font-black text-gray-900">Tutor<span className="text-brand-600">Spot</span></span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm">Log in to continue your learning journey</p>
          </div>

          {/* Google login */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/student/dashboard' })}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 bg-white rounded-2xl h-12 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-4 active:scale-98">
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
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl animate-fade-in-up">
                <span>⚠️</span> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" required
                className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
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
                  Logging in…
                </span>
              ) : 'Log in →'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">Sign up free</Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            By logging in you agree to our{' '}
            <Link href="#" className="hover:underline">Terms</Link> and{' '}
            <Link href="#" className="hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
