import { Metadata } from 'next'
import { TutorSearch } from '@/components/tutors/tutor-search'

interface Props { params: { district: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const district = params.district.charAt(0).toUpperCase() + params.district.slice(1)
  return {
    title: `Tutors in ${district} — TutorLK`,
    description: `Find verified private tutors in ${district} for O/L, A/L, music and sports. Compare ratings and book sessions online or home visit.`,
  }
}

export default function DistrictTutorsPage({ params }: Props) {
  const district = params.district.charAt(0).toUpperCase() + params.district.slice(1)
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Tutors in {district}</h1>
      <p className="text-gray-500 mb-8">Find verified private tutors in {district} district</p>
      <TutorSearch initialDistrict={params.district} />
    </div>
  )
}
