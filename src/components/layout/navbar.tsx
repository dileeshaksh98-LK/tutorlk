'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const role = (session?.user as any)?.role

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass shadow-sm border-b border-white/20' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">T</div>
          <span className="font-bold text-lg text-gray-900">Tutor<span className="text-brand-600">Spot</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '/tutors', label: 'Find tutors' },
            { href: '/tutors?level=OL', label: 'O/L' },
            { href: '/tutors?level=AL', label: 'A/L' },
            { href: '/how-it-works', label: 'How it works' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {session ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-all">
                <Avatar name={session.user?.name ?? 'U'} image={session.user?.image} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">{session.user?.name?.split(' ')[0]}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {open && (
                <div className="absolute right-0 top-12 w-52 glass rounded-2xl shadow-xl py-2 z-50 animate-scale-in border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{session.user?.email}</p>
                  </div>
                  <Link href={role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard'}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>
                    <span>📊</span> Dashboard
                  </Link>
                  <Link href="/messages" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>
                    <span>💬</span> Messages
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <span>👋</span> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-sm">
                  Get started <span className="ml-1">→</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
