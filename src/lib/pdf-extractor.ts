export interface ExtractedQuestion {
  orderNum: number; content: string
  optionA: string; optionB: string; optionC: string; optionD: string
  correctOption: string; explanation: string
}
export interface ExtractionResult { questions: ExtractedQuestion[]; rawText: string; error?: string }

function clean(s: string): string { return s.replace(/\s+/g, ' ').trim() }

export function parseMCQText(text: string): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = []
  const blocks = text.split(/(?=\n?\s*\(?\d{1,2}\)?[.)]\s)/).filter(Boolean)
  for (const block of blocks) {
    const numMatch = block.match(/^\s*\(?(\d{1,2})\)?[.)]\s+/)
    if (!numMatch) continue
    const orderNum = parseInt(numMatch[1], 10)
    if (orderNum < 1 || orderNum > 100) continue
    const rest  = block.slice(numMatch[0].length)
    const parts = rest.split(/(?=\(?[A-Ea-e]\)?[.)–\-]\s)/)
    if (parts.length < 2) continue
    const qText = clean(parts[0])
    if (!qText || qText.length < 4) continue
    const optMap: Record<string, string> = {}
    for (let i = 1; i < parts.length; i++) {
      const m = parts[i].match(/^\(?([A-Ea-e])\)?[.)–\-]\s*(.*)/)
      if (m) optMap[m[1].toUpperCase()] = clean(m[2])
    }
    if (!optMap['A'] || !optMap['B'] || !optMap['C'] || !optMap['D']) continue
    questions.push({ orderNum, content: qText, optionA: optMap['A'], optionB: optMap['B'], optionC: optMap['C'], optionD: optMap['D'], correctOption: '', explanation: '' })
  }
  return questions
}

export function parseAnswerKey(text: string): Record<number, string> {
  const key: Record<number, string> = {}
  const re = /(\d{1,2})\s*[.\-–:]\s*([A-Da-d])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) key[parseInt(m[1], 10)] = m[2].toUpperCase()
  return key
}

export function applyAnswerKey(questions: ExtractedQuestion[], key: Record<number, string>): ExtractedQuestion[] {
  return questions.map(q => ({ ...q, correctOption: key[q.orderNum] ?? q.correctOption }))
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse')
  const data = await pdfParse(buffer, { max: 0 })
  return data.text
}

export async function extractQuestionsFromPDF(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const rawText       = await extractTextFromPDF(buffer)
    const answerSection = rawText.match(/answer\s*key[\s\S]{0,2000}/i)?.[0] ?? ''
    const answerKey     = parseAnswerKey(answerSection || rawText)
    let questions       = parseMCQText(rawText)
    if (Object.keys(answerKey).length > 0) questions = applyAnswerKey(questions, answerKey)
    return { questions, rawText }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { questions: [], rawText: '', error: message }
  }
}
