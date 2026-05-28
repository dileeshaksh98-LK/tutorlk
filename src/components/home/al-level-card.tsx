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

export function ALLevelCard() {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [selectedStream, setSelectedStream] = useState<typeof STREAMS[0] | null>(null)

  if (!expanded) {
    return (
      <div onClick={() => setExpanded(true)}
        className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 hover:shadow-lg transition-all duration-300 card-3d overflow-hidden cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-600 opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl" />
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform">🎓</div>
        <div className="font-bold text-gray-800 group-hover:text-brand-600 transition-colors">A/L</div>
        <div className="text-xs text-gray-400 mt-1">Grade 12–13 · 4 streams</div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {['🔬','💼','🎨','⚙️'].map(i => <span key={i} className="text-base">{i}</span>)}
        </div>
      </div>
    )
  }

  if (!selectedStream) {
    return (
      <div className="bg-white border-2 border-brand-200 rounded-2xl p-5 shadow-md col-span-1 animate-scale-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-lg">🎓</div>
            <div>
              <div className="font-bold text-sm text-gray-800">A/L Streams</div>
              <div className="text-xs text-gray-400">Choose your stream</div>
            </div>
          </div>
          <button onClick={() => { setExpanded(false); setSelectedStream(null) }}
            className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STREAMS.map(s => (
            <button key={s.id} onClick={() => setSelectedStream(s)}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 active:scale-95 ${s.bg} ${s.border}`}>
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className={`text-xs font-bold ${s.text}`}>{s.name}</div>
                <div className="text-xs text-gray-400">{s.subjects.length} subjects</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => router.push('/tutors?level=AL')}
          className="w-full text-center text-xs text-brand-600 hover:text-brand-700 font-medium mt-3 py-1">
          View all A/L tutors →
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white border-2 ${selectedStream.border} rounded-2xl p-5 shadow-md col-span-1 animate-scale-in`}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setSelectedStream(null)}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg ${selectedStream.bg} transition-colors`}>
          <span>←</span>
          <span className={`text-xs font-bold ${selectedStream.text}`}>{selectedStream.icon} {selectedStream.name}</span>
        </button>
        <button onClick={() => { setExpanded(false); setSelectedStream(null) }}
          className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded-lg hover:bg-gray-100">✕</button>
      </div>
      <div className="space-y-1.5">
        {selectedStream.subjects.map(sub => (
          <button key={sub.id}
            onClick={() => router.push(`/tutors?level=AL&stream=${selectedStream.id}&subject=${sub.id}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-left group">
            <span className="text-lg">{sub.icon}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700">{sub.name}</span>
            <span className="ml-auto text-gray-300 group-hover:text-brand-400">→</span>
          </button>
        ))}
      </div>
      <button onClick={() => router.push(`/tutors?level=AL&stream=${selectedStream.id}`)}
        className={`w-full text-center text-xs font-medium mt-3 py-1 ${selectedStream.text}`}>
        View all {selectedStream.name} tutors →
      </button>
    </div>
  )
}
