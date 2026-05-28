'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STREAMS = [
  { id: 'SCIENCE',    name: 'Science',    icon: '🔬', color: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',
    subjects: [
      { id: 'al_combmaths', name: 'Combined Maths', icon: '📐' },
      { id: 'al_physics',   name: 'Physics',        icon: '⚡' },
      { id: 'al_chemistry', name: 'Chemistry',      icon: '🧪' },
      { id: 'al_biology',   name: 'Biology',        icon: '🔬' },
      { id: 'al_ict_sci',   name: 'ICT',            icon: '💻' },
    ]
  },
  { id: 'COMMERCE',   name: 'Commerce',   icon: '💼', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',
    subjects: [
      { id: 'al_accounting', name: 'Accounting',       icon: '🧾' },
      { id: 'al_business',   name: 'Business Studies', icon: '💼' },
      { id: 'al_economics',  name: 'Economics',        icon: '📊' },
      { id: 'al_ict_com',    name: 'ICT',              icon: '💻' },
    ]
  },
  { id: 'ARTS',       name: 'Arts',       icon: '🎨', color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200',
    subjects: [
      { id: 'al_sinhala',   name: 'Sinhala',           icon: '📖' },
      { id: 'al_english',   name: 'English',           icon: '🇬🇧' },
      { id: 'al_geography', name: 'Geography',         icon: '🌍' },
      { id: 'al_history',   name: 'History',           icon: '📜' },
      { id: 'al_political', name: 'Political Science', icon: '🏛️' },
      { id: 'al_logic',     name: 'Logic',             icon: '🧠' },
    ]
  },
  { id: 'TECHNOLOGY', name: 'Technology', icon: '⚙️', color: 'from-orange-500 to-amber-500',  bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
    subjects: [
      { id: 'al_eng_tech', name: 'Engineering Tech',   icon: '⚙️' },
      { id: 'al_sci_tech', name: 'Science for Tech',   icon: '🔧' },
      { id: 'al_ict_tech', name: 'ICT',                icon: '💻' },
      { id: 'al_biosys',   name: 'Bio Systems Tech',   icon: '🌱' },
    ]
  },
]

type Step = 'level' | 'stream' | 'subject'

export function ALLevelCard() {
  const router = useRouter()
  const [step,        setStep]        = useState<Step>('level')
  const [selectedStream, setSelectedStream] = useState<typeof STREAMS[0] | null>(null)

  function handleStreamClick(stream: typeof STREAMS[0]) {
    setSelectedStream(stream)
    setStep('subject')
  }

  function handleSubjectClick(subjectId: string) {
    router.push(`/tutors?level=AL&stream=${selectedStream?.id}&subject=${subjectId}`)
  }

  function handleViewAll() {
    if (step === 'subject' && selectedStream) {
      router.push(`/tutors?level=AL&stream=${selectedStream.id}`)
    } else {
      router.push('/tutors?level=AL')
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 col-span-1 sm:col-span-1">

      {/* Header — always shown */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl shadow-sm">🎓</div>
        <div>
          <div className="font-bold text-gray-800">A/L</div>
          <div className="text-xs text-gray-400">Grade 12–13 · 4 streams</div>
        </div>
        {step !== 'level' && (
          <button onClick={() => { setStep('level'); setSelectedStream(null) }}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ✕ Reset
          </button>
        )}
      </div>

      {/* Step: choose stream */}
      {step === 'level' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-3">Choose your stream to see subjects</p>
          <div className="grid grid-cols-2 gap-2">
            {STREAMS.map(s => (
              <button key={s.id} onClick={() => handleStreamClick(s)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 active:scale-95 ${s.bg} ${s.border}`}>
                <span className="text-lg">{s.icon}</span>
                <span className={`text-xs font-semibold ${s.text}`}>{s.name}</span>
                <span className={`ml-auto text-xs ${s.text} opacity-50`}>→</span>
              </button>
            ))}
          </div>
          <button onClick={handleViewAll} className="w-full text-center text-xs text-brand-600 hover:text-brand-700 font-medium mt-2 py-1">
            View all A/L tutors →
          </button>
        </div>
      )}

      {/* Step: choose subject */}
      {step === 'subject' && selectedStream && (
        <div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${selectedStream.bg} ${selectedStream.border} border mb-3`}>
            <span className="text-base">{selectedStream.icon}</span>
            <span className={`text-xs font-bold ${selectedStream.text}`}>{selectedStream.name} Stream</span>
            <button onClick={() => setStep('level')} className={`ml-auto text-xs ${selectedStream.text} opacity-60 hover:opacity-100`}>← Back</button>
          </div>
          <div className="space-y-1.5">
            {selectedStream.subjects.map(sub => (
              <button key={sub.id} onClick={() => handleSubjectClick(sub.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-left group">
                <span className="text-lg">{sub.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700">{sub.name}</span>
                <span className="ml-auto text-gray-300 group-hover:text-brand-400 text-sm">→</span>
              </button>
            ))}
          </div>
          <button onClick={handleViewAll} className="w-full text-center text-xs text-brand-600 hover:text-brand-700 font-medium mt-3 py-1">
            View all {selectedStream.name} tutors →
          </button>
        </div>
      )}
    </div>
  )
}
