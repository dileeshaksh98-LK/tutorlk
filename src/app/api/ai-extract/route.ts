import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const language = (formData.get('language') as string) ?? 'SINHALA'
    const examType = (formData.get('examType') as string) ?? 'OL'
    const subject  = (formData.get('subject') as string) ?? 'Mathematics'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'File too large — max 15MB' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const base64      = Buffer.from(arrayBuffer).toString('base64')

    const langLabel = language === 'SINHALA' ? 'Sinhala (සිංහල)' : language === 'TAMIL' ? 'Tamil (தமிழ்)' : 'English'

    const prompt = `You are an expert Sri Lankan exam paper analyser. You are given a ${langLabel} ${examType} past paper PDF for the subject "${subject}".

Extract ALL questions from this paper. Support both MCQ and Structured question types.

IMPORTANT RULES:
- Preserve ALL text in the ORIGINAL language (${langLabel}) — do NOT translate anything
- For Sinhala text: keep the Unicode Sinhala characters exactly as they appear
- For Tamil text: keep the Unicode Tamil characters exactly as they appear
- Number questions from 1 upward
- For MCQ: extract the question stem and all 4 options (A,B,C,D)
- For STRUCTURED: extract the full question text and mark allocation
- If you see an answer key anywhere in the PDF, use it to fill correctOption fields
- Generate a brief explanation for each MCQ answer

Return ONLY valid JSON — no markdown, no extra text:
{
  "language": "${language}",
  "subject": "${subject}",
  "examType": "${examType}",
  "questions": [
    {
      "orderNum": 1,
      "type": "MCQ",
      "content": "question text in original language",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctOption": "A",
      "marks": 2,
      "explanation": "why A is correct, in ${langLabel}"
    },
    {
      "orderNum": 2,
      "type": "STRUCTURED",
      "content": "full question text",
      "marks": 10,
      "guideline": "key points expected in answer"
    }
  ]
}

If PDF is unreadable (scanned image without OCR): return {"error":"scanned_pdf","questions":[]}`

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model:      'claude-opus-4-6',
        max_tokens: 8000,
        messages: [{
          role:    'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (!claudeRes.ok) {
      const errText = await claudeRes.text()
      console.error('Claude error:', errText)
      return NextResponse.json({ error: 'AI extraction failed — try again' }, { status: 500 })
    }

    const claudeData = await claudeRes.json()
    const rawText    = claudeData.content?.[0]?.text ?? ''

    let parsed: any = { questions: [] }
    try {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ error: 'Could not parse AI response', rawText: rawText.slice(0, 500) }, { status: 500 })
    }

    if (parsed.error === 'scanned_pdf') {
      return NextResponse.json({
        error: 'This PDF appears to be a scanned image. Please use a text-based PDF or type the questions manually after upload.',
        questions: [],
      })
    }

    return NextResponse.json({
      questions:      (parsed.questions ?? []).map((q: any) => ({ ...q, marks: q.marks || (q.type === 'MCQ' ? 2 : 10) })),
      totalQuestions: parsed.questions?.length ?? 0,
    })
  } catch (err: any) {
    console.error('AI extract error:', err)
    return NextResponse.json({ error: err.message ?? 'Extraction failed' }, { status: 500 })
  }
}
