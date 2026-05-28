'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function TutorProfileEditPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [bio,           setBio]          = useState('')
  const [qualification, setQualification]= useState('')
  const [university,    setUniversity]   = useState('')
  const [hourlyRate,    setHourlyRate]   = useState('')
  const [trialClass,    setTrialClass]   = useState(false)
  const [loading,       setLoading]      = useState(false)
  const [saved,         setSaved]        = useState(false)

  useEffect(() => {
    fetch('/api/tutor/profile').then(r => r.json()).then(d => {
      if (d.profile) {
        setProfile(d.profile)
        setBio(d.profile.bio ?? '')
        setQualification(d.profile.qualification ?? '')
        setUniversity(d.profile.university ?? '')
        setHourlyRate(String(d.profile.hourlyRate))
        setTrialClass(d.profile.trialClass)
      }
    })
  }, [])

  async function handleSave() {
    setLoading(true)
    const res = await fetch('/api/tutor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, qualification, university, hourlyRate: parseInt(hourlyRate), trialClass }),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-brand-900 text-white py-8">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <Button onClick={() => router.push('/tutor/dashboard')} className="bg-white/10 border border-white/20 text-white hover:bg-white/20" size="sm">← Dashboard</Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">✓ Profile saved successfully</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900">Public profile</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">About yourself</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hourly rate (LKR)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">LKR</span>
              <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} className="border-2 border-gray-200 focus:border-brand-400 rounded-xl h-11 pl-14" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <input type="checkbox" id="trial" checked={trialClass} onChange={e => setTrialClass(e.target.checked)} className="w-5 h-5 accent-brand-400" />
            <div>
              <label htmlFor="trial" className="text-sm font-semibold text-gray-700 cursor-pointer">Offer a free trial class</label>
              <p className="text-xs text-gray-400 mt-0.5">Increases booking rate significantly</p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
          {loading ? 'Saving…' : '💾 Save profile'}
        </Button>
      </div>
    </div>
  )
}
