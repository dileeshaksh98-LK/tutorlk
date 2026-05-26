import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Stars } from '@/components/ui/stars'
import { formatCurrency } from '@/lib/utils'
import type { TutorCard as TutorCardType } from '@/types'

export function TutorCard({ tutor, featured }: { tutor: TutorCardType; featured?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-5 hover:border-brand-400 transition-all ${featured ? 'border-blue-300 border-2' : 'border-gray-200'}`}>
      {featured && (
        <div className="mb-3">
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">Best match for you</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <Avatar name={tutor.name ?? 'T'} image={tutor.image} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-gray-900">{tutor.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {tutor.subjects.slice(0, 2).map(s => `${s.name} (${s.grade})`).join(' · ')}
                {tutor.locations[0] ? ` · ${tutor.locations[0].district}` : ''}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Stars rating={tutor.avgRating} />
                <span className="text-xs text-gray-400">({tutor.totalReviews})</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-semibold text-brand-600">{formatCurrency(tutor.hourlyRate)}<span className="text-xs text-gray-400 font-normal">/hr</span></div>
              <div className="text-xs text-gray-400 mt-0.5">{tutor.experience} yrs exp</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {tutor.isVerified && <Badge variant="teal">Verified</Badge>}
            {tutor.modes.includes('ONLINE') && <Badge variant="blue">Online</Badge>}
            {tutor.modes.includes('HOME_VISIT') && <Badge variant="purple">Home visit</Badge>}
            {tutor.trialClass && <Badge variant="amber">Trial class</Badge>}
          </div>

          {tutor.bio && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{tutor.bio}</p>
          )}

          <div className="flex gap-2 mt-3">
            <Link href={`/tutors/profile/${tutor.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">View profile</Button>
            </Link>
            <Link href={`/book/${tutor.id}`} className="flex-1">
              <Button size="sm" className="w-full">Book now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
