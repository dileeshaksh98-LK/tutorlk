import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subject  = searchParams.get('subject')
  const district = searchParams.get('district')
  const city     = searchParams.get('city')
  const grade    = searchParams.get('grade')
  const verified = searchParams.get('verified') === 'true'
  const trial    = searchParams.get('trial') === 'true'
  const minRate  = searchParams.get('minRate')
  const maxRate  = searchParams.get('maxRate')
  const page     = parseInt(searchParams.get('page') ?? '1')
  const limit    = 12

  const where: any = { isActive: true }
  if (verified) where.isVerified = true
  if (trial)    where.trialClass = true
  if (minRate)  where.hourlyRate = { ...where.hourlyRate, gte: parseInt(minRate) }
  if (maxRate)  where.hourlyRate = { ...where.hourlyRate, lte: parseInt(maxRate) }
  if (subject || grade) {
    where.subjects = {
      some: {
        ...(subject ? { subject: { slug: subject } } : {}),
        ...(grade   ? { grade }                      : {}),
      },
    }
  }
  if (district || city) {
    where.locations = {
      some: {
        ...(district ? { district: { slug: district } } : {}),
        ...(city     ? { city: { slug: city } }          : {}),
      },
    }
  }

  const [tutors, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isVerified: 'desc' }, { avgRating: 'desc' }, { totalReviews: 'desc' }],
      include: {
        user:      { select: { name: true, image: true } },
        subjects:  { include: { subject: true } },
        locations: { include: { district: true, city: true } },
        sessionModes: true,
      },
    }),
    prisma.tutorProfile.count({ where }),
  ])

  return NextResponse.json({
    tutors: tutors.map(t => ({
      id:            t.id,
      userId:        t.userId,
      name:          t.user.name,
      image:         t.user.image,
      bio:           t.bio,
      qualification: t.qualification,
      experience:    t.experience,
      hourlyRate:    t.hourlyRate,
      trialClass:    t.trialClass,
      isVerified:    t.isVerified,
      avgRating:     t.avgRating,
      totalReviews:  t.totalReviews,
      totalSessions: t.totalSessions,
      subjects:      t.subjects.map(s => ({ name: s.subject.name, grade: s.grade })),
      locations:     t.locations.map(l => ({ district: l.district.name, city: l.city?.name })),
      modes:         t.sessionModes.map(m => m.mode),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
