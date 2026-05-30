'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Question {
  id?:string; orderNum:number; content:string
  optionA:string; optionB:string; optionC:string; optionD:string
  correctOption:string; explanation:string; marks:number
}

export default function ReviewPaperPage() {
  const { paperId } = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [paper,     setPaper]     = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [status,    setStatus]    = useState('processing')

  useEffect(() => {
    if (!paperId) return
    const load = async () => {
      const res  = await fetch(`/api/papers/extract-status/${paperId}`)
      const data = await res.json()
      setStatus(data.status ?? 'processing')
      if (data.paper) setPaper(data.paper)
      if (data.questions?.length > 0) {
        setQuestions(data.questions.map((q:any)=>({...q, marks: q.marks||2})))
        setLoading(false)
      } else if (data.status==='error') {
        setLoading(false)
      } else if (data.status==='ready' && data.questions?.length===0) {
        setLoading(false)
      }
    }
    load()
    const t = setInterval(async ()=>{
      const res  = await fetch(`/api/papers/extract-status/${paperId}`)
      const data = await res.json()
      setStatus(data.status??'processing')
      if (data.paper) setPaper(data.paper)
      if (data.questions?.length>0) { setQuestions(data.questions.map((q:any)=>({...q,marks:q.marks||2}))); setLoading(false); clearInterval(t) }
      if (data.status==='error'||data.status==='ready') { setLoading(false); clearInterval(t) }
    }, 3000)
    return ()=>clearInterval(t)
  }, [paperId])

  function updateQ(i:number, field:keyof Question, val:any) {
    setQuestions(qs=>qs.map((q,idx)=>idx===i?{...q,[field]:val}:q))
  }
  function removeQ(i:number) { setQuestions(qs=>qs.filter((_,idx)=>idx!==i)) }
  function addQ() {
    setQuestions(qs=>[...qs,{orderNum:qs.length+1,content:'',optionA:'',optionB:'',optionC:'',optionD:'',correctOption:'A',explanation:'',marks:2}])
  }

  async function handlePublish() {
    setSaving(true); setError('')
    const res = await fetch(`/api/papers/${paperId}/questions`,{
      method:'PUT', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({questions, publish:true})
    })
    if (res.ok) router.push('/past-papers')
    else { const d=await res.json(); setError(d.error||'Publish failed'); setSaving(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-brand-100 rounded-full"/>
          <div className="absolute inset-0 border-4 border-brand-400 border-t-transparent rounded-full animate-spin"/>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">📄</div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {status==='processing'?'Extracting questions…':'Loading…'}
        </h2>
        <p className="text-sm text-gray-400">Reading the PDF and detecting questions. This may take up to 30 seconds.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-brand-900 text-white py-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold">{paper?.title||'Review Paper'}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{questions.length} questions · Review and correct before publishing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=>router.push('/tutor/papers')} className="bg-white/10 border-white/20 text-white hover:bg-white/20" size="sm">Cancel</Button>
            <Button onClick={handlePublish} disabled={saving||questions.length===0}>
              {saving?'Publishing…':`🚀 Publish ${questions.length} questions`}
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}
        {questions.length===0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">😕</div>
            <h3 className="font-bold text-amber-800 mb-1">No questions extracted</h3>
            <p className="text-sm text-amber-700 mb-4">The PDF may be scanned. Add questions manually below.</p>
            <Button onClick={addQ} variant="outline">+ Add question manually</Button>
          </div>
        )}
        {questions.length>0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
            ✓ {questions.length} questions extracted. Review especially the correct answers (click the radio button for the correct option).
          </div>
        )}
        {questions.map((q,i)=>(
          <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-xl bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center">Q{i+1}</span>
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
            <div className="grid sm:grid-cols-2 gap-2 mb-3">
              {(['A','B','C','D'] as const).map(opt=>(
                <div key={opt} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${q.correctOption===opt?'border-green-400 bg-green-50':'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name={`c_${i}`} checked={q.correctOption===opt} onChange={()=>updateQ(i,'correctOption',opt)} className="accent-green-500 w-4 h-4 flex-shrink-0"/>
                  <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">{opt}</span>
                  <input type="text" value={(q as any)[`option${opt}`]??''} onChange={e=>updateQ(i,`option${opt}` as any,e.target.value)}
                    placeholder={`Option ${opt}…`} className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"/>
                </div>
              ))}
            </div>
            <input value={q.explanation||''} onChange={e=>updateQ(i,'explanation',e.target.value)}
              placeholder="Explanation shown to students after answering…"
              className="w-full h-8 px-3 text-xs border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:border-brand-400"/>
          </div>
        ))}
        <div className="flex gap-3">
          <Button variant="outline" onClick={addQ} className="flex-1">+ Add question</Button>
          {questions.length>0 && <Button onClick={handlePublish} disabled={saving} className="flex-1">{saving?'Publishing…':`🚀 Publish ${questions.length}`}</Button>}
        </div>
      </div>
    </div>
  )
}
