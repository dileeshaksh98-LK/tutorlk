'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type QType = 'MCQ' | 'STRUCTURED' | 'ESSAY'

interface Question {
  type: QType
  content: string
  marks: number
  optionA?: string; optionB?: string; optionC?: string; optionD?: string
  correctOption?: string
  tutorNote?: string
}

export default function NewPaperPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<{id:string;name:string}[]>([])
  const [title,        setTitle]       = useState('')
  const [subjectId,    setSubjectId]   = useState('')
  const [paperType,    setPaperType]   = useState('MODEL_PAPER')
  const [markingType,  setMarkingType] = useState('MANUAL')
  const [timeLimit,    setTimeLimit]   = useState('180')
  const [totalMarks,   setTotalMarks]  = useState('100')
  const [questions,    setQuestions]   = useState<Question[]>([])
  const [loading,      setLoading]     = useState(false)
  const [error,        setError]       = useState('')

  useEffect(() => {
    fetch('/api/subjects').then(r=>r.json()).then(d => setSubjects(d.subjects ?? []))
  }, [])

  function addQuestion(type: QType) {
    setQuestions([...questions, {
      type, content: '', marks: type === 'MCQ' ? 2 : 10,
      optionA:'', optionB:'', optionC:'', optionD:'',
      correctOption: 'A', tutorNote:'',
    }])
  }

  function updateQuestion(i: number, field: keyof Question, value: any) {
    setQuestions(questions.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  function removeQuestion(i: number) {
    setQuestions(questions.filter((_, idx) => idx !== i))
  }

  async function handleSave(publish = false) {
    if (!title || !subjectId) { setError('Title and subject are required'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/tutor/papers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subjectId, paperType, markingType, timeLimitMins: parseInt(timeLimit), totalMarks: parseInt(totalMarks), questions, isPublished: publish }),
    })
    if (res.ok) router.push('/tutor/papers')
    else { const d = await res.json(); setError(d.error || 'Save failed') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-brand-900 text-white py-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Upload Model Paper</h1>
            <p className="text-gray-400 text-sm mt-1">Create a paper with questions for your students</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleSave(false)} disabled={loading} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">Save draft</Button>
            <Button onClick={() => handleSave(true)}  disabled={loading} className="bg-brand-400 hover:bg-brand-500">Publish →</Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}

        {/* Paper details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Paper details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paper title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. A/L Combined Maths — 2024 Model Paper 1" className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                <option value="">Select subject…</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paper type</label>
              <select value={paperType} onChange={e => setPaperType(e.target.value)} className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                <option value="MODEL_PAPER">Model paper</option>
                <option value="PAST_PAPER">Past paper</option>
                <option value="TOPIC_TEST">Topic test</option>
                <option value="QUICK_QUIZ">Quick quiz</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Marking type</label>
              <select value={markingType} onChange={e => setMarkingType(e.target.value)} className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                <option value="MANUAL">Manual (I will mark)</option>
                <option value="AUTO">Auto-mark (MCQ only)</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time limit (minutes)</label>
              <select value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                {[20,30,45,60,90,120,180].map(t => <option key={t} value={t}>{t} minutes</option>)}
                <option value="0">No limit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Questions <span className="text-gray-400 font-normal text-sm">({questions.length})</span></h2>
            <div className="flex gap-2">
              {[{type:'MCQ' as QType,label:'+ MCQ'},{type:'STRUCTURED' as QType,label:'+ Structured'},{type:'ESSAY' as QType,label:'+ Essay'}].map(q => (
                <Button key={q.type} variant="outline" size="sm" onClick={() => addQuestion(q.type)} className="text-xs">{q.label}</Button>
              ))}
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
              <div className="text-3xl mb-2">❓</div>
              <p className="text-sm text-gray-400">Add MCQ, structured or essay questions above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="border-2 border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.type === 'MCQ' ? 'bg-blue-50 text-blue-600' : q.type === 'STRUCTURED' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>{q.type}</span>
                    <span className="text-xs text-gray-400">Q{i+1}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <label className="text-xs text-gray-400">Marks:</label>
                      <input type="number" value={q.marks} onChange={e => updateQuestion(i,'marks',parseInt(e.target.value))} className="w-14 h-7 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400" />
                      <button onClick={() => removeQuestion(i)} className="ml-2 text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                  </div>
                  <textarea value={q.content} onChange={e => updateQuestion(i,'content',e.target.value)} placeholder={`Question ${i+1} text…`} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-brand-400 mb-2" />

                  {q.type === 'MCQ' && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {['A','B','C','D'].map(opt => (
                        <div key={opt} className="flex items-center gap-2">
                          <input type="radio" name={`correct_${i}`} value={opt} checked={q.correctOption === opt} onChange={() => updateQuestion(i,'correctOption',opt)} className="accent-brand-400 flex-shrink-0" />
                          <input type="text" value={(q as any)[`option${opt}`]} onChange={e => updateQuestion(i,`option${opt}` as any, e.target.value)} placeholder={`Option ${opt}`} className="flex-1 h-8 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400" />
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="text" value={q.tutorNote ?? ''} onChange={e => updateQuestion(i,'tutorNote',e.target.value)} placeholder="Tutor note / hint (optional — shown after student submits)" className="w-full h-8 px-3 text-xs border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:border-brand-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => router.push('/tutor/papers')}>Cancel</Button>
          <Button onClick={() => handleSave(false)} disabled={loading} variant="outline">Save draft</Button>
          <Button onClick={() => handleSave(true)} disabled={loading} className="px-8">🚀 Publish paper</Button>
        </div>
      </div>
    </div>
  )
}
