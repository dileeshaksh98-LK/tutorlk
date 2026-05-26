import { Metadata } from 'next'
import { TutorSearch } from '@/components/tutors/tutor-search'

export const metadata: Metadata = {
  title: 'Find tutors in Sri Lanka — TutorLK',
  description: 'Browse 500+ verified tutors for O/L, A/L, music and sports in Sri Lanka. Filter by subject, district and budget.',
}

export default function TutorsPage({
  searchParams,
}: {
  searchParams: { subject?: string; district?: string }
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a tutor</h1>
        <p className="text-gray-500">Search from 500+ verified tutors island-wide</p>
      </div>
      <TutorSearch initialSubject={searchParams.subject} initialDistrict={searchParams.district} />
    </div>
  )
}
