import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { extractQuestionsFromPDF } from '@/lib/pdf-extractor'

function supabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

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

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const title = (formData.get('title') as string)?.trim()
    const examType = (formData.get('examType') as string) ?? 'OL'
    const subjectName = (formData.get('subject') as string)?.trim()
    const year = parseInt(formData.get('year') as string) || new Date().getFullYear() - 1

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'A valid PDF file is required' }, { status: 400 })
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 20 MB' }, { status: 400 })
    }
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    if (!subjectName) return NextResponse.json({ error: 'Subject is required' }, { status: 400 })

    let subject = await prisma.subject.findFirst({ where: { name: { equals: subjectName, mode: 'insensitive' } } })
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: subjectName,
          slug: subjectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          category: 'General',
        },
      })
    }

    const sb = supabaseAdmin()
    const fileName = `papers/${user.tutorProfile.id}/${Date.now()}.pdf`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let pdfUrl: string | null = null
    const { error: uploadError } = await sb.storage
      .from('resources')
      .upload(fileName, buffer, { contentType: 'application/pdf', upsert: false })

    if (!uploadError) {
      const { data: urlData } = sb.storage.from('resources').getPublicUrl(fileName)
      pdfUrl = urlData.publicUrl
    }

    const paper = await prisma.govPaper.create({
      data: {
        title,
        subjectId: subject.id,
        examType,
        year,
        isActive: false,
        status: 'processing',
        pdfUrl,
        uploadedBy: user.tutorProfile.id,
      },
    })

    try {
      const { questions } = await extractQuestionsFromPDF(buffer)
      if (questions.length > 0) {
        await prisma.govQuestion.createMany({
          data: questions.map(q => ({
            paperId: paper.id, orderNum: q.orderNum, content: q.content,
            optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
            correctOption: q.correctOption, explanation: q.explanation, marks: 1,
          })),
        })
      }
      await prisma.govPaper.update({ where: { id: paper.id }, data: { status: 'ready' } })
    } catch {
      await prisma.govPaper.update({ where: { id: paper.id }, data: { status: 'error' } })
    }

    return NextResponse.json({ paperId: paper.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const maxDuration = 60
