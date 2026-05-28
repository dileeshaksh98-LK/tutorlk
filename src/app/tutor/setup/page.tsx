'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota','Jaffna','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla','Ratnapura','Kegalle','Trincomalee','Batticaloa','Ampara','Vavuniya','Monaragala']

const ALL_SUBJECTS = [
  { id:'al_combmaths', name:'Combined Maths', stream:'A/L Science' },
  { id:'al_physics',   name:'Physics',        stream:'A/L Science' },
  { id:'al_chemistry', name:'Chemistry',      stream:'A/L Science' },
  { id:'al_biology',   name:'Biology',        stream:'A/L Science' },
  { id:'al_accounting',name:'Accounting',     stream:'A/L Commerce' },
  { id:'al_business',  name:'Business Studies',stream:'A/L Commerce' },
  { id:'al_economics', name:'Economics',      stream:'A/L Commerce' },
  { id:'al_sinhala',   name:'Sinhala (A/L)',  stream:'A/L Arts' },
  { id:'al_english',   name:'English (A/L)',  stream:'A/L Arts' },
  { id:'al_eng_tech',  name:'Engineering Technology', stream:'A/L Technology' },
  { id:'ol_maths',     name:'Mathematics (O/L)', stream:'O/L' },
  { id:'ol_science',   name:'Science (O/L)',  stream:'O/L' },
  { id:'ol_english',   name:'English (O/L)',  stream:'O/L' },
  { id:'ol_sinhala',   name:'Sinhala (O/L)',  stream:'O/L' },
  { id:'ec_piano',     name:'Piano',          stream:'Music' },
  { id:'ec_swimming',  name:'Swimming',       stream:'Sports' },
]

const STEPS = ['Personal info','Subjects & streams','Location & modes','Rates & schedule','Preview']

