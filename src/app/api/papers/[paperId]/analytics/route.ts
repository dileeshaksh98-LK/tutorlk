import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { paperId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((session.user as any).role !== 'TUTOR' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const paper = await prisma.govPaper.findUnique({
      where: { id: params.paperId },
      include: {
        subject: true,
        questions: { orderBy: { orderNum: 'asc' } },
        govAttempts: {
          where: { status: 'COMPLETED' },
          include: {
            studentProfile: { include: { user: { select: { name: true, email: true } } } },
            answers: true,
          },
          orderBy: { completedAt: 'desc' },
        },
      },
    })
    if (!paper) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const attempts = paper.govAttempts
    const totalAttempts = attempts.length
    const avgScore = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / totalAttempts
      : 0

    const questionStats = paper.questions.map(q => {
      const qAnswers = attempts.flatMap(a => a.answers.filter(ans => ans.questionId === q.id))
      const correct = qAnswers.filter(a => a.isCorrect).length
      const total = qAnswers.length
      return {
        id: q.id,
        orderNum: q.orderNum,
        content: q.content.slice(0, 120),
        correctCount: correct,
        totalAnswered: total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
      }
    })

    const attemptList = attempts.map(a => ({
      id: a.id,
      studentName: a.studentProfile.user.name ?? a.studentProfile.user.email,
      score: a.score,
      correct: a.correct,
      totalQuestions: a.totalQuestions,
      completedAt: a.completedAt,
    }))

    return NextResponse.json({
      paper: { id: paper.id, title: paper.title, subject: paper.subject.name, examType: paper.examType, year: paper.year },
      totalAttempts,
      avgScore: Math.round(avgScore * 10) / 10,
      questionStats,
      attempts: attemptList,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
