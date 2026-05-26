import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How TutorLK works — Sri Lanka tutor marketplace',
  description: 'Learn how to find and book a verified tutor on TutorLK. Safe payments, escrow protection and quality guarantee.',
}

const STEPS_STUDENT = [
  { step: '01', title: 'Search for a tutor', desc: 'Use filters to find tutors by subject, district, grade level and budget. Read verified reviews from real students.' },
  { step: '02', title: 'Book a session',      desc: 'Pick a time slot, choose online or home visit, and pay securely via PayHere. Your payment is held in escrow until the session is complete.' },
  { step: '03', title: 'Attend your session', desc: 'Join via Zoom for online sessions, or your tutor comes to you for home visits. Chat directly through the platform.' },
  { step: '04', title: 'Review and grow',     desc: 'After each session, complete assigned model papers, get tutor feedback, and track your score improvements over time.' },
]

const STEPS_TUTOR = [
  { step: '01', title: 'Create your profile', desc: 'Add your qualifications, subjects, rates and availability. Upload your ID and degree certificate for verification.' },
  { step: '02', title: 'Get verified',        desc: 'Our team reviews your documents within 24–48 hours. Verified tutors appear higher in search results.' },
  { step: '03', title: 'Receive bookings',    desc: 'Students book and pay upfront. You accept or decline each booking. No chasing payments — ever.' },
  { step: '04', title: 'Get paid monthly',    desc: 'Earnings accumulate in your dashboard. Monthly payouts via bank transfer or eZ Cash. 5% platform fee only.' },
]

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">How TutorLK works</h1>
        <p className="text-gray-500">Safe, simple and transparent — for students and tutors</p>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">👤 For students</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {STEPS_STUDENT.map(s => (
            <div key={s.step} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="text-3xl font-bold text-brand-100 mb-3">{s.step}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/tutors"><Button>Find a tutor</Button></Link>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">📚 For tutors</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {STEPS_TUTOR.map(s => (
            <div key={s.step} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="text-3xl font-bold text-brand-100 mb-3">{s.step}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/register?role=TUTOR"><Button>Become a tutor</Button></Link>
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Payment protection</h2>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          All payments are held in escrow and only released to the tutor 24 hours after the session is confirmed complete. If there's a dispute, our team reviews and resolves it fairly. You are always protected.
        </p>
      </div>
    </div>
  )
}
