import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token    = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Allow admin/login to always be accessible
    if (pathname === '/admin/login') return NextResponse.next()

    if (pathname.startsWith('/student') && (token as any)?.role !== 'STUDENT' && (token as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (pathname.startsWith('/tutor') && (token as any)?.role !== 'TUTOR' && (token as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && (token as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        if (pathname === '/admin/login') return true
        if (pathname.startsWith('/student') || pathname.startsWith('/tutor') || pathname.startsWith('/book') || pathname.startsWith('/messages')) {
          return !!token
        }
        if (pathname.startsWith('/admin')) return !!token
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/student/:path*', '/tutor/:path*', '/book/:path*', '/messages/:path*', '/admin/:path*'],
}
