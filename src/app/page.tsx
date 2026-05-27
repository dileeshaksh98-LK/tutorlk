import Link from 'next/link'
import { Button } from '@/components/ui/button'

const LEVELS = [
  { name: 'Scholarship',        icon: '🏆', slug: 'SCHOLARSHIP', desc: 'Grade 5 scholarship exam' },
  { name: 'Grade 6–9',          icon: '📚', slug: 'GRADE_6_9',   desc: 'Junior secondary' },
  { name: 'O/L',                icon: '📝', slug: 'OL',          desc: 'GCE Ordinary Level' },
  { name: 'A/L Science',        icon: '🔬', slug: 'AL_SCIENCE',  desc: 'Maths, Physics, Chemistry' },
  { name: 'A/L Commerce',       icon: '💼', slug: 'AL_COMMERCE', desc: 'Accounting, Economics' },
  { name: 'A/L Arts',           icon: '🎨', slug: 'AL_ARTS',     desc: 'Sinhala, English, History' },
  { name: 'A/L Technology',     icon: '⚙️', slug: 'AL_TECH',     desc: 'Engineering, ICT' },
  { name: 'Music & Sports',     icon: '🎵', slug: 'EXTRA',       desc: 'Piano, Swimming & more' },
]

const POPULAR_SUBJECTS = [
  { name: 'Combined Maths',  icon: '📐', slug: 'al_combmaths',  level: 'A/L Science' },
  { name: 'Physics',         icon: '⚡', slug: 'al_physics',    level: 'A/L Science' },
  { name: 'Chemistry',       icon: '🧪', slug: 'al_chemistry',  level: 'A/L Science' },
  { name: 'O/L Mathematics', icon: '🔢', slug: 'ol_maths',      level: 'O/L' },
  { name: 'O/L Science',     icon: '🔬', slug: 'ol_science',    level: 'O/L' },
  { name: 'English',         icon: '🇬🇧', slug: 'ol_english',    level: 'O/L / A/L' },
  { name: 'Accounting',      icon: '🧾', slug: 'al_accounting', level: 'A/L Commerce' },
  { name: 'Economics',       icon: '📊', slug: 'al_economics',  level: 'A/L Commerce' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Choose your level & subject', desc: 'Select O/L, A/L stream, or extra-curricular. Filter by medium — Sinhala, Tamil or English.' },
  { step: '2', title: 'Find your tutor',             desc: 'Browse verified tutors by district, rating and price. Read real student reviews.' },
  { step: '3', title: 'Book & learn',                desc: 'Book online or home visit. Pay securely. Get model papers and tutor feedback.' },
]

const STATS = [
  { value: '500+', label: 'Verified tutors' },
  { value: '25',   label: 'Districts' },
  { value: '3',    label: 'Mediums' },
  { value: '4.8★', label: 'Avg rating' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-sm px-4 py-1.5 rounded-full mb-5 font-medium">
            🇱🇰 Sri Lanka's #1 tutor marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Find your perfect tutor<br />for O/L, A/L & more
          </h1>
          <p className="text-lg text-gray-500 mb-4 max-w-xl mx-auto">
            Verified tutors in Sinhala, Tamil and English medium. Science, Commerce, Arts, Technology streams. Island-wide.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-8 text-sm">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">🔬 Science stream</span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">💼 Commerce stream</span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">🎨 Arts stream</span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">⚙️ Technology stream</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tutors"><Button size="lg" className="w-full sm:w-auto">Find a tutor</Button></Link>
            <Link href="/register?role=TUTOR"><Button variant="outline" size="lg" className="w-full sm:w-auto">Become a tutor</Button></Link>
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

      {/* Browse by level */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-2">Browse by education level</h2>
        <p className="text-gray-500 mb-7">From Grade 5 scholarship to A/L and professional courses</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {LEVELS.map(l => (
            <Link key={l.slug} href={`/tutors?level=${l.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-brand-400 hover:shadow-sm transition-all group">
              <div className="text-3xl mb-2">{l.icon}</div>
              <div className="text-sm font-semibold text-gray-800 group-hover:text-brand-600">{l.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular subjects */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-2">Most in-demand subjects</h2>
          <p className="text-gray-500 mb-7">Find specialist tutors for every subject</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {POPULAR_SUBJECTS.map(s => (
              <Link key={s.slug} href={`/tutors?subject=${s.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-brand-400 hover:shadow-sm transition-all group flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-800 group-hover:text-brand-600">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.level}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/tutors"><Button variant="outline">View all subjects & tutors</Button></Link>
          </div>
        </div>
      </section>

      {/* Medium support */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-2 text-center">All 3 mediums supported</h2>
        <p className="text-gray-500 text-center mb-8">Find tutors who teach in your preferred language</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { flag: '🇱🇰', name: 'Sinhala Medium', desc: 'සිංහල මාධ්‍ය ගුරුවරු', slug: 'SINHALA' },
            { flag: '📿',  name: 'Tamil Medium',   desc: 'தமிழ் மொழி ஆசிரியர்கள்', slug: 'TAMIL' },
            { flag: '🇬🇧', name: 'English Medium', desc: 'International curriculum tutors', slug: 'ENGLISH' },
          ].map(m => (
            <Link key={m.slug} href={`/tutors?medium=${m.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:border-brand-400 hover:shadow-sm transition-all group">
              <div className="text-4xl mb-3">{m.flag}</div>
              <div className="font-semibold text-gray-800 group-hover:text-brand-600">{m.name}</div>
              <div className="text-sm text-gray-400 mt-1">{m.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-2 text-center">How TutorSpot works</h2>
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
        <p className="text-gray-500 mb-6">Join thousands of Sri Lankan students already on TutorSpot</p>
        <Link href="/tutors"><Button size="lg">Find a tutor now →</Button></Link>
      </section>
    </>
  )
}
