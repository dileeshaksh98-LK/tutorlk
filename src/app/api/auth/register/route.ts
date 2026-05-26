import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 12)
    const userRole = role === 'TUTOR' ? 'TUTOR' : 'STUDENT'

    const user = await prisma.user.create({
      data: { name, email, passwordHash: hash, role: userRole },
    })

    if (userRole === 'STUDENT') {
      await prisma.studentProfile.create({ data: { userId: user.id } })
    }

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
