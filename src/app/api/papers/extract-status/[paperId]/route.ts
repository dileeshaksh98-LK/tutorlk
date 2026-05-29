import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { paperId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const paper = await prisma.govPaper.findUnique({
      where: { id: params.paperId },
      include: {
        questions: { orderBy: { orderNum: 'asc' } },
        subject: true,
      },
    })
    if (!paper) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      status: paper.status,
      questionCount: paper.questions.length,
      paper: {
        id: paper.id,
        title: paper.title,
        examType: paper.examType,
        year: paper.year,
        subject: paper.subject.name,
        isActive: paper.isActive,
      },
      questions: paper.questions,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
