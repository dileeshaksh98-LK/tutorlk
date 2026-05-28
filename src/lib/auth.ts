import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: { params: { prompt: 'consent', access_type: 'offline', response_type: 'code' } },
      })
    ] : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user || !user.passwordHash) return null
          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) return null
          return { id: user.id, email: user.email, name: user.name, role: user.role, image: user.image }
        } catch { return null }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existing = await prisma.user.findUnique({ where: { email: user.email! } })
          if (!existing) {
            const newUser = await prisma.user.create({
              data: { name: user.name, email: user.email!, image: user.image, role: 'STUDENT', emailVerified: new Date() },
            })
            await prisma.studentProfile.create({ data: { userId: newUser.id } })
          }
        } catch { return false }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role  = (user as any).role
        token.id    = user.id
        token.image = user.image
      }
      if (trigger === 'update' && session?.role) token.role = session.role
      // Fetch role from DB if missing
      if (!token.role && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } })
          if (dbUser) { token.role = dbUser.role; token.id = dbUser.id }
        } catch {}
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id    = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).image = token.picture ?? token.image
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/student/dashboard`
    },
  },
  events: {
    async createUser({ user }) {
      try {
        const existing = await prisma.studentProfile.findUnique({ where: { userId: user.id } })
        if (!existing) await prisma.studentProfile.create({ data: { userId: user.id } })
      } catch {}
    },
  },
}
