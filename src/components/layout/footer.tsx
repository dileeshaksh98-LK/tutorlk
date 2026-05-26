import Link from 'next/link'

const DISTRICTS = ['Colombo', 'Kandy', 'Galle', 'Gampaha', 'Kalutara', 'Kurunegala', 'Jaffna']
const SUBJECTS  = ['Combined Maths', 'Physics', 'Chemistry', 'English', 'Piano', 'ICT', 'Sinhala']

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="font-semibold text-brand-600 text-lg mb-3">🎓 TutorLK</div>
          <p className="text-sm text-gray-500 leading-relaxed">Sri Lanka's trusted tutor marketplace. Find verified tutors for O/L, A/L, music and sports island-wide.</p>
        </div>
        <div>
          <div className="font-medium text-sm mb-3">Find tutors by district</div>
          <ul className="space-y-1.5">
            {DISTRICTS.map(d => (
              <li key={d}><Link href={`/tutors/${d.toLowerCase()}`} className="text-sm text-gray-500 hover:text-brand-600">{d}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium text-sm mb-3">Popular subjects</div>
          <ul className="space-y-1.5">
            {SUBJECTS.map(s => (
              <li key={s}><Link href={`/tutors/subject/${s.toLowerCase().replace(/\s+/g,'-')}`} className="text-sm text-gray-500 hover:text-brand-600">{s}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium text-sm mb-3">Platform</div>
          <ul className="space-y-1.5">
            {['How it works', 'Become a tutor', 'Pricing', 'Help centre', 'Contact'].map(l => (
              <li key={l}><Link href="#" className="text-sm text-gray-500 hover:text-brand-600">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} TutorLK · Built in Sri Lanka
      </div>
    </footer>
  )
}
