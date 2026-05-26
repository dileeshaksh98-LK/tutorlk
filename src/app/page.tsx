import Link from 'next/link'
import { Button } from '@/components/ui/button'

const SUBJECTS = [
  { name: 'Combined Maths', icon: '📐', slug: 'combined-maths' },
  { name: 'Physics',        icon: '⚡', slug: 'physics' },
  { name: 'Chemistry',      icon: '🧪', slug: 'chemistry' },
  { name: 'English',        icon: '📚', slug: 'english' },
  { name: 'Piano',          icon: '🎹', slug: 'piano' },
  { name: 'ICT',            icon: '💻', slug: 'ict' },
  { name: 'Biology',        icon: '🔬', slug: 'biology' },
  { name: 'Economics',      icon: '📊', slug: 'economics' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Search by subject', desc: 'Pick your subject and district. Browse verified tutors with real reviews.' },
  { step: '2', title: 'Book a session',    desc: 'Choose a time slot, select online or home visit, pay securely via PayHere.' },
  { step: '3', title: 'Start learning',    desc: 'Join your session, receive notes, attempt model papers and get tutor feedback.' },
]

const STATS = [
  { value: '500+', label: 'Verified tutors' },
  { value: '25',   label: 'Districts covered' },
  { value: '10k+', label: 'Sessions completed' },
  { value: '4.8★', label: 'Average rating' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-block bg-brand-50 text-brand-600 text-sm px-3 py-1 rounded-full mb-4 font-medium">
            Sri Lanka's #1 tutor marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Find your perfect tutor,<br />island-wide
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Verified private tutors for O/L, A/L, music, sports and more. Book online or home visit. Pay securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tutors">
              <Button size="lg" className="w-full sm:w-auto">Find a tutor</Button>
            </Link>
            <Link href="/register?role=TUTOR">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Become a tutor</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-400 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-brand-100 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse subjects */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-2">Browse by subject</h2>
        <p className="text-gray-500 mb-7">Find specialist tutors for every A/L, O/L and extra-curricular subject</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SUBJECTS.map(s => (
            <Link key={s.slug} href={`/tutors?subject=${s.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-brand-400 hover:shadow-sm transition-all group">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-brand-600">{s.name}</div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/tutors"><Button variant="outline">View all subjects</Button></Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-2 text-center">How TutorLK works</h2>
          <p className="text-gray-500 text-center mb-10">Get started in minutes</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(h => (
              <div key={h.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 font-bold text-lg flex items-center justify-center mx-auto mb-4">{h.step}</div>
                <h3 className="font-semibold mb-2">{h.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to start learning?</h2>
        <p className="text-gray-500 mb-6">Join thousands of Sri Lankan students already using TutorLK</p>
        <Link href="/tutors"><Button size="lg">Find a tutor now</Button></Link>
      </section>
    </>
  )
}
