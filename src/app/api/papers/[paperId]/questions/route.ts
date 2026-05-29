import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const QuestionSchema = z.object({
  id: z.string().optional(),
  orderNum: z.number().int().positive(),
  content: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctOption: z.string(),
  explanation: z.string().default(''),
  marks: z.number().default(1),
})

const BodySchema = z.object({
  questions: z.array(QuestionSchema),
  publish: z.boolean().default(false),
})

export async function PUT(req: NextRequest, { params }: { params: { paperId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'TUTOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tutorProfile: true },
    })
    if (!user?.tutorProfile) return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 })

    const paper = await prisma.govPaper.findUnique({ where: { id: params.paperId } })
    if (!paper) return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    if (paper.uploadedBy !== user.tutorProfile.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = BodySchema.parse(await req.json())

    await prisma.govQuestion.deleteMany({ where: { paperId: params.paperId } })
    await prisma.govQuestion.createMany({
      data: body.questions.map(q => ({
        paperId: params.paperId,
        orderNum: q.orderNum,
        content: q.content,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        explanation: q.explanation,
        marks: q.marks,
      })),
    })

    if (body.publish) {
      await prisma.govPaper.update({
        where: { id: params.paperId },
        data: { isActive: true, status: 'ready' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
