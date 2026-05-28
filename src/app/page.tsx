import Link from 'next/link'
import { Button } from '@/components/ui/button'

const LEVELS = [
  { name: 'Scholarship',     icon: '🏆', slug: 'SCHOLARSHIP', desc: 'Grade 5', color: 'from-yellow-400 to-amber-500' },
  { name: 'Grade 6–9',       icon: '📚', slug: 'GRADE_6_9',   desc: 'Junior',  color: 'from-blue-400 to-blue-500' },
  { name: 'O/L',             icon: '📝', slug: 'OL',          desc: 'GCE O/L', color: 'from-green-400 to-emerald-500' },
  { name: 'A/L Science',     icon: '🔬', slug: 'AL_SCIENCE',  desc: 'Maths, Physics, Chem', color: 'from-brand-400 to-brand-600' },
  { name: 'A/L Commerce',    icon: '💼', slug: 'AL_COMMERCE', desc: 'Accounting, Economics', color: 'from-purple-400 to-purple-600' },
  { name: 'A/L Arts',        icon: '🎨', slug: 'AL_ARTS',     desc: 'Sinhala, English', color: 'from-pink-400 to-rose-500' },
  { name: 'A/L Technology',  icon: '⚙️', slug: 'AL_TECH',     desc: 'Engineering, ICT', color: 'from-gray-500 to-gray-700' },
  { name: 'Music & Sports',  icon: '🎵', slug: 'EXTRA',       desc: 'Piano, Swimming', color: 'from-orange-400 to-orange-500' },
]

const POPULAR = [
  { name: 'Combined Maths', icon: '📐', slug: 'al_combmaths', level: 'A/L' },
  { name: 'Physics',        icon: '⚡', slug: 'al_physics',   level: 'A/L' },
  { name: 'Chemistry',      icon: '🧪', slug: 'al_chemistry', level: 'A/L' },
  { name: 'O/L Maths',      icon: '🔢', slug: 'ol_maths',     level: 'O/L' },
  { name: 'English',        icon: '🇬🇧', slug: 'ol_english',   level: 'O/L' },
  { name: 'Accounting',     icon: '🧾', slug: 'al_accounting',level: 'A/L' },
  { name: 'Biology',        icon: '🔬', slug: 'al_biology',   level: 'A/L' },
  { name: 'Economics',      icon: '📊', slug: 'al_economics', level: 'A/L' },
]

