'use client'
import { useState, useEffect } from 'react'
import { TutorCard } from './tutor-card'
import { Button } from '@/components/ui/button'
import type { TutorCard as TutorCardType, SearchResult } from '@/types'

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Combined Maths','ICT','Economics','Piano','Violin','Swimming','Sinhala','Tamil']
const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota','Jaffna','Kilinochchi','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla','Ratnapura','Kegalle','Trincomalee','Batticaloa','Ampara','Vavuniya','Mannar','Mullaitivu','Monaragala']

interface Props { initialSubject?: string; initialDistrict?: string }

export function TutorSearch({ initialSubject, initialDistrict }: Props) {
  const [subject,  setSubject]  = useState(initialSubject ?? '')
  const [district, setDistrict] = useState(initialDistrict ?? '')
  const [grade,    setGrade]    = useState('')
  const [verified, setVerified] = useState(false)
  const [trial,    setTrial]    = useState(false)
  const [online,   setOnline]   = useState(false)
  const [result,   setResult]   = useState<SearchResult | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [page,     setPage]     = useState(1)

  async function search(p = 1) {
    setLoading(true)
    const params = new URLSearchParams()
    if (subject)  params.set('subject',  subject.toLowerCase().replace(/\s+/g, '-'))
    if (district) params.set('district', district.toLowerCase())
    if (grade)    params.set('grade',    grade)
    if (verified) params.set('verified', 'true')
    if (trial)    params.set('trial',    'true')
    if (online)   params.set('mode',     'ONLINE')
    params.set('page', String(p))
    const res = await fetch(`/api/tutors?${params}`)
    const data = await res.json()
    setResult(data)
    setPage(p)
    setLoading(false)
  }

  useEffect(() => { search() }, [])

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">What subject do you need help with?</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s === subject ? '' : s)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${subject === s ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 hover:border-brand-400 text-gray-600'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <select value={grade} onChange={e => setGrade(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-400 focus:outline-none">
            <option value="">Any grade</option>
            <option value="A/L">A/L (Grade 12–13)</option>
            <option value="O/L">O/L (Grade 10–11)</option>
            <option value="Grade 6-9">Grade 6–9</option>
            <option value="Primary">Primary (1–5)</option>
          </select>
          <select value={district} onChange={e => setDistrict(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-400 focus:outline-none">
            <option value="">Any district</option>
            {DISTRICTS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
          </select>
          <div className="flex items-center gap-2 h-10">
            <input type="checkbox" id="verified" checked={verified} onChange={e => setVerified(e.target.checked)} className="accent-brand-400 w-4 h-4" />
            <label htmlFor="verified" className="text-sm text-gray-600">Verified</label>
          </div>
          <div className="flex items-center gap-2 h-10">
            <input type="checkbox" id="trial" checked={trial} onChange={e => setTrial(e.target.checked)} className="accent-brand-400 w-4 h-4" />
            <label htmlFor="trial" className="text-sm text-gray-600">Trial class</label>
          </div>
        </div>

        <Button onClick={() => search(1)} disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Searching…' : 'Search tutors'}
        </Button>
      </div>

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
        </>
      )}
    </div>
  )
}
