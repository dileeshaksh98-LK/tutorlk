'use client'
import { useState, useEffect } from 'react'
import { TutorCard } from './tutor-card'
import { Button } from '@/components/ui/button'
import type { TutorCard as TutorCardType, SearchResult } from '@/types'

const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota','Jaffna','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla','Ratnapura','Kegalle','Trincomalee','Batticaloa','Ampara','Vavuniya','Monaragala']

// Step 1 — Education levels
const LEVELS = [
  { id: 'SCHOLARSHIP', label: 'Scholarship',    sub: 'Grade 5',      icon: '🏆', color: 'from-yellow-400 to-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700' },
  { id: 'GRADE_6_9',   label: 'Grade 6–9',      sub: 'Junior sec.',  icon: '📚', color: 'from-blue-400 to-blue-600',     bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700' },
  { id: 'OL',          label: 'O/L',            sub: 'Grade 10–11',  icon: '📝', color: 'from-green-400 to-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  { id: 'AL',          label: 'A/L',            sub: 'Grade 12–13',  icon: '🎓', color: 'from-brand-400 to-brand-600',   bg: 'bg-brand-50',   border: 'border-brand-200',   text: 'text-brand-700' },
  { id: 'REVISION',    label: 'Revision',       sub: 'Crash course', icon: '🔄', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700' },
  { id: 'EXTRA',       label: 'Music & Sports', sub: 'Extra curricular', icon: '🎵', color: 'from-pink-400 to-rose-500', bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700' },
]

// Step 2 — A/L Streams
const STREAMS = [
  { id: 'SCIENCE',    label: 'Science',    icon: '🔬', desc: 'Maths · Physics · Chemistry · Biology', color: 'from-blue-500 to-cyan-500',   bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
  { id: 'COMMERCE',   label: 'Commerce',   icon: '💼', desc: 'Accounting · Business · Economics',     color: 'from-green-500 to-emerald-500',bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700' },
  { id: 'ARTS',       label: 'Arts',       icon: '🎨', desc: 'Sinhala · English · History · Geo',    color: 'from-purple-500 to-violet-500',bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  { id: 'TECHNOLOGY', label: 'Technology', icon: '⚙️', desc: 'Engineering Tech · ICT · Bio Systems', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
]

// Subjects by level/stream — ONLY relevant ones shown
const SUBJECTS_BY_LEVEL: Record<string, {id:string; name:string; icon:string}[]> = {
  SCHOLARSHIP: [
    { id:'sch_maths',   name:'Mathematics', icon:'🔢' },
    { id:'sch_sinhala', name:'Sinhala',     icon:'📖' },
    { id:'sch_english', name:'English',     icon:'🇬🇧' },
  ],
  GRADE_6_9: [
    { id:'ol_maths',   name:'Mathematics', icon:'🔢' },
    { id:'ol_science', name:'Science',     icon:'🔬' },
    { id:'ol_english', name:'English',     icon:'🇬🇧' },
    { id:'ol_sinhala', name:'Sinhala',     icon:'📖' },
    { id:'ol_tamil',   name:'Tamil',       icon:'✍️' },
    { id:'ol_history', name:'History',     icon:'📜' },
  ],
  OL: [
    { id:'ol_maths',       name:'Mathematics', icon:'🔢' },
    { id:'ol_science',     name:'Science',     icon:'🔬' },
    { id:'ol_english',     name:'English',     icon:'🇬🇧' },
    { id:'ol_sinhala',     name:'Sinhala',     icon:'📖' },
    { id:'ol_tamil',       name:'Tamil',       icon:'✍️' },
    { id:'ol_commerce',    name:'Commerce',    icon:'💼' },
    { id:'ol_accounting',  name:'Accounting',  icon:'🧾' },
    { id:'ol_ict',         name:'ICT',         icon:'💻' },
    { id:'ol_geography',   name:'Geography',   icon:'🌍' },
    { id:'ol_history',     name:'History',     icon:'📜' },
    { id:'ol_art',         name:'Art',         icon:'🎨' },
    { id:'ol_music',       name:'Music',       icon:'🎵' },
  ],
  AL_SCIENCE: [
    { id:'al_combmaths', name:'Combined Maths', icon:'📐' },
    { id:'al_physics',   name:'Physics',        icon:'⚡' },
    { id:'al_chemistry', name:'Chemistry',      icon:'🧪' },
    { id:'al_biology',   name:'Biology',        icon:'🔬' },
    { id:'al_ict_sci',   name:'ICT',            icon:'💻' },
  ],
  AL_COMMERCE: [
    { id:'al_accounting', name:'Accounting',       icon:'🧾' },
    { id:'al_business',   name:'Business Studies', icon:'💼' },
    { id:'al_economics',  name:'Economics',        icon:'📊' },
    { id:'al_ict_com',    name:'ICT',              icon:'💻' },
  ],
  AL_ARTS: [
    { id:'al_sinhala',   name:'Sinhala',           icon:'📖' },
    { id:'al_english',   name:'English',           icon:'🇬🇧' },
    { id:'al_geography', name:'Geography',         icon:'🌍' },
    { id:'al_history',   name:'History',           icon:'📜' },
    { id:'al_political', name:'Political Science', icon:'🏛️' },
    { id:'al_logic',     name:'Logic',             icon:'🧠' },
    { id:'al_media',     name:'Media Studies',     icon:'📺' },
  ],
  AL_TECHNOLOGY: [
    { id:'al_eng_tech', name:'Engineering Technology', icon:'⚙️' },
    { id:'al_sci_tech', name:'Science for Technology', icon:'🔧' },
    { id:'al_ict_tech', name:'ICT',                    icon:'💻' },
    { id:'al_biosys',   name:'Bio Systems Tech',       icon:'🌱' },
  ],
  REVISION: [
    { id:'al_combmaths', name:'Combined Maths', icon:'📐' },
    { id:'al_physics',   name:'Physics',        icon:'⚡' },
    { id:'al_chemistry', name:'Chemistry',      icon:'🧪' },
    { id:'ol_maths',     name:'O/L Maths',      icon:'🔢' },
    { id:'ol_science',   name:'O/L Science',    icon:'🔬' },
    { id:'ol_english',   name:'O/L English',    icon:'🇬🇧' },
  ],
  EXTRA: [
    { id:'ec_piano',    name:'Piano',    icon:'🎹' },
    { id:'ec_violin',   name:'Violin',   icon:'🎻' },
    { id:'ec_guitar',   name:'Guitar',   icon:'🎸' },
    { id:'ec_swimming', name:'Swimming', icon:'🏊' },
    { id:'ec_cricket',  name:'Cricket',  icon:'🏏' },
  ],
}

const MEDIUMS = [
  { id:'SINHALA', label:'Sinhala', flag:'🇱🇰' },
  { id:'TAMIL',   label:'Tamil',   flag:'📿' },
  { id:'ENGLISH', label:'English', flag:'🇬🇧' },
]

interface Props { initialSubject?: string; initialDistrict?: string }

export function TutorSearch({ initialSubject, initialDistrict }: Props) {
  const [step,     setStep]     = useState(1) // 1=level, 2=stream(AL only), 3=subject, 4=options
  const [level,    setLevel]    = useState('')
  const [stream,   setStream]   = useState('')
  const [subject,  setSubject]  = useState(initialSubject ?? '')
  const [district, setDistrict] = useState(initialDistrict ?? '')
  const [medium,   setMedium]   = useState('')
  const [verified, setVerified] = useState(false)
  const [trial,    setTrial]    = useState(false)
  const [result,   setResult]   = useState<SearchResult | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [page,     setPage]     = useState(1)

  function selectLevel(id: string) {
    setLevel(id)
    setStream('')
    setSubject('')
    if (id === 'AL') setStep(2)
    else setStep(3)
  }

  function selectStream(id: string) {
    setStream(id)
    setSubject('')
    setStep(3)
  }

  function selectSubject(id: string) {
    setSubject(id === subject ? '' : id)
    setStep(4)
  }

  function getSubjectKey() {
    if (level === 'AL' && stream) return `AL_${stream}`
    return level
  }

  function getSubjects() {
    return SUBJECTS_BY_LEVEL[getSubjectKey()] ?? []
  }

  async function search(p = 1) {
    setLoading(true)
    const params = new URLSearchParams()
    if (subject)  params.set('subject',  subject)
    if (district) params.set('district', district.toLowerCase())
    if (medium)   params.set('medium',   medium)
    if (verified) params.set('verified', 'true')
    if (trial)    params.set('trial',    'true')
    params.set('page', String(p))
    const res = await fetch(`/api/tutors?${params}`)
    const data = await res.json()
    setResult(data)
    setPage(p)
    setLoading(false)
  }

  function reset() {
    setLevel(''); setStream(''); setSubject('')
    setMedium(''); setDistrict(''); setVerified(false); setTrial(false)
    setResult(null); setStep(1)
  }

  const levelObj   = LEVELS.find(l => l.id === level)
  const streamObj  = STREAMS.find(s => s.id === stream)
  const subjectObj = getSubjects().find(s => s.id === subject)

  return (
    <div className="space-y-6">

      {/* Progress breadcrumb */}
      {level && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={reset} className="text-xs text-gray-400 hover:text-brand-600 transition-colors">All levels</button>
          {level && <><span className="text-gray-300">/</span><button onClick={() => { setStream(''); setSubject(''); setStep(level === 'AL' ? 2 : 3) }} className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelObj?.bg} ${levelObj?.text}`}>{levelObj?.icon} {levelObj?.label}</button></>}
          {stream && <><span className="text-gray-300">/</span><button onClick={() => { setSubject(''); setStep(3) }} className={`text-xs font-medium px-2 py-0.5 rounded-full ${streamObj?.bg} ${streamObj?.text}`}>{streamObj?.icon} {streamObj?.label}</button></>}
          {subjectObj && <><span className="text-gray-300">/</span><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{subjectObj.icon} {subjectObj.name}</span></>}
          <button onClick={reset} className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Reset</button>
        </div>
      )}

      {/* STEP 1 — Choose level */}
      {step >= 1 && (
        <div className={`transition-all duration-300 ${step > 1 ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${step === 1 ? 'bg-brand-400 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <h3 className="font-semibold text-gray-800">Choose your level</h3>
            {level && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelObj?.bg} ${levelObj?.text}`}>{levelObj?.icon} {levelObj?.label}</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {LEVELS.map(l => (
              <button key={l.id} onClick={() => selectLevel(l.id)}
                className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-center transition-all duration-200 hover:scale-105 active:scale-95
                  ${level === l.id ? `${l.border} shadow-lg ring-2 ring-offset-1 ${l.border.replace('border','ring')}` : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${l.color} opacity-0 group-hover:opacity-5 transition-opacity ${level === l.id ? 'opacity-5' : ''}`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center text-xl mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                  {l.icon}
                </div>
                <div className={`text-xs font-semibold ${level === l.id ? l.text : 'text-gray-700'}`}>{l.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{l.sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — A/L Stream (only for A/L) */}
      {level === 'AL' && step >= 2 && (
        <div className={`transition-all duration-300 animate-fade-in-up ${step > 2 ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${step === 2 ? 'bg-brand-400 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <h3 className="font-semibold text-gray-800">Choose your A/L stream</h3>
            {stream && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${streamObj?.bg} ${streamObj?.text}`}>{streamObj?.icon} {streamObj?.label}</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STREAMS.map(s => (
              <button key={s.id} onClick={() => selectStream(s.id)}
                className={`group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:scale-105 active:scale-95
                  ${stream === s.id ? `${s.border} shadow-lg` : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 ${stream === s.id ? 'opacity-5' : ''} transition-opacity`} />
                <div className={`text-3xl mb-3 group-hover:scale-110 transition-transform`}>{s.icon}</div>
                <div className={`font-bold text-sm mb-1 ${stream === s.id ? s.text : 'text-gray-800'}`}>{s.label}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — Subject */}
      {step >= 3 && getSubjects().length > 0 && (
        <div className={`transition-all duration-300 animate-fade-in-up ${step > 3 ? 'opacity-70' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${step === 3 ? 'bg-brand-400 text-white' : 'bg-gray-200 text-gray-500'}`}>{level === 'AL' ? '3' : '2'}</div>
            <h3 className="font-semibold text-gray-800">Choose a subject</h3>
            {subjectObj && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{subjectObj.icon} {subjectObj.name}</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {getSubjects().map(s => (
              <button key={s.id} onClick={() => selectSubject(s.id)}
                className={`group flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 hover:scale-102 active:scale-95
                  ${subject === s.id
                    ? 'border-brand-400 bg-brand-50 shadow-md ring-1 ring-brand-200'
                    : 'border-gray-100 bg-white hover:border-brand-200 hover:bg-brand-50/30 shadow-sm'}`}>
                <span className={`text-2xl group-hover:scale-110 transition-transform flex-shrink-0`}>{s.icon}</span>
                <span className={`text-sm font-medium leading-tight ${subject === s.id ? 'text-brand-700' : 'text-gray-700'}`}>{s.name}</span>
                {subject === s.id && <span className="ml-auto text-brand-400 flex-shrink-0">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 — Options + Search */}
      {step >= 4 && (
        <div className="animate-fade-in-up bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-brand-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {level === 'AL' ? '4' : '3'}
            </div>
            <h3 className="font-semibold text-gray-800">Refine your search</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Medium */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Medium of instruction</label>
              <div className="flex gap-2">
                {MEDIUMS.map(m => (
                  <button key={m.id} onClick={() => setMedium(medium === m.id ? '' : m.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-xl border-2 transition-all
                      ${medium === m.id ? 'border-brand-400 bg-brand-50 text-brand-700 font-medium' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}>
                    {m.flag} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* District */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Location</label>
              <select value={district} onChange={e => setDistrict(e.target.value)}
                className="w-full h-10 px-3 text-sm border-2 border-gray-100 rounded-xl bg-white focus:border-brand-400 focus:outline-none text-gray-600 hover:border-gray-200 transition-colors">
                <option value="">📍 Any district</option>
                {DISTRICTS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-3 mb-5">
            <button onClick={() => setVerified(!verified)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                ${verified ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${verified ? 'bg-brand-400 border-brand-400' : 'border-gray-300'}`}>
                {verified && <span className="text-white text-xs">✓</span>}
              </span>
              ✅ Verified tutors only
            </button>
            <button onClick={() => setTrial(!trial)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                ${trial ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${trial ? 'bg-brand-400 border-brand-400' : 'border-gray-300'}`}>
                {trial && <span className="text-white text-xs">✓</span>}
              </span>
              🎯 Trial class available
            </button>
          </div>

          <Button onClick={() => search(1)} disabled={loading} size="lg" className="w-full sm:w-auto px-10 shadow-md hover:shadow-lg">
            {loading
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Searching…</span>
              : '🔍 Find tutors'}
          </Button>
        </div>
      )}

      {/* Also show search button at step 3 for subjects without needing step 4 */}
      {step === 3 && subject && (
        <div className="flex justify-center animate-fade-in-up">
          <Button onClick={() => search(1)} disabled={loading} size="lg" className="px-10 shadow-md">
            {loading ? 'Searching…' : '🔍 Find tutors'}
          </Button>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 skeleton rounded" />
                <div className="h-3 skeleton rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{result.total}</span> tutor{result.total !== 1 ? 's' : ''} found
            </p>
            {result.total > 0 && <p className="text-xs text-gray-400">Sorted by best match</p>}
          </div>

          {result.tutors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-gray-700 mb-1">No tutors found</h3>
              <p className="text-sm text-gray-400 mb-4">Try different filters or subject selection</p>
              <Button variant="outline" onClick={reset}>Start over</Button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.tutors.map((t, i) => <TutorCard key={t.id} tutor={t} featured={i === 0} />)}
              </div>
              {result.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: result.pages }, (_, i) => (
                    <button key={i} onClick={() => search(i + 1)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-brand-400 text-white shadow-md' : 'border border-gray-200 hover:bg-gray-50 bg-white'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