export default function TutorSetupPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [bio,          setBio]          = useState('')
  const [qualification,setQualification]= useState('')
  const [university,   setUniversity]   = useState('')
  const [experience,   setExperience]   = useState('1')
  const [subjects,     setSubjects]     = useState<string[]>([])
  const [grade,        setGrade]        = useState('A/L')
  const [mediums,      setMediums]      = useState<string[]>(['SINHALA'])
  const [districts,    setDistricts]    = useState<string[]>([])
  const [modes,        setModes]        = useState<string[]>(['ONLINE'])
  const [hourlyRate,   setHourlyRate]   = useState('1500')
  const [trialClass,   setTrialClass]   = useState(true)
  const [travelRadius, setTravelRadius] = useState('10')

  function toggleItem<T>(arr: T[], item: T, setArr: (v: T[]) => void) {
    setArr(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tutor/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, qualification, university, experience: parseInt(experience), subjects, grade, mediums, districts, modes, hourlyRate: parseInt(hourlyRate), trialClass, travelRadius: parseInt(travelRadius) }),
      })
      if (res.ok) router.push('/tutor/dashboard')
      else { const d = await res.json(); setError(d.error || 'Setup failed') }
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  const STEP_CONTENT = [
    // Step 0 — Personal info
    <div key="0" className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">About yourself <span className="text-gray-400 font-normal">(shown to students)</span></label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Describe your teaching style, experience and results..." className="w-full px-4 py-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl resize-none focus:outline-none" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qualification</label>
          <Input value={qualification} onChange={e => setQualification(e.target.value)} placeholder="e.g. BSc (Hons) Mathematics" className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">University / Institution</label>
          <Input value={university} onChange={e => setUniversity(e.target.value)} placeholder="e.g. University of Kelaniya" className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of teaching experience</label>
        <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full h-11 px-3 text-sm border-2 border-gray-200 focus:border-brand-400 rounded-xl focus:outline-none">
          {Array.from({length:20},(_,i)=>i+1).map(n => <option key={n} value={n}>{n} year{n>1?'s':''}</option>)}
        </select>
      </div>
    </div>,

    // Step 1 — Subjects
    <div key="1" className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Select subjects you teach</label>
        {['A/L Science','A/L Commerce','A/L Arts','A/L Technology','O/L','Music','Sports'].map(stream => (
          <div key={stream} className="mb-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{stream}</div>
            <div className="flex flex-wrap gap-2">
              {ALL_SUBJECTS.filter(s => s.stream === stream).map(s => (
                <button key={s.id} onClick={() => toggleItem(subjects, s.id, setSubjects)}
                  className={`px-3 py-2 text-sm rounded-xl border-2 transition-all ${subjects.includes(s.id) ? 'border-brand-400 bg-brand-50 text-brand-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Teaching mediums</label>
        <div className="flex gap-3">
          {[{id:'SINHALA',label:'🇱🇰 Sinhala'},{id:'TAMIL',label:'📿 Tamil'},{id:'ENGLISH',label:'🇬🇧 English'}].map(m => (
            <button key={m.id} onClick={() => toggleItem(mediums, m.id, setMediums)}
              className={`flex-1 py-2.5 text-sm rounded-xl border-2 font-medium transition-all ${mediums.includes(m.id) ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 2 — Location
    <div key="2" className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Session modes</label>
        <div className="grid grid-cols-3 gap-3">
          {[{id:'ONLINE',label:'💻 Online',desc:'Island-wide'},{id:'HOME_VISIT',label:'🏠 Home visit',desc:'You go to student'},{id:'TUITION_CENTRE',label:'🏫 Centre',desc:'Fixed location'}].map(m => (
            <button key={m.id} onClick={() => toggleItem(modes, m.id, setModes)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${modes.includes(m.id) ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="text-base mb-1">{m.label}</div>
              <div className="text-xs text-gray-400">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Teaching districts <span className="text-gray-400 font-normal">(select all that apply)</span></label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {DISTRICTS.map(d => (
            <button key={d} onClick={() => toggleItem(districts, d.toLowerCase(), setDistricts)}
              className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${districts.includes(d.toLowerCase()) ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
      {modes.includes('HOME_VISIT') && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Home visit radius: <span className="text-brand-600">{travelRadius} km</span></label>
          <input type="range" min="2" max="50" value={travelRadius} onChange={e => setTravelRadius(e.target.value)} className="w-full accent-brand-400" />
        </div>
      )}
    </div>,

    // Step 3 — Rates
    <div key="3" className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hourly rate (LKR)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">LKR</span>
          <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} min="500" max="20000" className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11 pl-14" />
        </div>
        <div className="flex gap-2 mt-2">
          {[1000,1500,2000,2500,3000].map(r => (
            <button key={r} onClick={() => setHourlyRate(String(r))}
              className={`px-3 py-1 text-xs rounded-lg border transition-all ${hourlyRate === String(r) ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {r.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <input type="checkbox" id="trial" checked={trialClass} onChange={e => setTrialClass(e.target.checked)} className="w-5 h-5 accent-brand-400 rounded" />
        <div>
          <label htmlFor="trial" className="text-sm font-semibold text-gray-700 cursor-pointer">Offer a free trial class</label>
          <p className="text-xs text-gray-400 mt-0.5">Students can try one free session before committing. This increases bookings significantly.</p>
        </div>
      </div>
    </div>,

    // Step 4 — Preview
    <div key="4" className="space-y-4">
      <div className="bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100 rounded-2xl p-5">
        <div className="font-bold text-gray-900 mb-3">Your profile preview</div>
        <div className="space-y-2 text-sm">
          {[
            { label:'Bio',        value: bio || 'Not set' },
            { label:'Qualification', value: qualification || 'Not set' },
            { label:'University', value: university || 'Not set' },
            { label:'Experience', value: `${experience} years` },
            { label:'Subjects',   value: subjects.length > 0 ? `${subjects.length} subjects selected` : 'None selected' },
            { label:'Mediums',    value: mediums.join(', ') || 'None' },
            { label:'Modes',      value: modes.join(', ') || 'None' },
            { label:'Rate',       value: `LKR ${parseInt(hourlyRate).toLocaleString()}/hr` },
            { label:'Trial class',value: trialClass ? 'Yes — free first session' : 'No' },
          ].map(item => (
            <div key={item.label} className="flex gap-3">
              <span className="text-gray-400 w-28 flex-shrink-0">{item.label}</span>
              <span className="text-gray-800 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}
      <p className="text-xs text-gray-400 text-center">Your profile will be reviewed by our team. Verification takes 24–48 hours.</p>
    </div>
  ]

  const canProceed = [
    bio.length > 20 && qualification.length > 2,
    subjects.length > 0 && mediums.length > 0,
    modes.length > 0,
    parseInt(hourlyRate) >= 500,
    true,
  ][step]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-brand-900 text-white py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-1">Set up your tutor profile</h1>
          <p className="text-gray-400 text-sm">Complete your profile to start receiving bookings</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress steps */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center ${i > 0 ? 'ml-2' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-brand-400 text-white' : i === step ? 'bg-brand-400 text-white ring-4 ring-brand-100' : 'bg-gray-200 text-gray-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i === step ? 'text-brand-600 font-medium' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-brand-400' : 'bg-gray-200'}`} style={{width:'40px'}} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-5">{STEPS[step]}</h2>
          {STEP_CONTENT[step]}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">← Back</Button>}
          {step < STEPS.length - 1
            ? <Button onClick={() => setStep(step + 1)} disabled={!canProceed} className="flex-1">Next →</Button>
            : <Button onClick={handleSubmit} disabled={loading || !canProceed} className="flex-1 bg-brand-500">
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span> : '🚀 Create my profile'}
              </Button>
          }
        </div>
      </div>
    </div>
  )
}
