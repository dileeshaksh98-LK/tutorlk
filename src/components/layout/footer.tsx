import Link from 'next/link'

const DISTRICTS = ['Colombo', 'Kandy', 'Galle', 'Gampaha', 'Kalutara', 'Kurunegala', 'Jaffna']
const SUBJECTS  = ['Combined Maths', 'Physics', 'Chemistry', 'English', 'Piano', 'ICT', 'Economics']

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs">T</div>
            <span className="font-bold text-white">Tutor<span className="text-brand-400">Spot</span></span>
          </div>
          <p className="text-sm leading-relaxed text-gray-500">Sri Lanka's trusted tutor marketplace. Verified tutors for O/L, A/L and more.</p>
        </div>
        <div>
          <div className="font-medium text-white text-sm mb-3">Districts</div>
          <ul className="space-y-2">
            {DISTRICTS.map(d => (
              <li key={d}><Link href={`/tutors/${d.toLowerCase()}`} className="text-sm hover:text-brand-400 transition-colors">{d}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium text-white text-sm mb-3">Subjects</div>
          <ul className="space-y-2">
            {SUBJECTS.map(s => (
              <li key={s}><Link href={`/tutors?subject=${s.toLowerCase().replace(/\s+/g,'-')}`} className="text-sm hover:text-brand-400 transition-colors">{s}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium text-white text-sm mb-3">Platform</div>
          <ul className="space-y-2">
            {['How it works','Become a tutor','Pricing','Help centre'].map(l => (
              <li key={l}><Link href="#" className="text-sm hover:text-brand-400 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} TutorSpot · Built in Sri Lanka 🇱🇰
      </div>
    </footer>
  )
}
