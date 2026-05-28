import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { tutorProfile: true },
  })
  if (!user?.tutorProfile) return NextResponse.json({ error: 'Tutor profile required' }, { status: 400 })

  const { title, subjectId, paperType, markingType, timeLimitMins, totalMarks, questions, isPublished } = await req.json()

  const paper = await prisma.paper.create({
    data: {
      tutorProfileId: user.tutorProfile.id,
      subjectId,
      title,
      type: paperType,
      markingType,
      timeLimitMins: timeLimitMins || null,
      totalMarks,
      isPublished,
      questions: {
        create: (questions as any[]).map((q, idx) => ({
          orderNum:      idx + 1,
          type:          q.type,
          content:       q.content,
          marks:         q.marks,
          optionA:       q.optionA || null,
          optionB:       q.optionB || null,
          optionC:       q.optionC || null,
          optionD:       q.optionD || null,
          correctOption: q.correctOption || null,
          tutorNote:     q.tutorNote || null,
        })),
      },
    },
  })

  return NextResponse.json({ paper }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { tutorProfile: true },
  })
  if (!user?.tutorProfile) return NextResponse.json({ papers: [] })

  const papers = await prisma.paper.findMany({
    where: { tutorProfileId: user.tutorProfile.id },
    orderBy: { createdAt: 'desc' },
    include: { subject: true, _count: { select: { questions: true, submissions: true } } },
  })

  return NextResponse.json({ papers })
}
