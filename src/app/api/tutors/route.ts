import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rankTutors } from '@/lib/ranking'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subject  = searchParams.get('subject')
  const district = searchParams.get('district')
  const level    = searchParams.get('level')
  const stream   = searchParams.get('stream')
  const medium   = searchParams.get('medium')
  const verified = searchParams.get('verified') === 'true'
  const trial    = searchParams.get('trial') === 'true'
  const minRate  = searchParams.get('minRate')
  const maxRate  = searchParams.get('maxRate')
  const budget   = searchParams.get('budget')
  const page     = parseInt(searchParams.get('page') ?? '1')
  const limit    = 12

  const where: any = { isActive: true }
  if (verified) where.isVerified = true
  if (trial)    where.trialClass = true
  if (minRate)  where.hourlyRate = { ...where.hourlyRate, gte: parseInt(minRate) }
  if (maxRate)  where.hourlyRate = { ...where.hourlyRate, lte: parseInt(maxRate) }

  if (subject) {
    where.subjects = { some: { subjectId: subject } }
  }

  if (district) {
    where.locations = { some: { district: { slug: district } } }
  }

  const [rawTutors, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      where,
      take: 100, // fetch more for ranking
      include: {
        user:         { select: { name: true, image: true } },
        subjects:     { include: { subject: true } },
        locations:    { include: { district: true, city: true } },
        sessionModes: true,
      },
    }),
    prisma.tutorProfile.count({ where }),
  ])

  // Apply AI ranking
  const ranked = rankTutors(rawTutors.map(t => ({
    ...t,
    modes: t.sessionModes.map(m => m.mode),
  })), { budget: budget ? parseInt(budget) : undefined })

  // Paginate after ranking
  const paginated = ranked.slice((page - 1) * limit, page * limit)

  return NextResponse.json({
    tutors: paginated.map(t => ({
      id:            t.id,
      userId:        t.userId,
      name:          (t as any).user.name,
      image:         (t as any).user.image,
      bio:           t.bio,
      qualification: t.qualification,
      experience:    t.experience,
      hourlyRate:    t.hourlyRate,
      trialClass:    t.trialClass,
      isVerified:    t.isVerified,
      avgRating:     t.avgRating,
      totalReviews:  t.totalReviews,
      totalSessions: t.totalSessions,
      subjects:      (t as any).subjects.map((s: any) => ({ name: s.subject.name, grade: s.grade })),
      locations:     (t as any).locations.map((l: any) => ({ district: l.district.name, city: l.city?.name })),
      modes:         (t as any).sessionModes.map((m: any) => m.mode),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
