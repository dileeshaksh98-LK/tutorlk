'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

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

interface Question {
  orderNum:number; type:'MCQ'|'STRUCTURED'; content:string
  optionA?:string; optionB?:string; optionC?:string; optionD?:string
  correctOption?:string; marks:number; explanation?:string; guideline?:string
}

export default function UploadPaperPage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [file,      setFile]      = useState<File|null>(null)
  const [title,     setTitle]     = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [examType,  setExamType]  = useState('OL')
  const [language,  setLanguage]  = useState('SINHALA')
  const [year,      setYear]      = useState(String(new Date().getFullYear()-1))
  const [timeMins,  setTimeMins]  = useState('180')

  const [step,      setStep]      = useState<'upload'|'extracting'|'review'|'saving'>('upload')
  const [questions, setQuestions] = useState<Question[]>([])
  const [error,     setError]     = useState('')
  const [progress,  setProgress]  = useState('')

  function handleFile(f: File) {
    if (f.type !== 'application/pdf') { setError('Please select a PDF file'); return }
    if (f.size > 15*1024*1024) { setError('Max 15MB'); return }
    setError(''); setFile(f)
    if (!title) setTitle(f.name.replace(/\.pdf$/i,'').replace(/[-_]/g,' '))
  }

  async function handleExtract() {
    if (!file||!title||!subjectId) { setError('Fill all fields and select a PDF'); return }
    setStep('extracting'); setError('')
    setProgress('Sending PDF to Claude AI…')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('language', language)
    fd.append('examType', examType)
    fd.append('subject', SUBJECTS.find(s=>s.id===subjectId)?.name ?? subjectId)
    try {
      setProgress('AI is reading the paper and extracting questions (this takes ~20 seconds)…')
      const res  = await fetch('/api/ai-extract', { method:'POST', body:fd })
      const data = await res.json()
      if (data.error && data.questions?.length === 0) {
        setError(data.error)
        setStep('upload')
        return
      }
      setQuestions(data.questions ?? [])
      setStep('review')
    } catch(e:any) {
      setError(e.message||'Network error')
      setStep('upload')
    }
  }

  function updateQ(i:number, field:keyof Question, val:any) {
    setQuestions(qs => qs.map((q,idx) => idx===i ? {...q,[field]:val} : q))
  }
  function removeQ(i:number) { setQuestions(qs=>qs.filter((_,idx)=>idx!==i)) }
  function addMCQ() {
    setQuestions(qs=>[...qs,{orderNum:qs.length+1,type:'MCQ',content:'',optionA:'',optionB:'',optionC:'',optionD:'',correctOption:'A',marks:2,explanation:''}])
  }
  function addStructured() {
    setQuestions(qs=>[...qs,{orderNum:qs.length+1,type:'STRUCTURED',content:'',marks:10,guideline:''}])
  }

  async function handlePublish() {
    if (!questions.length) { setError('Add at least one question'); return }
    setStep('saving')
    const res = await fetch('/api/admin/upload-pdf/publish', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        title, subjectId, examType,
        year: parseInt(year), medium: language, timeMins: parseInt(timeMins),
        questions: questions.map((q,i) => ({
          orderNum:      i+1,
          content:       q.content,
          optionA:       q.optionA||'—',
          optionB:       q.optionB||'—',
          optionC:       q.optionC||'—',
          optionD:       q.optionD||'—',
          correctOption: q.correctOption||'',
          explanation:   q.type==='STRUCTURED' ? (q.guideline||'') : (q.explanation||''),
          marks:         q.marks||2,
        })),
      }),
    })
    if (res.ok) { router.push('/past-papers') }
    else {
      const d = await res.json()
      setError(d.error||'Publish failed')
      setStep('review')
    }
  }

  if (step==='extracting') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10 max-w-md w-full text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 w-24 h-24 border-4 border-brand-100 rounded-full"/>
          <div className="absolute inset-0 w-24 h-24 border-4 border-brand-400 border-t-transparent rounded-full animate-spin"/>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Claude AI is reading your paper</h2>
        <p className="text-sm text-gray-500 mb-6">{progress}</p>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4 text-left">
          <p className="text-xs font-semibold text-purple-700 mb-2">What is happening:</p>
          <ul className="space-y-1 text-xs text-purple-600">
            <li>✓ Reading PDF in {language==='SINHALA'?'Sinhala (සිංහල)':language==='TAMIL'?'Tamil (தமிழ்)':'English'}</li>
            <li>✓ Detecting MCQ and structured questions</li>
            <li>✓ Extracting all answer options</li>
            <li>✓ Finding correct answers from answer key</li>
            <li>✓ Generating explanations per question</li>
          </ul>
        </div>
      </div>
    </div>
  )

  if (step==='saving') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-600 font-medium">Publishing paper to library…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-brand-900 text-white py-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <button onClick={()=>router.back()} className="text-gray-400 hover:text-white text-sm mb-2 block">← Back</button>
            <h1 className="text-2xl font-bold">
              {step==='upload'?'📄 Upload Paper with AI':'✏️ Review & Edit Questions'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {step==='upload'
                ? 'Claude AI extracts MCQ & structured questions from your PDF in Sinhala, Tamil or English'
                : `${questions.length} questions extracted — review before publishing`}
            </p>
          </div>
          {step==='review' && (
            <div className="flex gap-2">
              <button onClick={()=>setStep('upload')} className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20">← Re-upload</button>
              <button onClick={handlePublish} disabled={!questions.length}
                className="px-4 py-1.5 text-sm bg-brand-400 hover:bg-brand-500 rounded-xl text-white font-medium disabled:opacity-50">
                🚀 Publish {questions.length} questions
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}

        {step==='upload' && (
          <>
            <div onClick={()=>fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${file?'border-brand-400 bg-brand-50':'border-gray-300 bg-white hover:border-brand-300 hover:bg-brand-50/30'}`}>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
              <div className="text-5xl mb-3">{file?'✅':'📄'}</div>
              {file ? (
                <>
                  <p className="font-semibold text-brand-700 text-lg">{file.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{(file.size/1024/1024).toFixed(2)} MB · Click to change</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-700 text-lg">Click to select PDF</p>
                  <p className="text-sm text-gray-400 mt-1">Government past paper or model paper · Max 15MB</p>
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Paper details</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paper title *</label>
                <input value={title} onChange={e=>setTitle(e.target.value)}
                  placeholder="e.g. G.C.E O/L Mathematics 2023"
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none"/>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
                  <select value={subjectId} onChange={e=>setSubjectId(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none bg-white">
                    <option value="">Select subject…</option>
                    {SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Exam type</label>
                  <select value={examType} onChange={e=>setExamType(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none bg-white">
                    <option value="SCHOLARSHIP">Scholarship (Grade 5)</option>
                    <option value="OL">G.C.E O/L</option>
                    <option value="AL">G.C.E A/L</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year</label>
                  <select value={year} onChange={e=>setYear(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none bg-white">
                    {Array.from({length:10},(_,i)=>2024-i).map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time limit</label>
                  <select value={timeMins} onChange={e=>setTimeMins(e.target.value)}
                    className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none bg-white">
                    {[60,90,120,150,180,240].map(t=><option key={t} value={t}>{t} minutes</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Paper language / medium *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{id:'SINHALA',icon:'🇱🇰',label:'Sinhala',sub:'සිංහල'},{id:'TAMIL',icon:'📿',label:'Tamil',sub:'தமிழ்'},{id:'ENGLISH',icon:'🇬🇧',label:'English',sub:''}].map(l=>(
                    <button key={l.id} onClick={()=>setLanguage(l.id)}
                      className={`py-3 rounded-2xl border-2 text-sm font-medium transition-all ${language===l.id?'border-brand-400 bg-brand-50 text-brand-700 shadow-sm':'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}>
                      <div className="text-2xl mb-1">{l.icon}</div>
                      <div>{l.label}</div>
                      {l.sub && <div className="text-xs opacity-60">{l.sub}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-5 flex items-start gap-4">
              <div className="text-4xl">🤖</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Powered by Claude AI (Anthropic)</h3>
                <p className="text-sm text-gray-600 mb-2">Claude reads the entire PDF and extracts every question automatically — no manual typing needed.</p>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  <li>✓ Supports Sinhala Unicode, Tamil Unicode and English</li>
                  <li>✓ Detects MCQ and structured/essay questions</li>
                  <li>✓ Finds answer key and maps correct answers</li>
                  <li>✓ Generates explanations for every MCQ</li>
                  <li>✓ You review and correct before publishing</li>
                </ul>
              </div>
            </div>

            <button onClick={handleExtract} disabled={!file||!title||!subjectId}
              className="w-full py-4 bg-gradient-to-r from-brand-400 to-brand-600 text-white rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              🤖 Extract questions with Claude AI →
            </button>
          </>
        )}

        {step==='review' && (
          <>
            <div className={`rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-medium ${questions.length>0?'bg-green-50 border border-green-200 text-green-700':'bg-amber-50 border border-amber-200 text-amber-700'}`}>
              {questions.length>0
                ? `✓ ${questions.length} questions extracted — review each one before publishing`
                : '⚠️ No questions extracted — add them manually below'}
            </div>

            {questions.map((q,i)=>(
              <div key={i} className={`bg-white rounded-2xl border-2 shadow-sm p-5 ${q.type==='MCQ'?'border-blue-100':'border-purple-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${q.type==='MCQ'?'bg-blue-50 text-blue-700':'bg-purple-50 text-purple-700'}`}>{q.type}</span>
                  <span className="text-xs text-gray-400">Q{i+1}</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-400">Marks:</span>
                    <input type="number" value={q.marks} min={1} max={20} onChange={e=>updateQ(i,'marks',parseInt(e.target.value)||1)}
                      className="w-14 h-7 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400"/>
                    <button onClick={()=>removeQ(i)} className="ml-1 text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50">✕</button>
                  </div>
                </div>
                <textarea value={q.content} onChange={e=>updateQ(i,'content',e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-brand-400 mb-3"
                  placeholder="Question text…"/>
                {q.type==='MCQ' && (
                  <div className="grid sm:grid-cols-2 gap-2 mb-3">
                    {(['A','B','C','D'] as const).map(opt=>(
                      <div key={opt} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${q.correctOption===opt?'border-green-400 bg-green-50':'border-gray-100 hover:border-gray-200'}`}>
                        <input type="radio" name={`c_${i}`} checked={q.correctOption===opt} onChange={()=>updateQ(i,'correctOption',opt)}
                          className="accent-green-500 w-4 h-4 flex-shrink-0"/>
                        <span className="text-xs font-bold text-gray-400 flex-shrink-0 w-4">{opt}</span>
                        <input type="text" value={(q as any)[`option${opt}`]??''} onChange={e=>updateQ(i,`option${opt}` as any,e.target.value)}
                          placeholder={`Option ${opt}…`} className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"/>
                      </div>
                    ))}
                  </div>
                )}
                {q.type==='STRUCTURED' && (
                  <textarea value={q.guideline??''} onChange={e=>updateQ(i,'guideline',e.target.value)} rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-100 bg-gray-50 rounded-xl resize-none focus:outline-none focus:border-brand-400 mb-2"
                    placeholder="Marking guidelines / expected answer…"/>
                )}
                <input value={q.explanation??''} onChange={e=>updateQ(i,'explanation',e.target.value)}
                  placeholder="Explanation shown to students after answering…"
                  className="w-full h-8 px-3 text-xs border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:border-brand-400"/>
              </div>
            ))}

            <div className="flex gap-3 flex-wrap">
              <button onClick={addMCQ} className="px-4 py-2 text-sm border-2 border-blue-200 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100">+ Add MCQ</button>
              <button onClick={addStructured} className="px-4 py-2 text-sm border-2 border-purple-200 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100">+ Add Structured</button>
              <button onClick={handlePublish} disabled={!questions.length}
                className="flex-1 py-2 bg-brand-400 hover:bg-brand-500 text-white rounded-xl font-semibold disabled:opacity-50 shadow-md">
                🚀 Publish {questions.length} questions to library
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
