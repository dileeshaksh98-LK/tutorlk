import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { tutorProfile: true },
  })
  return NextResponse.json({ profile: user?.tutorProfile ?? null })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { tutorProfile: true },
  })
  if (!user?.tutorProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const data = await req.json()
  const updated = await prisma.tutorProfile.update({
    where: { id: user.tutorProfile.id },
    data: {
      bio:           data.bio,
      qualification: data.qualification,
      university:    data.university,
      hourlyRate:    data.hourlyRate,
      trialClass:    data.trialClass,
    },
  })
  return NextResponse.json({ profile: updated })
}
