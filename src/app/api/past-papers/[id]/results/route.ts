import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { answers, timeTaken, score, correct, total } = await req.json()
    const session = await getServerSession(authOptions)

    await prisma.govPaper.update({
      where: { id: params.id },
      data: { attempts: { increment: 1 } },
    })

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { studentProfile: true },
      })
      if (user?.studentProfile) {
        const attempt = await prisma.govAttempt.create({
          data: {
            studentProfileId: user.studentProfile.id,
            paperId: params.id,
            status: 'COMPLETED',
            score,
            totalQuestions: total,
            correct,
            timeTakenSecs: timeTaken,
            completedAt: new Date(),
          },
        })
        for (const ans of (answers as any[])) {
          await prisma.govAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: ans.questionId,
              selectedOption: ans.selected,
              isCorrect: ans.correct,
            },
          }).catch(() => {})
        }
      }
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ success: false })
  }
}