const STATS = [
  { value: '500+', label: 'Verified tutors',  icon: '👨‍🏫' },
  { value: '25',   label: 'Districts',        icon: '🗺️' },
  { value: '3',    label: 'Mediums',          icon: '🌐' },
  { value: '4.8★', label: 'Avg rating',       icon: '⭐' },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="relative gradient-mesh min-h-[80vh] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-brand-400/10 rounded-full blur-3xl float" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl float-delayed" />

        <div className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-brand-600 text-sm px-4 py-2 rounded-full mb-6 font-medium shadow-sm border border-brand-100 animate-fade-in-up">
            <span className="w-2 h-2 bg-brand-400 rounded-full pulse-glow" />
            🇱🇰 Sri Lanka's #1 tutor marketplace
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-5 leading-tight animate-fade-in-up" style={{animationDelay:'100ms'}}>
            Find your perfect<br />
            <span className="text-gradient">O/L & A/L tutor</span>
          </h1>

          <p className="text-lg text-gray-500 mb-6 max-w-lg mx-auto animate-fade-in-up" style={{animationDelay:'200ms'}}>
            Verified tutors in Sinhala, Tamil and English medium. Science, Commerce, Arts, Technology streams. Island-wide.
          </p>

          {/* Stream pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8 animate-fade-in-up stagger-children" style={{animationDelay:'300ms'}}>
            {['🔬 Science', '💼 Commerce', '🎨 Arts', '⚙️ Technology', '📝 O/L', '🏆 Scholarship'].map(s => (
              <span key={s} className="glass text-sm text-gray-700 px-3 py-1.5 rounded-full border border-white/50 shadow-sm hover:shadow-md transition-all cursor-default">
                {s}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{animationDelay:'400ms'}}>
            <Link href="/tutors">
              <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow px-8">
                Find a tutor →
              </Button>
            </Link>
            <Link href="/register?role=TUTOR">
              <Button variant="outline" size="lg" className="w-full sm:w-auto glass border-white/50 hover:bg-white/80">
                Become a tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label} className="group">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by level */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by education level</h2>
          <p className="text-gray-500">From Grade 5 scholarship to A/L and professional courses</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {LEVELS.map((l, i) => (
            <Link key={l.slug} href={`/tutors?level=${l.slug}`}
              className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-transparent transition-all duration-300 card-3d overflow-hidden animate-fade-in-up"
              style={{animationDelay:`${i*60}ms`}}>
              <div className={`absolute inset-0 bg-gradient-to-br ${l.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center text-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                {l.icon}
              </div>
              <div className="font-semibold text-sm text-gray-800 group-hover:text-brand-600 transition-colors">{l.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular subjects */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Most in-demand subjects</h2>
            <p className="text-gray-500">Specialist tutors for every subject</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {POPULAR.map((s, i) => (
              <Link key={s.slug} href={`/tutors?subject=${s.slug}`}
                className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-brand-200 hover:shadow-md transition-all duration-200 flex items-center gap-3 animate-fade-in-up"
                style={{animationDelay:`${i*50}ms`}}>
                <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-800 group-hover:text-brand-600 transition-colors">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.level}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/tutors">
              <Button variant="outline" className="gap-2">View all tutors →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Medium support */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All 3 mediums supported</h2>
          <p className="text-gray-500">Learn in your preferred language</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { flag: '🇱🇰', name: 'Sinhala Medium', local: 'සිංහල මාධ්‍ය', slug: 'SINHALA', color: 'from-yellow-50 to-amber-50', border: 'border-amber-200' },
            { flag: '📿',  name: 'Tamil Medium',   local: 'தமிழ் மொழி',   slug: 'TAMIL',   color: 'from-orange-50 to-red-50',   border: 'border-orange-200' },
            { flag: '🇬🇧', name: 'English Medium', local: 'English medium', slug: 'ENGLISH', color: 'from-blue-50 to-indigo-50',  border: 'border-blue-200' },
          ].map(m => (
            <Link key={m.slug} href={`/tutors?medium=${m.slug}`}
              className={`group bg-gradient-to-br ${m.color} border ${m.border} rounded-2xl p-7 text-center hover:shadow-lg transition-all duration-300 card-3d`}>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{m.flag}</div>
              <div className="font-bold text-gray-800 group-hover:text-brand-600 transition-colors text-lg">{m.name}</div>
              <div className="text-sm text-gray-500 mt-1">{m.local}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">How TutorSpot works</h2>
            <p className="text-gray-400">Get started in 3 simple steps</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose your level', desc: 'Select O/L, A/L stream, or extra-curricular. Filter by medium.', icon: '🎯' },
              { step: '02', title: 'Find your tutor',   desc: 'Browse verified tutors, read reviews, compare prices.', icon: '🔍' },
              { step: '03', title: 'Book & learn',      desc: 'Book online or home visit. Pay securely. Get model papers.', icon: '🚀' },
            ].map((h, i) => (
              <div key={h.step} className="relative group">
                <div className="text-6xl font-black text-white/5 absolute -top-4 -left-2">{h.step}</div>
                <div className="relative">
                  <div className="text-3xl mb-4">{h.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{h.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{h.desc}</p>
                </div>
                {i < 2 && <div className="hidden sm:block absolute top-8 -right-4 text-gray-700 text-xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative gradient-mesh py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-400/5" />
        <div className="relative max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Ready to ace your exams?</h2>
          <p className="text-gray-500 mb-8 text-lg">Join thousands of Sri Lankan students already on TutorSpot</p>
          <div className="flex gap-3 justify-center">
            <Link href="/tutors"><Button size="lg" className="shadow-xl px-8">Find a tutor now →</Button></Link>
            <Link href="/register"><Button variant="outline" size="lg" className="glass">Sign up free</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
