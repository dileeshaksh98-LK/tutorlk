import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: params.id },
    include: {
      user:         { select: { name: true, image: true, email: true } },
      subjects:     { include: { subject: true } },
      locations:    { include: { district: true, city: true } },
      sessionModes: true,
      availability: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { studentProfile: { include: { user: { select: { name: true, image: true } } } } },
      },
    },
  })
  if (!tutor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ tutor })
}
