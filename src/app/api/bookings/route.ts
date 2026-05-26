import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getPlatformFee, getTutorAmount } from '@/lib/utils'

const schema = z.object({
  tutorProfileId: z.string(),
  subjectId:      z.string().optional(),
  sessionMode:    z.enum(['ONLINE', 'HOME_VISIT', 'TUITION_CENTRE']),
  durationMins:   z.number().min(30).max(180),
  scheduledAt:    z.string(),
  notes:          z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { studentProfile: true },
  })
  if (!user?.studentProfile) return NextResponse.json({ error: 'Student profile required' }, { status: 400 })

  const body = await req.json()
  const data = schema.parse(body)

  const tutor = await prisma.tutorProfile.findUnique({ where: { id: data.tutorProfileId } })
  if (!tutor) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })

  const durationHours = data.durationMins / 60
  const totalAmount   = Math.round(tutor.hourlyRate * durationHours)
  const platformFee   = getPlatformFee(totalAmount)
  const tutorAmount   = getTutorAmount(totalAmount)

  const booking = await prisma.booking.create({
    data: {
      tutorProfileId:   data.tutorProfileId,
      studentProfileId: user.studentProfile.id,
      subjectId:        data.subjectId,
      sessionMode:      data.sessionMode,
      durationMins:     data.durationMins,
      scheduledAt:      new Date(data.scheduledAt),
      notes:            data.notes,
      totalAmount,
      platformFee,
      tutorAmount,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ booking }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { studentProfile: true, tutorProfile: true },
  })

  let bookings
  if (user?.studentProfile) {
    bookings = await prisma.booking.findMany({
      where:   { studentProfileId: user.studentProfile.id },
      orderBy: { scheduledAt: 'desc' },
      include: {
        tutorProfile: { include: { user: { select: { name: true, image: true } } } },
      },
    })
  } else if (user?.tutorProfile) {
    bookings = await prisma.booking.findMany({
      where:   { tutorProfileId: user.tutorProfile.id },
      orderBy: { scheduledAt: 'desc' },
      include: {
        studentProfile: { include: { user: { select: { name: true, image: true } } } },
      },
    })
  } else {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ bookings })
}
