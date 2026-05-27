'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  EDUCATION_LEVELS, AL_STREAMS, MEDIUMS,
  OL_CORE_SUBJECTS, OL_BASKET_SUBJECTS,
  AL_SCIENCE_SUBJECTS, AL_COMMERCE_SUBJECTS,
  AL_ARTS_SUBJECTS, AL_TECH_SUBJECTS,
  SCHOLARSHIP_SUBJECTS, EXTRACURRICULAR_SUBJECTS,
  type EducationLevel, type ALStream, type Medium
} from '@/lib/curriculum'

interface Props {
  onSelect: (subject: string, level: string, stream: string, medium: string) => void
  selectedSubject?: string
  selectedLevel?: string
  selectedStream?: string
  selectedMedium?: string
}

export function SubjectSelector({ onSelect, selectedSubject, selectedLevel, selectedStream, selectedMedium }: Props) {
  const [level, setLevel] = useState<EducationLevel | ''>(selectedLevel as EducationLevel || '')
  const [stream, setStream] = useState<ALStream | ''>(selectedStream as ALStream || '')
  const [medium, setMedium] = useState<Medium | ''>(selectedMedium as Medium || '')
  const [subject, setSubject] = useState(selectedSubject || '')

  function getSubjects() {
    if (level === 'SCHOLARSHIP') return SCHOLARSHIP_SUBJECTS
    if (level === 'GRADE_6_9') return [...OL_CORE_SUBJECTS.filter(s => s.level.includes('GRADE_6_9'))]
    if (level === 'OL') return [...OL_CORE_SUBJECTS, ...OL_BASKET_SUBJECTS]
    if (level === 'AL') {
      if (stream === 'SCIENCE') return AL_SCIENCE_SUBJECTS
      if (stream === 'COMMERCE') return AL_COMMERCE_SUBJECTS
      if (stream === 'ARTS') return AL_ARTS_SUBJECTS
      if (stream === 'TECHNOLOGY') return AL_TECH_SUBJECTS
      return [...AL_SCIENCE_SUBJECTS, ...AL_COMMERCE_SUBJECTS, ...AL_ARTS_SUBJECTS, ...AL_TECH_SUBJECTS]
    }
    return [...OL_CORE_SUBJECTS, ...AL_SCIENCE_SUBJECTS, ...EXTRACURRICULAR_SUBJECTS]
  }

  function handleSelect(subjectId: string) {
    setSubject(subjectId)
    onSelect(subjectId, level, stream, medium)
  }

  const subjects = getSubjects()

  return (
    <div className="space-y-4">
      {/* Education Level */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Education level</div>
        <div className="flex flex-wrap gap-2">
          {EDUCATION_LEVELS.map(l => (
            <button key={l.id} onClick={() => { setLevel(l.id as EducationLevel); setStream(''); setSubject('') }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-all ${level === l.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 hover:border-brand-400 text-gray-600'}`}>
              <span>{l.icon}</span> {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stream selector for A/L */}
      {level === 'AL' && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">A/L Stream</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(AL_STREAMS).map(s => (
              <button key={s.id} onClick={() => { setStream(s.id as ALStream); setSubject('') }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${stream === s.id ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-400'}`}>
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-medium text-gray-700">{s.name}</span>
                <span className="text-xs text-gray-400">{s.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Medium */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Medium of instruction</div>
        <div className="flex gap-2 flex-wrap">
          {MEDIUMS.map(m => (
            <button key={m.id} onClick={() => setMedium(m.id as Medium)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-all ${medium === m.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 hover:border-brand-400 text-gray-600'}`}>
              <span>{m.icon}</span> {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subject grid */}
      {(level || true) && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Subject {level && stream ? `— ${AL_STREAMS[stream as ALStream]?.name ?? ''}` : ''}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {subjects.map(s => (
              <button key={s.id} onClick={() => handleSelect(s.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl border transition-all text-left ${subject === s.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 hover:border-brand-400 text-gray-700'}`}>
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <span className="leading-tight">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
