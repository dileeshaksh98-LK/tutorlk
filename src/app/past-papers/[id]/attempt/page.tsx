'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Question {
  id: string; orderNum: number; content: string
  optionA: string; optionB: string; optionC: string; optionD: string
  correctOption: string; explanation: string; marks: number
}
interface Paper {
  id: string; title: string; timeMins: number; totalMarks: number
  questions: Question[]; subject: { name: string }
}
interface Answer { questionId: string; selected: string | null; correct: boolean | null; revealed: boolean }

const OPTS = ['A','B','C','D'] as const

export default function AttemptPage() {
  const { id } = useParams()
  const router   = useRouter()
  const [paper,   setPaper]   = useState<Paper | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [loading,  setLoading] = useState(true)
  const [saving,   setSaving]  = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  useEffect(() => {
    fetch(`/api/past-papers/${id}`).then(r => r.json()).then(d => {
      setPaper(d.paper)
      setTimeLeft(d.paper.timeMins * 60)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!started || finished) return
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { clearInterval(t); handleFinish(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [started, finished])

  function handleStart() { setStarted(true); setStartTime(Date.now()) }

  function handleSelect(questionId: string, option: string) {
    if (finished) return
    const q = paper!.questions.find(q => q.id === questionId)!
    const isCorrect = option === q.correctOption
    setAnswers(prev => ({ ...prev, [questionId]: { questionId, selected: option, correct: isCorrect, revealed: true } }))
  }

  async function handleFinish() {
    if (saving) return
    setSaving(true); setFinished(true)
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    const correct = Object.values(answers).filter(a => a.correct).length
    const score = (correct / paper!.questions.length) * 100

    await fetch(`/api/past-papers/${id}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: Object.values(answers), timeTaken, score, correct, total: paper!.questions.length }),
    }).catch(() => {})

    router.push(`/past-papers/${id}/results?score=${Math.round(score)}&correct=${correct}&total=${paper!.questions.length}&time=${timeTaken}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><div className="w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-400">Loading paper…</p></div>
    </div>
  )

  if (!paper) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Paper not found</p></div>

  if (!started) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{paper.title}</h1>
        <p className="text-sm text-gray-400 mb-6">{paper.subject.name} · {paper.questions.length} MCQ questions · {paper.timeMins} minutes</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[{v:paper.questions.length,l:'Questions'},{v:`${paper.timeMins}m`,l:'Time limit'},{v:`${paper.totalMarks}`,l:'Total marks'}].map(s => (
            <div key={s.l} className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-black text-brand-600">{s.v}</div>
              <div className="text-xs text-gray-400">{s.l}</div>
            </div>
          ))}
        </div>
        <ul className="text-sm text-gray-500 text-left space-y-1.5 mb-6">
          <li>✓ Select one answer per question</li>
          <li>✓ Instant feedback after each answer</li>
          <li>✓ Read the explanation before moving on</li>
          <li>✓ Timer counts down automatically</li>
        </ul>
        <Button size="lg" className="w-full shadow-md" onClick={handleStart}>🚀 Start now</Button>
      </div>
    </div>
  )

  const q    = paper.questions[current]
  const ans  = answers[q.id]
  const done = !!ans?.revealed
  const mm   = String(Math.floor(timeLeft / 60)).padStart(2,'0')
  const ss   = String(timeLeft % 60).padStart(2,'0')
  const pct  = Math.round(((current + 1) / paper.questions.length) * 100)
  const answered = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-400 rounded-full transition-all duration-300" style={{width:`${pct}%`}} />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{current + 1} of {paper.questions.length}</div>
          </div>
          <div className={`text-sm font-mono font-bold px-3 py-1 rounded-xl ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
            ⏱ {mm}:{ss}
          </div>
          <div className="text-xs text-gray-400">{answered} answered</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Question card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-start gap-3 mb-5">
            <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-bold text-sm flex items-center justify-center flex-shrink-0">{current + 1}</span>
            <p className="text-base text-gray-900 leading-relaxed font-medium">{q.content}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {OPTS.map(opt => {
              const optText = (q as any)[`option${opt}`]
              const isSelected = ans?.selected === opt
              const isCorrect  = q.correctOption === opt
              let cls = 'border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer'
              if (done) {
                if (isCorrect)                     cls = 'border-green-400 bg-green-50 cursor-default'
                else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 cursor-default'
                else                               cls = 'border-gray-100 bg-gray-50/50 opacity-60 cursor-default'
              } else if (isSelected) {
                cls = 'border-brand-400 bg-brand-50 cursor-pointer'
              }

              return (
                <button key={opt} onClick={() => !done && handleSelect(q.id, opt)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${cls}`}>
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                    done && isCorrect ? 'bg-green-500 text-white' :
                    done && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                    isSelected ? 'bg-brand-400 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{opt}</span>
                  <span className="text-sm text-gray-800">{optText}</span>
                  {done && isCorrect && <span className="ml-auto text-green-500 text-base">✓</span>}
                  {done && isSelected && !isCorrect && <span className="ml-auto text-red-500 text-base">✗</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Explanation */}
        {done && q.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-600 font-medium text-sm">💡 Explanation</span>
              {ans.correct ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-auto">✓ Correct</span>
                           : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium ml-auto">✗ Incorrect — correct answer: {q.correctOption}</span>}
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{q.explanation}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} className="flex-1">← Previous</Button>
          {current < paper.questions.length - 1 ? (
            <Button onClick={() => setCurrent(current + 1)} className="flex-1" disabled={!done}>Next →</Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600">
              {saving ? 'Saving…' : '🏁 Finish paper'}
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">Jump to question</p>
          <div className="flex flex-wrap gap-1.5">
            {paper.questions.map((pq, i) => {
              const pa = answers[pq.id]
              return (
                <button key={pq.id} onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    i === current ? 'bg-brand-400 text-white shadow-sm' :
                    pa?.correct === true ? 'bg-green-100 text-green-700' :
                    pa?.correct === false ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>{i + 1}</button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
