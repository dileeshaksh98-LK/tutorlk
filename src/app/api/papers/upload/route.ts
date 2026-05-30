import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { extractQuestionsFromPDF } from '@/lib/pdf-extractor'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((session.user as any).role !== 'TUTOR' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only tutors can upload papers' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tutorProfile: true },
    })
    if (!user?.tutorProfile) return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 })

    const formData    = await req.formData()
    const file        = formData.get('file') as File | null
    const title       = (formData.get('title') as string)?.trim()
    const examType    = (formData.get('examType') as string) ?? 'OL'
    const subjectName = (formData.get('subject') as string)?.trim()
    const year        = parseInt(formData.get('year') as string) || new Date().getFullYear() - 1

    if (!file || file.type !== 'application/pdf')
      return NextResponse.json({ error: 'A valid PDF file is required' }, { status: 400 })
    if (file.size > 20 * 1024 * 1024)
      return NextResponse.json({ error: 'File must be under 20 MB' }, { status: 400 })
    if (!title)       return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    if (!subjectName) return NextResponse.json({ error: 'Subject is required' }, { status: 400 })

    // Find or create subject
    let subject = await prisma.subject.findFirst({
      where: { name: { equals: subjectName, mode: 'insensitive' } },
    })
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name:     subjectName,
          slug:     subjectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          category: 'General',
        },
      })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Create paper record first
    const paper = await prisma.govPaper.create({
      data: {
        title,
        subjectId:  subject.id,
        examType,
        year,
        isActive:   false,
        status:     'processing',
        uploadedBy: user.tutorProfile.id,
      },
    })

    // Extract questions from PDF
    try {
      const { questions } = await extractQuestionsFromPDF(buffer)
      if (questions.length > 0) {
        await prisma.govQuestion.createMany({
          data: questions.map(q => ({
            paperId:       paper.id,
            orderNum:      q.orderNum,
            content:       q.content,
            optionA:       q.optionA,
            optionB:       q.optionB,
            optionC:       q.optionC,
            optionD:       q.optionD,
            correctOption: q.correctOption,
            explanation:   q.explanation,
            marks:         1,
          })),
        })
      }
      await prisma.govPaper.update({
        where: { id: paper.id },
        data:  { status: 'ready' },
      })
    } catch {
      await prisma.govPaper.update({
        where: { id: paper.id },
        data:  { status: 'error' },
      })
    }

    return NextResponse.json({ paperId: paper.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const maxDuration = 60
