import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { studentProfile: true, tutorProfile: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let bookings: any[] = []
  if (user.studentProfile) {
    bookings = await prisma.booking.findMany({
      where:   { studentProfileId: user.studentProfile.id, messages: { some: {} } },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        tutorProfile: { include: { user: { select: { name: true, image: true } } } },
      },
    })
  } else if (user.tutorProfile) {
    bookings = await prisma.booking.findMany({
      where:   { tutorProfileId: user.tutorProfile.id, messages: { some: {} } },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        studentProfile: { include: { user: { select: { name: true, image: true } } } },
      },
    })
  }

  const conversations = bookings.map(b => ({
    id:          b.id,
    otherName:   user.studentProfile ? b.tutorProfile?.user?.name : b.studentProfile?.user?.name,
    otherImage:  user.studentProfile ? b.tutorProfile?.user?.image : b.studentProfile?.user?.image,
    lastMessage: b.messages[0]?.content ?? '',
  }))

  return NextResponse.json({ conversations })
}
