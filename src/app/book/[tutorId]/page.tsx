'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { formatCurrency, getPlatformFee } from '@/lib/utils'

const DURATIONS = [
  { mins: 60,  label: '1 hour' },
  { mins: 90,  label: '1.5 hours' },
  { mins: 120, label: '2 hours' },
]

export default function BookPage({ params }: { params: { tutorId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [tutor, setTutor] = useState<any>(null)
  const [mode, setMode] = useState('ONLINE')
  const [duration, setDuration] = useState(60)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/tutors/${params.tutorId}`).then(r => r.json()).then(d => setTutor(d.tutor))
  }, [params.tutorId])

  if (!tutor) return <div className="max-w-lg mx-auto px-4 py-20 text-center text-gray-400">Loading…</div>

  const total       = Math.round((tutor.hourlyRate * duration) / 60)
  const platformFee = getPlatformFee(total)
  const finalTotal  = total + platformFee

  async function handleBook() {
    if (!session) { router.push('/login'); return }
    if (!date || !time) { setError('Please select a date and time'); return }
    setLoading(true)
    setError('')
    const scheduledAt = new Date(`${date}T${time}`).toISOString()
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorProfileId: params.tutorId, sessionMode: mode, durationMins: duration, scheduledAt, notes }),
    })
    if (res.ok) {
      const d = await res.json()
      router.push(`/student/bookings/${d.booking.id}/pay`)
    } else {
      setError('Booking failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Book a session</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={tutor.name ?? 'T'} image={tutor.image} size="lg" />
          <div>
            <div className="font-medium">{tutor.name}</div>
            <div className="text-sm text-gray-500">{formatCurrency(tutor.hourlyRate)}/hr</div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Session type</label>
            <div className="flex gap-2">
              {['ONLINE', 'HOME_VISIT'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 text-sm rounded-xl border transition-all ${mode === m ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                  {m === 'ONLINE' ? '💻 Online' : '🏠 Home visit'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d.mins} onClick={() => setDuration(d.mins)}
                  className={`flex-1 py-2.5 text-sm rounded-xl border transition-all ${duration === d.mins ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes for tutor <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Topics to focus on, current level, etc."
              className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-brand-400 focus:outline-none" />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Session ({duration} min)</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Platform fee (5%)</span><span>{formatCurrency(platformFee)}</span></div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-200"><span>Total</span><span className="text-brand-600">{formatCurrency(finalTotal)}</span></div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

          <Button onClick={handleBook} disabled={loading} className="w-full" size="lg">
            {loading ? 'Booking…' : `Confirm & pay ${formatCurrency(finalTotal)}`}
          </Button>
          <p className="text-xs text-gray-400 text-center">Funds held in escrow. Released to tutor 24 hrs after session completes.</p>
        </div>
      </div>
    </div>
  )
}
