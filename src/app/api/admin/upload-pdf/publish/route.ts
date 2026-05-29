import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, subjectId, examType, year, medium, timeMins, questions } = await req.json()

    if (!title || !subjectId || !examType || !year || !questions?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create the paper
    const paper = await prisma.govPaper.create({
      data: {
        title,
        subjectId,
        examType,
        year,
        medium:     medium ?? 'SINHALA',
        timeMins:   timeMins ?? 180,
        totalMarks: questions.reduce((s: number, q: any) => s + (q.marks ?? 2), 0),
        isActive:   true,
        attempts:   0,
      },
    })

    // Create all questions
    await prisma.govQuestion.createMany({
      data: questions.map((q: any, idx: number) => ({
        paperId:       paper.id,
        orderNum:      q.orderNum ?? idx + 1,
        content:       q.content,
        optionA:       q.optionA,
        optionB:       q.optionB,
        optionC:       q.optionC,
        optionD:       q.optionD,
        correctOption: q.correctOption ?? '',
        explanation:   q.explanation ?? '',
        marks:         q.marks ?? 2,
      })),
    })

    return NextResponse.json({ success: true, paperId: paper.id, questionCount: questions.length })
  } catch (err: any) {
    console.error('Publish error:', err)
    return NextResponse.json({ error: err.message ?? 'Publish failed' }, { status: 500 })
  }
}
