import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = (session.user as any).role
    if (role !== 'TUTOR' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only tutors and admins can upload papers' }, { status: 403 })
    }

    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const language = (formData.get('language') as string) ?? 'SINHALA'
    const examType = (formData.get('examType') as string) ?? 'OL'
    const subject  = (formData.get('subject') as string) ?? 'Mathematics'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'File too large — max 15MB' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const base64      = Buffer.from(arrayBuffer).toString('base64')
    const langLabel   = language === 'SINHALA' ? 'Sinhala (සිංහල)' : language === 'TAMIL' ? 'Tamil (தமிழ்)' : 'English'

    const prompt = `You are an expert Sri Lankan exam paper analyser. You are given a ${langLabel} medium ${examType} past paper PDF for the subject "${subject}".

Extract ALL questions. Support both MCQ and Structured question types.

CRITICAL RULES:
- Preserve ALL text in the ORIGINAL language — do NOT translate
- For Sinhala: keep Unicode Sinhala characters exactly as they appear
- For Tamil: keep Unicode Tamil characters exactly as they appear
- For MCQ: extract question stem and all 4 options (A, B, C, D)
- For Structured: extract full question text and mark allocation
- If you see an answer key, use it to fill correctOption
- Generate a brief explanation for each MCQ answer in ${langLabel}

Return ONLY valid JSON (no markdown, no backticks, no explanation outside JSON):
{
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
      "explanation": "brief explanation"
    },
    {
      "orderNum": 2,
      "type": "STRUCTURED",
      "content": "full question text",
      "marks": 10,
      "guideline": "expected answer points"
    }
  ]
}`

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables' }, { status: 500 })

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
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
      console.error('Claude API error:', errText)
      return NextResponse.json({ error: 'AI extraction failed — check ANTHROPIC_API_KEY in Vercel' }, { status: 500 })
    }

    const claudeData = await claudeRes.json()
    const rawText    = claudeData.content?.[0]?.text ?? ''

    let parsed: any = { questions: [] }
    try {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ error: 'Could not parse AI response', questions: [] }, { status: 500 })
    }

    return NextResponse.json({
      questions: (parsed.questions ?? []).map((q: any) => ({
        ...q, marks: q.marks || (q.type === 'MCQ' ? 2 : 10),
      })),
      totalQuestions: parsed.questions?.length ?? 0,
    })
  } catch (err: any) {
    console.error('AI extract error:', err)
    return NextResponse.json({ error: err.message ?? 'Extraction failed' }, { status: 500 })
  }
}
