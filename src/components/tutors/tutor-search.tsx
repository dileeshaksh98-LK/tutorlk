'use client'
import { useState, useEffect } from 'react'
import { TutorCard } from './tutor-card'
import { Button } from '@/components/ui/button'
import { EDUCATION_LEVELS, AL_STREAMS, MEDIUMS, ALL_SUBJECTS } from '@/lib/curriculum'
import type { TutorCard as TutorCardType, SearchResult } from '@/types'

const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota','Jaffna','Kilinochchi','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla','Ratnapura','Kegalle','Trincomalee','Batticaloa','Ampara','Vavuniya','Mannar','Mullaitivu','Monaragala']

interface Props { initialSubject?: string; initialDistrict?: string }

export function TutorSearch({ initialSubject, initialDistrict }: Props) {
  const [level,    setLevel]    = useState('')
  const [stream,   setStream]   = useState('')
  const [medium,   setMedium]   = useState('')
  const [subject,  setSubject]  = useState(initialSubject ?? '')
  const [district, setDistrict] = useState(initialDistrict ?? '')
  const [verified, setVerified] = useState(false)
  const [trial,    setTrial]    = useState(false)
  const [result,   setResult]   = useState<SearchResult | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [page,     setPage]     = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  async function search(p = 1) {
    setLoading(true)
    const params = new URLSearchParams()
    if (subject)  params.set('subject',  subject)
    if (district) params.set('district', district.toLowerCase())
    if (level)    params.set('level',    level)
    if (stream)   params.set('stream',   stream)
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

  useEffect(() => { search() }, [])

  // Get subjects based on selected level/stream
  function getSubjectOptions() {
    if (!level) return ALL_SUBJECTS
    return ALL_SUBJECTS.filter(s => {
      if (!s.level.includes(level as any)) return false
      if (stream && s.stream && !s.stream.includes(stream as any)) return false
      return true
    })
  }

  return (
    <div>
      {/* Main search bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">

        {/* Level tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => { setLevel(''); setStream(''); setSubject('') }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${!level ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            All levels
          </button>
          {EDUCATION_LEVELS.map(l => (
            <button key={l.id} onClick={() => { setLevel(l.id); setStream(''); setSubject('') }}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-all ${level === l.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {l.icon} {l.name}
            </button>
          ))}
        </div>

        {/* A/L Stream selector */}
        {level === 'AL' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {Object.values(AL_STREAMS).map(s => (
              <button key={s.id} onClick={() => { setStream(stream === s.id ? '' : s.id); setSubject('') }}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-all ${stream === s.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-400'}`}>
                <span className="text-lg">{s.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-xs">{s.name.replace(' Stream', '')}</div>
                  <div className="text-xs text-gray-400 truncate">{s.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Subject pills */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">
            {level ? `Subjects — ${EDUCATION_LEVELS.find(l => l.id === level)?.name}` : 'Popular subjects'}
          </div>
          <div className="flex flex-wrap gap-2">
            {getSubjectOptions().slice(0, 16).map(s => (
              <button key={s.id} onClick={() => setSubject(subject === s.id ? '' : s.id)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-all ${subject === s.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-400'}`}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Medium + District row */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-2">
            {MEDIUMS.map(m => (
              <button key={m.id} onClick={() => setMedium(medium === m.id ? '' : m.id)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-all ${medium === m.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {m.icon} {m.name.replace(' Medium', '')}
              </button>
            ))}
          </div>
          <select value={district} onChange={e => setDistrict(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-400 focus:outline-none text-gray-600">
            <option value="">Any district</option>
            {DISTRICTS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
          </select>
        </div>

        {/* Filter toggles */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} className="accent-brand-400 w-4 h-4" />
            ✅ Verified tutors only
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={trial} onChange={e => setTrial(e.target.checked)} className="accent-brand-400 w-4 h-4" />
            🎯 Trial class available
          </label>
        </div>

        <Button onClick={() => search(1)} disabled={loading} className="w-full sm:w-auto px-8">
          {loading ? 'Searching…' : '🔍 Find tutors'}
        </Button>
      </div>

      {/* Active filters summary */}
      {(subject || level || stream || medium || district) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {level && <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-2 py-1 rounded-full">{EDUCATION_LEVELS.find(l => l.id === level)?.name}</span>}
          {stream && <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-2 py-1 rounded-full">{AL_STREAMS[stream as keyof typeof AL_STREAMS]?.name}</span>}
          {subject && <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-2 py-1 rounded-full">{ALL_SUBJECTS.find(s => s.id === subject)?.name}</span>}
          {medium && <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-2 py-1 rounded-full">{MEDIUMS.find(m => m.id === medium)?.name}</span>}
          {district && <span className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-2 py-1 rounded-full capitalize">{district}</span>}
          <button onClick={() => { setLevel(''); setStream(''); setSubject(''); setMedium(''); setDistrict(''); search(1) }}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">✕ Clear all</button>
        </div>
      )}

      {result && (
        <>
          <p className="text-sm text-gray-500 mb-4">{result.total} tutor{result.total !== 1 ? 's' : ''} found</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {result.tutors.map((t, i) => <TutorCard key={t.id} tutor={t} featured={i === 0} />)}
          </div>
          {result.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: result.pages }, (_, i) => (
                <button key={i} onClick={() => search(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-brand-400 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
          {result.tutors.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-medium text-gray-600 mb-1">No tutors found</div>
              <div className="text-sm">Try changing your filters or subject selection</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
