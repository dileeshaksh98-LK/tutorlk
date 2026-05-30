'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SUBJECTS = [
  { id:'ol_maths',     name:'Mathematics (O/L)' },
  { id:'ol_science',   name:'Science (O/L)' },
  { id:'ol_english',   name:'English (O/L)' },
  { id:'ol_sinhala',   name:'Sinhala (O/L)' },
  { id:'ol_history',   name:'History (O/L)' },
  { id:'ol_geography', name:'Geography (O/L)' },
  { id:'ol_commerce',  name:'Commerce (O/L)' },
  { id:'ol_ict',       name:'ICT (O/L)' },
  { id:'al_combmaths', name:'Combined Maths (A/L)' },
  { id:'al_physics',   name:'Physics (A/L)' },
  { id:'al_chemistry', name:'Chemistry (A/L)' },
  { id:'al_biology',   name:'Biology (A/L)' },
  { id:'al_accounting',name:'Accounting (A/L)' },
  { id:'al_economics', name:'Economics (A/L)' },
  { id:'al_business',  name:'Business Studies (A/L)' },
  { id:'al_sinhala',   name:'Sinhala (A/L)' },
  { id:'al_english',   name:'English (A/L)' },
  { id:'al_geography', name:'Geography (A/L)' },
  { id:'al_history',   name:'History (A/L)' },
  { id:'sch_maths',    name:'Maths (Scholarship)' },
  { id:'sch_sinhala',  name:'Sinhala (Scholarship)' },
  { id:'sch_english',  name:'English (Scholarship)' },
]

interface Question {
  orderNum:number; type:'MCQ'|'STRUCTURED'; content:string
  optionA?:string; optionB?:string; optionC?:string; optionD?:string
  correctOption?:string; marks:number; explanation?:string; guideline?:string
}

