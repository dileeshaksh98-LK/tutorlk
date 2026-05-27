import { Metadata } from 'next'
import { TutorSearch } from '@/components/tutors/tutor-search'

export const metadata: Metadata = {
  title: 'Find tutors in Sri Lanka — O/L, A/L, Music & Sports',
  description: 'Browse 500+ verified tutors for O/L, A/L Science, Commerce, Arts and Technology streams. Sinhala, Tamil and English medium. All 25 districts.',
}

export default function TutorsPage({
  searchParams,
}: {
  searchParams: { subject?: string; district?: string; level?: string; stream?: string; medium?: string }
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a tutor</h1>
        <p className="text-gray-500">500+ verified tutors — O/L, A/L, Music, Sports · Sinhala, Tamil & English medium</p>
      </div>
      <TutorSearch
        initialSubject={searchParams.subject}
        initialDistrict={searchParams.district}
      />
    </div>
  )
}
