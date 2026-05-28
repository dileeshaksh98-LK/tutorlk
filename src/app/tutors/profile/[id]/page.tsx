import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Stars } from '@/components/ui/stars'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const tp = await prisma.tutorProfile.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true } } },
    })
    if (!tp) return { title: 'Tutor not found — TutorSpot' }
    return {
      title: `${tp.user.name} — Verified tutor on TutorSpot`,
      description: tp.bio?.slice(0, 155) ?? 'View tutor profile, reviews and book a session.',
    }
  } catch {
    return { title: 'Tutor profile — TutorSpot' }
  }
}

export default async function TutorProfilePage({ params }: Props) {
  let tutor: any = null
  try {
    tutor = await prisma.tutorProfile.findUnique({
      where: { id: params.id },
      include: {
        user:         { select: { name: true, image: true } },
        subjects:     { include: { subject: true } },
        locations:    { include: { district: true, city: true } },
        sessionModes: true,
        availability: { orderBy: { dayOfWeek: 'asc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: {
            studentProfile: { include: { user: { select: { name: true, image: true } } } },
          },
        },
      },
    })
  } catch {}
  if (!tutor) notFound()

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const ratingBreakdown = [
    { label: 'Teaching',    value: tutor.reviews.reduce((a: number, r: any) => a + r.teachingRating, 0) / (tutor.reviews.length || 1) },
    { label: 'Punctuality', value: tutor.reviews.reduce((a: number, r: any) => a + r.punctualityRating, 0) / (tutor.reviews.length || 1) },
    { label: 'Materials',   value: tutor.reviews.reduce((a: number, r: any) => a + r.materialsRating, 0) / (tutor.reviews.length || 1) },
    { label: 'Value',       value: tutor.reviews.reduce((a: number, r: any) => a + r.valueRating, 0) / (tutor.reviews.length || 1) },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-white/20 shadow-2xl">
                {tutor.user.image ? (
                  <img src={tutor.user.image} alt={tutor.user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white">
                    {tutor.user.name?.charAt(0)}
                  </div>
                )}
              </div>
              {tutor.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-400 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold">{tutor.user.name}</h1>
                {tutor.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-brand-400/20 text-brand-200 border border-brand-400/30 px-2.5 py-1 rounded-full font-medium">
                    ✓ Verified tutor
                  </span>
                )}
              </div>
              <p className="text-gray-300 mb-3">{tutor.qualification}{tutor.university ? ` · ${tutor.university}` : ''}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                <span className="flex items-center gap-1.5">⭐ <span className="font-semibold text-white">{tutor.avgRating.toFixed(1)}</span> ({tutor.totalReviews} reviews)</span>
                <span className="flex items-center gap-1.5">🎓 {tutor.experience} years experience</span>
                <span className="flex items-center gap-1.5">👨‍🎓 {tutor.totalSessions} sessions</span>
                {tutor.locations[0] && <span className="flex items-center gap-1.5">📍 {tutor.locations[0].district.name}</span>}
              </div>

              <div className="flex flex-wrap gap-2">
                {tutor.sessionModes.map((m: any) => (
                  <span key={m.id} className={`text-xs px-3 py-1.5 rounded-full border font-medium
                    ${m.mode === 'ONLINE' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                      m.mode === 'HOME_VISIT' ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' :
                      'bg-gray-500/20 text-gray-200 border-gray-400/30'}`}>
                    {m.mode === 'ONLINE' ? '💻 Online' : m.mode === 'HOME_VISIT' ? '🏠 Home visit' : '🏫 Tuition centre'}
                  </span>
                ))}
                {tutor.trialClass && (
                  <span className="text-xs px-3 py-1.5 rounded-full border bg-amber-500/20 text-amber-200 border-amber-400/30 font-medium">
                    🎯 Trial class available
                  </span>
                )}
              </div>
            </div>

            {/* Price + CTA (desktop) */}
            <div className="hidden sm:block text-right">
              <div className="text-3xl font-bold text-white">{formatCurrency(tutor.hourlyRate)}</div>
              <div className="text-gray-400 text-sm mb-4">per hour</div>
              <Link href={`/book/${params.id}`}>
                <Button size="lg" className="shadow-xl w-full">Book a session →</Button>
              </Link>
              {tutor.trialClass && <p className="text-xs text-gray-400 mt-2">Free trial class available</p>}
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="sm:hidden mt-5 flex items-center gap-3">
            <div>
              <div className="text-2xl font-bold">{formatCurrency(tutor.hourlyRate)}<span className="text-sm text-gray-400 font-normal">/hr</span></div>
            </div>
            <Link href={`/book/${params.id}`} className="flex-1">
              <Button size="lg" className="w-full shadow-xl">Book now →</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            {tutor.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 text-sm">👤</span>
                  About
                </h2>
                <p className="text-gray-600 leading-relaxed">{tutor.bio}</p>
              </div>
            )}

            {/* Subjects */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-sm">📚</span>
                Subjects taught
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {tutor.subjects.map((s: any) => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">
                    {s.subject.icon && <span>{s.subject.icon}</span>}
                    {s.subject.name} <span className="text-gray-400 font-normal">({s.grade})</span>
                  </span>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Session modes</p>
                <div className="flex flex-wrap gap-2">
                  {tutor.sessionModes.map((m: any) => (
                    <span key={m.id} className={`text-sm px-3 py-1 rounded-xl font-medium
                      ${m.mode === 'ONLINE' ? 'bg-blue-50 text-blue-700' : m.mode === 'HOME_VISIT' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {m.mode === 'ONLINE' ? '💻 Online' : m.mode === 'HOME_VISIT' ? '🏠 Home visit' : '🏫 Tuition centre'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability */}
            {tutor.availability.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-sm">📅</span>
                  Weekly availability
                </h2>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS.map((day, i) => {
                    const slot = tutor.availability.find((a: any) => a.dayOfWeek === i + 1)
                    return (
                      <div key={day} className={`rounded-xl p-2 text-center text-xs ${slot ? 'bg-brand-50 border border-brand-200' : 'bg-gray-50 border border-gray-100'}`}>
                        <div className={`font-medium mb-1 ${slot ? 'text-brand-600' : 'text-gray-400'}`}>{day}</div>
                        {slot ? (
                          <div className="text-brand-500 font-medium">✓</div>
                        ) : (
                          <div className="text-gray-300">—</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-sm">⭐</span>
                Student reviews
                <span className="ml-auto text-sm font-normal text-gray-400">{tutor.totalReviews} total</span>
              </h2>

              {/* Rating summary */}
              <div className="flex items-start gap-6 mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-5xl font-black text-gray-900">{tutor.avgRating.toFixed(1)}</div>
                  <Stars rating={tutor.avgRating} />
                  <div className="text-xs text-gray-400 mt-1">{tutor.totalReviews} reviews</div>
                </div>
                <div className="flex-1 space-y-2">
                  {ratingBreakdown.map(r => (
                    <div key={r.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20">{r.label}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(r.value / 5) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-6">{r.value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              {tutor.reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-sm">No reviews yet — be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tutor.reviews.map((r: any) => (
                    <div key={r.id} className="border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar name={r.studentProfile.user.name ?? 'S'} image={r.studentProfile.user.image} size="sm" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{r.studentProfile.user.name}</div>
                          <div className="text-xs text-gray-400">{formatDate(r.createdAt)}</div>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                      {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Booking card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 sticky top-20">
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-3xl font-black text-gray-900">{formatCurrency(tutor.hourlyRate)}</div>
                <div className="text-sm text-gray-400">per hour</div>
              </div>
              <div className="flex items-center gap-1.5 mb-4">
                <Stars rating={tutor.avgRating} />
                <span className="text-sm font-medium">{tutor.avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({tutor.totalReviews} reviews)</span>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { label: 'Experience', value: `${tutor.experience} years` },
                  { label: 'Sessions',   value: `${tutor.totalSessions}+ completed` },
                  { label: 'Location',   value: tutor.locations[0]?.district.name ?? 'Online' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>

              <Link href={`/book/${params.id}`}>
                <Button size="lg" className="w-full shadow-md hover:shadow-lg mb-2">Book a session →</Button>
              </Link>
              {tutor.trialClass && (
                <p className="text-center text-xs text-brand-600 font-medium">🎯 Free trial class available</p>
              )}
              <p className="text-center text-xs text-gray-400 mt-2">Secure payment · Escrow protected</p>
            </div>

            {/* Locations */}
            {tutor.locations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">📍 Teaching locations</h3>
                <div className="space-y-2">
                  {tutor.locations.map((l: any) => (
                    <div key={l.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full flex-shrink-0" />
                      {l.city ? `${l.city.name}, ` : ''}{l.district.name}
                    </div>
                  ))}
                  {tutor.sessionModes.some((m: any) => m.mode === 'ONLINE') && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                      Online (island-wide)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl border border-brand-100 p-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Know someone who needs a tutor?</p>
              <Button variant="outline" size="sm" className="w-full border-brand-200 text-brand-600 hover:bg-brand-50">
                📤 Share this profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