export default function AdminUploadClient() {
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
    if (f.type !== 'application/pdf') { setError('PDF files only'); return }
    if (f.size > 15*1024*1024) { setError('Max 15MB'); return }
    setError(''); setFile(f)
    if (!title) setTitle(f.name.replace(/\.pdf$/i,'').replace(/[-_]/g,' '))
  }

  async function handleExtract() {
    if (!file||!title||!subjectId) { setError('Fill all fields and select a PDF'); return }
    setStep('extracting'); setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('language', language)
    fd.append('examType', examType)
    fd.append('subject', SUBJECTS.find(s=>s.id===subjectId)?.name ?? subjectId)
    setProgress('Claude AI is reading the PDF and extracting questions…')
    try {
      const res  = await fetch('/api/ai-extract', { method:'POST', body:fd })
      const data = await res.json()
      if (!res.ok || (data.error && !data.questions?.length)) {
        setError(data.error || 'Extraction failed — check if PDF is text-based not scanned')
        setStep('upload'); return
      }
      setQuestions((data.questions??[]).map((q:any)=>({...q,marks:q.marks||(q.type==='MCQ'?2:10)})))
      setStep('review')
    } catch(e:any) { setError(e.message||'Network error'); setStep('upload') }
  }

  function updateQ(i:number, field:keyof Question, val:any) {
    setQuestions(qs=>qs.map((q,idx)=>idx===i?{...q,[field]:val}:q))
  }
  function removeQ(i:number) { setQuestions(qs=>qs.filter((_,idx)=>idx!==i)) }
  function addMCQ() { setQuestions(qs=>[...qs,{orderNum:qs.length+1,type:'MCQ',content:'',optionA:'',optionB:'',optionC:'',optionD:'',correctOption:'A',marks:2,explanation:''}]) }
  function addStructured() { setQuestions(qs=>[...qs,{orderNum:qs.length+1,type:'STRUCTURED',content:'',marks:10,guideline:''}]) }

  async function handlePublish() {
    if (!questions.length) { setError('No questions to publish'); return }
    setStep('saving')
    const res = await fetch('/api/admin/upload-pdf/publish', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        title, subjectId, examType, year:parseInt(year), medium:language, timeMins:parseInt(timeMins),
        questions: questions.map((q,i)=>({
          orderNum:i+1, content:q.content,
          optionA:q.optionA||'—', optionB:q.optionB||'—', optionC:q.optionC||'—', optionD:q.optionD||'—',
          correctOption:q.correctOption||'', explanation:q.type==='STRUCTURED'?(q.guideline||''):(q.explanation||''), marks:q.marks||2,
        })),
      }),
    })
    if (res.ok) { router.push('/admin/papers') }
    else { const d=await res.json(); setError(d.error||'Publish failed'); setStep('review') }
  }

  if (step==='extracting') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"/>
          <div className="absolute inset-0 border-4 border-brand-400 border-t-transparent rounded-full animate-spin"/>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Claude AI is reading your paper</h2>
        <p className="text-sm text-gray-500 mb-6">{progress}</p>
        <div className="bg-brand-400/10 border border-brand-400/20 rounded-2xl p-4 text-left">
          <p className="text-xs font-medium text-brand-300 mb-2">What is happening:</p>
          <ul className="space-y-1 text-xs text-brand-400/80">
            <li>✓ Reading PDF in {language==='SINHALA'?'Sinhala':'language==='TAMIL'?'Tamil':'English'}</li>
            <li>✓ Detecting MCQ and structured questions</li>
            <li>✓ Extracting answer options</li>
            <li>✓ Finding correct answers from answer key</li>
            <li>✓ Generating explanations</li>
          </ul>
        </div>
      </div>
    </div>
  )

  if (step==='saving') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-400 font-medium">Publishing to past papers library…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/papers" className="text-gray-500 hover:text-white text-sm">← Papers</Link>
          <span className="text-gray-700">/</span>
          <span className="text-sm font-medium text-white">{step==='upload'?'Upload Paper':'Review Questions'}</span>
        </div>
        {step==='review' && (
          <div className="flex gap-2">
            <button onClick={()=>setStep('upload')} className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300">← Re-upload</button>
            <button onClick={handlePublish} disabled={!questions.length} className="px-4 py-1.5 text-sm bg-brand-400 hover:bg-brand-500 rounded-xl text-white font-medium disabled:opacity-50">
              🚀 Publish {questions.length} questions
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        {error && <div className="bg-red-950/50 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}

        {step==='upload' && (
          <>
            <div onClick={()=>fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${file?'border-brand-400 bg-brand-400/10':'border-gray-700 hover:border-gray-600 hover:bg-gray-900'}`}>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
              <div className="text-5xl mb-3">{file?'✅':'📄'}</div>
              {file ? (
                <><p className="font-semibold text-brand-300 text-lg">{file.name}</p><p className="text-sm text-gray-500 mt-1">{(file.size/1024/1024).toFixed(2)} MB · Click to change</p></>
              ) : (
                <><p className="font-semibold text-gray-300 text-lg">Click to select PDF</p><p className="text-sm text-gray-600 mt-1">Government past paper · Max 15MB · Sinhala, Tamil or English</p></>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-white">Paper details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Title *</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. G.C.E O/L Mathematics 2023"
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-400 placeholder-gray-600"/>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Subject *</label>
                  <select value={subjectId} onChange={e=>setSubjectId(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-400">
                    <option value="">Select…</option>
                    {SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Exam type</label>
                  <select value={examType} onChange={e=>setExamType(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-400">
                    <option value="SCHOLARSHIP">Scholarship</option>
                    <option value="OL">G.C.E O/L</option>
                    <option value="AL">G.C.E A/L</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Year</label>
                  <select value={year} onChange={e=>setYear(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-400">
                    {Array.from({length:12},(_,i)=>2024-i).map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Time limit</label>
                  <select value={timeMins} onChange={e=>setTimeMins(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-400">
                    {[60,90,120,150,180,240].map(t=><option key={t} value={t}>{t} minutes</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Language / medium *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{id:'SINHALA',icon:'🇱🇰',label:'Sinhala'},{id:'TAMIL',icon:'📿',label:'Tamil'},{id:'ENGLISH',icon:'🇬🇧',label:'English'}].map(l=>(
                    <button key={l.id} onClick={()=>setLanguage(l.id)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${language===l.id?'border-brand-400 bg-brand-400/10 text-brand-300':'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                      <div className="text-2xl mb-1">{l.icon}</div>{l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-purple-950/30 border border-purple-800/30 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="font-bold text-white mb-1">Claude AI (Anthropic) will extract questions</h3>
                <p className="text-sm text-gray-500">Reads Sinhala Unicode, Tamil Unicode and English. Detects MCQ and structured questions. Maps correct answers from answer key. You review before publishing.</p>
              </div>
            </div>

            <button onClick={handleExtract} disabled={!file||!title||!subjectId}
              className="w-full py-4 bg-brand-400 hover:bg-brand-500 text-white rounded-2xl font-semibold text-base shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              🤖 Extract questions with Claude AI →
            </button>
          </>
        )}

        {step==='review' && (
          <>
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${questions.length>0?'bg-green-950/50 border border-green-800/50 text-green-300':'bg-amber-950/50 border border-amber-800/50 text-amber-300'}`}>
              {questions.length>0?`✓ ${questions.length} questions extracted — review before publishing`:'⚠️ No questions extracted — add manually below'}
            </div>

            {questions.map((q,i)=>(
              <div key={i} className={`bg-gray-900 rounded-2xl border p-5 ${q.type==='MCQ'?'border-blue-800/30':'border-purple-800/30'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${q.type==='MCQ'?'bg-blue-400/20 text-blue-300':'bg-purple-400/20 text-purple-300'}`}>{q.type}</span>
                  <span className="text-xs text-gray-600">Q{i+1}</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-600">Marks:</span>
                    <input type="number" value={q.marks} min={1} max={20} onChange={e=>updateQ(i,'marks',parseInt(e.target.value)||1)}
                      className="w-14 h-7 px-2 text-xs bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-400"/>
                    <button onClick={()=>removeQ(i)} className="ml-1 text-red-600 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-950/30">✕</button>
                  </div>
                </div>
                <textarea value={q.content} onChange={e=>updateQ(i,'content',e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl resize-none focus:outline-none focus:border-brand-400 text-white mb-3 placeholder-gray-600"
                  placeholder="Question text…"/>
                {q.type==='MCQ' && (
                  <div className="grid sm:grid-cols-2 gap-2 mb-3">
                    {(['A','B','C','D'] as const).map(opt=>(
                      <div key={opt} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${q.correctOption===opt?'border-green-600/50 bg-green-950/30':'border-gray-700 hover:border-gray-600'}`}>
                        <input type="radio" name={`c_${i}`} checked={q.correctOption===opt} onChange={()=>updateQ(i,'correctOption',opt)} className="accent-green-400 w-4 h-4 flex-shrink-0"/>
                        <span className="text-xs font-bold text-gray-500 w-4">{opt}</span>
                        <input type="text" value={(q as any)[`option${opt}`]??''} onChange={e=>updateQ(i,`option${opt}` as any,e.target.value)}
                          placeholder={`Option ${opt}…`} className="flex-1 bg-transparent text-sm text-white focus:outline-none min-w-0 placeholder-gray-700"/>
                      </div>
                    ))}
                  </div>
                )}
                {q.type==='STRUCTURED' && (
                  <textarea value={q.guideline??''} onChange={e=>updateQ(i,'guideline',e.target.value)} rows={2}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl resize-none focus:outline-none focus:border-brand-400 text-white mb-2 placeholder-gray-600"
                    placeholder="Marking guidelines…"/>
                )}
                <input value={q.explanation??''} onChange={e=>updateQ(i,'explanation',e.target.value)}
                  placeholder="Explanation (shown to students after answering)…"
                  className="w-full h-8 px-3 text-xs bg-gray-800/50 border border-gray-800 rounded-lg text-gray-400 focus:outline-none focus:border-brand-400 placeholder-gray-700"/>
              </div>
            ))}

            <div className="flex gap-3">
              <button onClick={addMCQ} className="px-4 py-2 text-sm border border-blue-700/50 bg-blue-950/30 text-blue-300 rounded-xl font-medium hover:bg-blue-950/50">+ MCQ</button>
              <button onClick={addStructured} className="px-4 py-2 text-sm border border-purple-700/50 bg-purple-950/30 text-purple-300 rounded-xl font-medium hover:bg-purple-950/50">+ Structured</button>
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
