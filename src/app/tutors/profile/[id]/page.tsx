import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Stars } from '@/components/ui/stars'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const tp = await prisma.tutorProfile.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true } } },
    })
    if (!tp) return { title: 'Tutor not found — TutorLK' }
    return {
      title: `${tp.user.name} — Tutor profile on TutorLK`,
      description: tp.bio?.slice(0, 155) ?? 'View tutor profile, reviews and book a session on TutorLK.',
    }
  } catch {
    return { title: 'Tutor profile — TutorLK' }
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
          take: 5,
          include: {
            studentProfile: { include: { user: { select: { name: true, image: true } } } },
          },
        },
      },
    })
  } catch {
    // DB not connected during build — fall through to 404
  }

  if (!tutor) notFound()

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-5">
              <Avatar name={tutor.user.name ?? 'T'} image={tutor.user.image} size="xl" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold">{tutor.user.name}</h1>
                  {tutor.isVerified && <Badge variant="teal">Verified</Badge>}
                </div>
                <p className="text-sm text-gray-500 mb-2">{tutor.qualification}{tutor.university ? ` · ${tutor.university}` : ''}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{tutor.experience} years experience</span>
                  {tutor.locations[0] && <span>{tutor.locations[0].district.name}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Stars rating={tutor.avgRating} />
                  <span className="text-sm font-medium">{tutor.avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({tutor.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          {tutor.bio && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold mb-3">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{tutor.bio}</p>
            </div>
          )}

          {/* Subjects */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold mb-3">Subjects taught</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {tutor.subjects.map((s: any) => (
                <Badge key={s.id} variant="gray">{s.subject.name} ({s.grade})</Badge>
              ))}
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Session modes</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.sessionModes.map((m: any) => (
                <Badge key={m.id} variant={m.mode === 'ONLINE' ? 'blue' : m.mode === 'HOME_VISIT' ? 'purple' : 'gray'}>
                  {m.mode === 'ONLINE' ? 'Online' : m.mode === 'HOME_VISIT' ? 'Home visit' : 'Tuition centre'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {tutor.reviews.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Reviews</h2>
              <div className="flex items-start gap-6 mb-5">
                <div className="text-center">
                  <div className="text-4xl font-bold text-brand-600">{tutor.avgRating.toFixed(1)}</div>
                  <Stars rating={tutor.avgRating} />
                  <div className="text-xs text-gray-400 mt-1">{tutor.totalReviews} reviews</div>
                </div>
              </div>
              <div className="space-y-4">
                {tutor.reviews.map((r: any) => (
                  <div key={r.id} className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={r.studentProfile.user.name ?? 'S'} image={r.studentProfile.user.image} size="sm" />
                      <div>
                        <div className="text-sm font-medium">{r.studentProfile.user.name}</div>
                        <div className="text-xs text-gray-400">{formatDate(r.createdAt)}</div>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl font-bold text-brand-600 mb-1">
              {formatCurrency(tutor.hourlyRate)}<span className="text-sm font-normal text-gray-400">/hr</span>
            </div>
            <div className="flex items-center gap-1 text-sm mb-4">
              <Stars rating={tutor.avgRating} />
              <span className="font-medium">{tutor.avgRating.toFixed(1)}</span>
              <span className="text-gray-400">({tutor.totalReviews})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tutor.isVerified && <Badge variant="teal">Verified</Badge>}
              {tutor.trialClass && <Badge variant="amber">Trial class</Badge>}
            </div>
            <Link href={`/book/${params.id}`}>
              <Button className="w-full mb-3" size="lg">Book a session</Button>
            </Link>
            <div className="text-xs text-gray-400 text-center">
              Payment held in escrow until session complete
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
