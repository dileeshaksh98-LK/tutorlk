import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { extractQuestionsFromPDF } from '@/lib/pdf-extractor'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData  = await req.formData()
    const file      = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    if (!file.name.endsWith('.pdf')) return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await extractQuestionsFromPDF(buffer)

    return NextResponse.json({
      questions: result.questions,
      rawText:   result.rawText.slice(0, 5000),
      count:     result.questions.length,
      error:     result.error,
    })
  } catch (err: any) {
    console.error('PDF extraction error:', err)
    return NextResponse.json({ error: err.message ?? 'Extraction failed' }, { status: 500 })
  }
}
