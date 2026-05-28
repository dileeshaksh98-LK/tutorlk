import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Stars } from '@/components/ui/stars'
import { formatCurrency } from '@/lib/utils'
import type { TutorCard as TutorCardType } from '@/types'

export function TutorCard({ tutor, featured }: { tutor: TutorCardType; featured?: boolean }) {
  return (
    <div className={`relative bg-white rounded-2xl border transition-all duration-300 card-3d overflow-hidden group
      ${featured
        ? 'border-brand-200 shadow-md ring-1 ring-brand-100'
        : 'border-gray-100 shadow-sm hover:border-brand-200'
      }`}>

      {/* Featured ribbon */}
      {featured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-brand-500 to-brand-400 text-white px-2.5 py-1 rounded-full font-medium shadow-sm badge-shine">
            ✨ Best match
          </span>
        </div>
      )}

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 to-brand-50/0 group-hover:from-brand-50/30 group-hover:to-blue-50/20 transition-all duration-300 rounded-2xl pointer-events-none" />

      <div className="relative p-5">
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <Avatar name={tutor.name ?? 'T'} image={tutor.image} size="lg"
              className="ring-2 ring-white shadow-sm" />
            {tutor.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-400 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">{tutor.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {tutor.subjects.slice(0, 2).map(s => s.name).join(' · ')}
                  {tutor.locations[0] ? ` · ${tutor.locations[0].district}` : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-brand-600 text-sm">{formatCurrency(tutor.hourlyRate)}<span className="text-xs text-gray-400 font-normal">/hr</span></div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <Stars rating={tutor.avgRating} />
              <span className="text-xs font-medium text-gray-600">{tutor.avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{tutor.totalReviews} reviews</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{tutor.experience}y exp</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tutor.modes.includes('ONLINE') && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
              💻 Online
            </span>
          )}
          {tutor.modes.includes('HOME_VISIT') && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
              🏠 Home visit
            </span>
          )}
          {tutor.trialClass && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
              🎯 Trial class
            </span>
          )}
          {tutor.subjects.slice(0, 2).map(s => (
            <span key={s.name} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
              {s.name}
            </span>
          ))}
        </div>

        {/* Bio preview */}
        {tutor.bio && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{tutor.bio}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-50">
          <Link href={`/tutors/profile/${tutor.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs group-hover:border-brand-300 transition-colors">
              View profile
            </Button>
          </Link>
          <Link href={`/book/${tutor.id}`} className="flex-1">
            <Button size="sm" className="w-full text-xs shadow-sm hover:shadow-md transition-shadow">
              Book now →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
