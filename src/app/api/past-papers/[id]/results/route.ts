import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const { answers, timeTaken, score, correct, total } = await req.json()

    // Increment attempt count
    await (prisma as any).govPaper.update({
      where: { id: params.id },
      data: { attempts: { increment: 1 } },
    })

    // Save attempt if user is logged in
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { studentProfile: true },
      })
      if (user?.studentProfile) {
        const attempt = await (prisma as any).govAttempt.create({
          data: {
            id: `ga_${Date.now()}`,
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
        // Save individual answers
        for (const ans of (answers as any[])) {
          await (prisma as any).govAnswer.create({
            data: {
              id: `gan_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
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
