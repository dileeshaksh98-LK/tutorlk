'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SUBJECTS = [
  { id:'ol_maths',     name:'Mathematics (O/L)' },
  { id:'ol_science',   name:'Science (O/L)' },
  { id:'ol_english',   name:'English (O/L)' },
  { id:'ol_sinhala',   name:'Sinhala (O/L)' },
  { id:'al_combmaths', name:'Combined Maths (A/L)' },
  { id:'al_physics',   name:'Physics (A/L)' },
  { id:'al_chemistry', name:'Chemistry (A/L)' },
  { id:'al_biology',   name:'Biology (A/L)' },
  { id:'al_accounting',name:'Accounting (A/L)' },
  { id:'al_economics', name:'Economics (A/L)' },
  { id:'al_business',  name:'Business Studies (A/L)' },
  { id:'al_sinhala',   name:'Sinhala (A/L)' },
  { id:'al_english',   name:'English (A/L)' },
  { id:'sch_maths',    name:'Maths (Scholarship)' },
]

interface ExtractedQ {
  orderNum:number; content:string
  optionA:string; optionB:string; optionC:string; optionD:string
  correctOption:string; explanation:string; marks:number
}

export default function UploadPDFPage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title,     setTitle]     = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [examType,  setExamType]  = useState('OL')
  const [year,      setYear]      = useState('2023')
  const [medium,    setMedium]    = useState('SINHALA')
  const [timeMins,  setTimeMins]  = useState('180')
  const [file,      setFile]      = useState<File | null>(null)

  const [step,       setStep]      = useState<'form'|'preview'|'saving'>('form')
  const [questions,  setQuestions] = useState<ExtractedQ[]>([])
  const [rawText,    setRawText]   = useState('')
  const [extracting, setExtracting]= useState(false)
  const [error,      setError]     = useState('')
  const [progress,   setProgress]  = useState('')

  async function handleExtract() {
    if (!file || !title || !subjectId) { setError('Fill in all fields and select a PDF'); return }
    setExtracting(true); setError(''); setProgress('Reading PDF…')

    const formData = new FormData()
    formData.append('file',      file)
    formData.append('title',     title)
    formData.append('subjectId', subjectId)
    formData.append('examType',  examType)
    formData.append('year',      year)
    formData.append('medium',    medium)
    formData.append('timeMins',  timeMins)

    setProgress('Extracting questions from PDF…')
    const res  = await fetch('/api/admin/upload-pdf', { method:'POST', body: formData })
    const data = await res.json()

    if (!res.ok) { setError(data.error || 'Extraction failed'); setExtracting(false); return }

    setProgress('')
    setQuestions(data.questions.map((q: any) => ({ ...q, marks: 2 })))
    setRawText(data.rawText ?? '')
    setStep('preview')
    setExtracting(false)
  }

  function updateQuestion(i: number, field: keyof ExtractedQ, value: any) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  function removeQuestion(i: number) {
    setQuestions(qs => qs.filter((_, idx) => idx !== i))
  }

  async function handlePublish() {
    setStep('saving')
    const res = await fetch('/api/admin/upload-pdf/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subjectId, examType, year: parseInt(year), medium, timeMins: parseInt(timeMins), questions }),
    })
    if (res.ok) {
      router.push('/past-papers')
    } else {
      const d = await res.json()
      setError(d.error || 'Publish failed')
      setStep('preview')
    }
  }

  if (step === 'saving') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Publishing paper…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-brand-900 text-white py-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Upload Past Paper PDF</h1>
            <p className="text-gray-400 text-sm mt-1">Upload a government past paper — questions extracted automatically</p>
          </div>
          <Button onClick={() => router.push('/past-papers')} className="bg-white/10 border border-white/20 text-white hover:bg-white/20" size="sm">← Back</Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}

        {step === 'form' && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Paper details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paper title</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. G.C.E O/L Mathematics — 2024" className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                  <select value={subjectId} onChange={e => setSubjectId(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                    <option value="">Select subject…</option>
                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Exam type</label>
                  <select value={examType} onChange={e => setExamType(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                    <option value="OL">O/L</option>
                    <option value="AL">A/L</option>
                    <option value="SCHOLARSHIP">Scholarship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year</label>
                  <select value={year} onChange={e => setYear(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                    {Array.from({length:10},(_,i)=>2024-i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Medium</label>
                  <select value={medium} onChange={e => setMedium(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                    <option value="SINHALA">Sinhala</option>
                    <option value="TAMIL">Tamil</option>
                    <option value="ENGLISH">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time limit (minutes)</label>
                  <select value={timeMins} onChange={e => setTimeMins(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
                    {[60,90,120,180,240].map(t => <option key={t} value={t}>{t} minutes</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Upload PDF</h2>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${file ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => setFile(e.target.files?.[0] ?? null)} />
                <div className="text-4xl mb-3">{file ? '✅' : '📄'}</div>
                {file ? (
                  <div>
                    <p className="font-semibold text-brand-700">{file.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-gray-600">Click to select PDF</p>
                    <p className="text-sm text-gray-400 mt-1">Government past paper PDF — MCQ section will be extracted automatically</p>
                  </div>
                )}
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <strong>Tips for best extraction:</strong>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>✓ Use text-based PDFs (not scanned images)</li>
                  <li>✓ Questions numbered 1–50 format works best</li>
                  <li>✓ Options labelled A, B, C, D</li>
                  <li>✓ Answer key at the end of the PDF helps auto-fill correct answers</li>
                </ul>
              </div>
            </div>

            <Button onClick={handleExtract} disabled={extracting || !file || !title || !subjectId}
              size="lg" className="w-full shadow-md">
              {extracting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {progress || 'Extracting…'}
                </span>
              ) : '🔍 Extract questions from PDF'}
            </Button>
          </>
        )}

        {step === 'preview' && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">
                  Extracted questions
                  <span className="text-gray-400 font-normal text-sm ml-2">({questions.length} found)</span>
                </h2>
                <Button variant="outline" size="sm" onClick={() => setStep('form')}>← Re-upload</Button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                  <div className="text-3xl mb-2">😕</div>
                  <p className="text-gray-500 mb-1 font-medium">No questions extracted</p>
                  <p className="text-sm text-gray-400">The PDF may be scanned or in an unsupported format. Try a different PDF or enter questions manually.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={i} className="border-2 border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 rounded-xl bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center">Q{q.orderNum}</span>
                        <div className="flex gap-2 ml-auto">
                          <input type="number" value={q.marks} onChange={e => updateQuestion(i,'marks',parseInt(e.target.value))}
                            className="w-16 h-7 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400" />
                          <span className="text-xs text-gray-400 self-center">marks</span>
                          <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                        </div>
                      </div>
                      <textarea value={q.content} onChange={e => updateQuestion(i,'content',e.target.value)} rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-brand-400 mb-2" />
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {(['A','B','C','D'] as const).map(opt => (
                          <div key={opt} className="flex items-center gap-2">
                            <input type="radio" name={`correct_${i}`} value={opt}
                              checked={q.correctOption === opt}
                              onChange={() => updateQuestion(i,'correctOption',opt)}
                              className="accent-brand-400 flex-shrink-0" />
                            <input type="text" value={(q as any)[`option${opt}`]}
                              onChange={e => updateQuestion(i,`option${opt}` as any,e.target.value)}
                              placeholder={`Option ${opt}`}
                              className="flex-1 h-8 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400" />
                          </div>
                        ))}
                      </div>
                      <input type="text" value={q.explanation}
                        onChange={e => updateQuestion(i,'explanation',e.target.value)}
                        placeholder="Explanation (optional — shown to students after answering)"
                        className="w-full h-8 px-3 text-xs border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:border-brand-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('form')} className="flex-1">← Back</Button>
              <Button onClick={handlePublish} disabled={questions.length === 0} className="flex-1 px-8">
                🚀 Publish {questions.length} questions
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
