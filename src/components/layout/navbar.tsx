'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const role = (session?.user as any)?.role

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-brand-600">
          <span className="text-xl">🎓</span> TutorLK
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/tutors" className="hover:text-brand-600 transition-colors">Find tutors</Link>
          <Link href="/subjects" className="hover:text-brand-600 transition-colors">Subjects</Link>
          <Link href="/how-it-works" className="hover:text-brand-600 transition-colors">How it works</Link>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="flex items-center gap-2">
                <Avatar name={session.user?.name ?? 'U'} image={session.user?.image} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-gray-700">{session.user?.name}</span>
              </button>
              {open && (
                <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  <Link href={role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard'}
                    className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  {role === 'TUTOR' && (
                    <Link href="/tutor/profile" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setOpen(false)}>
                      My profile
                    </Link>
                  )}
                  <Link href="/messages" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setOpen(false)}>
                    Messages
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login"><Button variant="outline" size="sm">Log in</Button></Link>
              <Link href="/register"><Button size="sm">Sign up free</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
