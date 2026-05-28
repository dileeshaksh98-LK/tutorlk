import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Stars } from '@/components/ui/stars'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default async function TutorDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      tutorProfile: {
        include: {
          bookings: {
            orderBy: { scheduledAt: 'desc' },
            take: 20,
            include: {
              studentProfile: { include: { user: { select: { name: true, image: true } } } },
            },
          },
          payouts: { orderBy: { createdAt: 'desc' }, take: 3 },
          reviews: { orderBy: { createdAt: 'desc' }, take: 3,
            include: { studentProfile: { include: { user: { select: { name: true } } } } },
          },
        },
      },
    },
  })

  if (!user?.tutorProfile) redirect('/tutor/setup')

  const tp  = user.tutorProfile
  const now = new Date()
  const upcoming = tp.bookings.filter(b => b.scheduledAt > now && b.status !== 'CANCELLED').slice(0, 5)
  const requests  = tp.bookings.filter(b => b.status === 'PENDING' && b.scheduledAt > now)
  const thisMonth = tp.bookings.filter(b => {
    const d = new Date(b.scheduledAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && b.status === 'COMPLETED'
  })
  const monthlyEarnings = thisMonth.reduce((s, b) => s + b.tutorAmount, 0)
  const totalEarnings   = tp.bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.tutorAmount, 0)
  const firstName = user.name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4 flex-wrap justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={user.name ?? 'T'} image={user.image} size="xl"
                  className="ring-4 ring-white/20" />
                {tp.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-400 rounded-full flex items-center justify-center ring-2 ring-white">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Stars rating={tp.avgRating} />
                  <span className="text-sm text-gray-300">{tp.avgRating.toFixed(1)} · {tp.totalReviews} reviews</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tp.isVerified
                    ? <span className="text-xs bg-brand-400/20 text-brand-200 border border-brand-400/30 px-2 py-0.5 rounded-full">✓ Verified</span>
                    : <span className="text-xs bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full">⏳ Verification pending</span>
                  }
                </div>
              </div>
            </div>
            <Link href="/tutor/profile">
              <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20" size="sm">
                Edit profile
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon:'💰', label:'This month',   value: formatCurrency(monthlyEarnings), color:'text-green-300' },
              { icon:'📅', label:'Sessions/mo',  value: thisMonth.length,                color:'text-brand-300' },
              { icon:'🔔', label:'Requests',     value: requests.length,                 color: requests.length > 0 ? 'text-amber-300' : 'text-gray-400' },
              { icon:'⭐', label:'Avg rating',   value: `${tp.avgRating.toFixed(1)}★`,   color:'text-yellow-300' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Booking requests */}
            {requests.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🔔 Booking requests
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
                </h2>
                <div className="space-y-3">
                  {requests.map(b => (
                    <div key={b.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <Avatar name={b.studentProfile.user.name ?? 'S'} image={b.studentProfile.user.image} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{b.studentProfile.user.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatDate(b.scheduledAt)} · {formatTime(b.scheduledAt)} · {b.sessionMode === 'ONLINE' ? 'Online' : 'Home visit'} · {b.durationMins}min
                        </div>
                        {b.notes && <p className="text-xs text-gray-500 italic mt-1">"{b.notes}"</p>}
                        <div className="text-xs font-semibold text-brand-600 mt-1">{formatCurrency(b.tutorAmount)} net</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" className="text-xs">Accept</Button>
                        <Button size="sm" variant="outline" className="text-xs">Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">📅 Upcoming sessions</h2>
              {upcoming.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm text-gray-400">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(b => {
                    const isToday = b.scheduledAt.toDateString() === now.toDateString()
                    return (
                      <div key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isToday ? 'border-brand-200 bg-brand-50' : 'border-gray-100'}`}>
                        <Avatar name={b.studentProfile.user.name ?? 'S'} image={b.studentProfile.user.image} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{b.studentProfile.user.name}</div>
                          <div className="text-xs text-gray-400">
                            {isToday ? <span className="text-brand-600 font-medium">Today</span> : formatDate(b.scheduledAt)} · {formatTime(b.scheduledAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-brand-600">{formatCurrency(b.tutorAmount)}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent reviews */}
            {tp.reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">⭐ Recent reviews</h2>
                <div className="space-y-3">
                  {tp.reviews.map(r => (
                    <div key={r.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">{r.studentProfile.user.name}</span>
                        <Stars rating={r.rating} />
                        <span className="ml-auto text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                      </div>
                      {r.comment && <p className="text-xs text-gray-600 italic">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Earnings summary */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl p-5 shadow-lg">
              <div className="text-sm text-brand-200 mb-1">Total earnings</div>
              <div className="text-3xl font-black mb-4">{formatCurrency(totalEarnings)}</div>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-brand-200 text-xs">This month</div>
                  <div className="font-bold">{formatCurrency(monthlyEarnings)}</div>
                </div>
                <div>
                  <div className="text-brand-200 text-xs">Sessions</div>
                  <div className="font-bold">{tp.totalSessions}</div>
                </div>
                <div>
                  <div className="text-brand-200 text-xs">Rating</div>
                  <div className="font-bold">{tp.avgRating.toFixed(1)}★</div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Quick actions</h2>
              <div className="space-y-2">
                {[
                  { href:'/tutor/papers/new', icon:'📄', label:'Upload model paper',  color:'bg-blue-50 text-blue-600' },
                  { href:'/messages',          icon:'💬', label:'Messages',            color:'bg-purple-50 text-purple-600' },
                  { href:'/tutor/payouts',     icon:'💰', label:'Payout history',      color:'bg-green-50 text-green-600' },
                  { href:'/tutor/profile',     icon:'✏️', label:'Edit profile',        color:'bg-amber-50 text-amber-600' },
                ].map(a => (
                  <Link key={a.href} href={a.href}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${a.color}`}>{a.icon}</span>
                    <span className="text-sm text-gray-700 group-hover:text-brand-600 transition-colors">{a.label}</span>
                    <span className="ml-auto text-gray-300 group-hover:text-brand-400 text-sm">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Payout history */}
            {tp.payouts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-3 text-sm">Recent payouts</h2>
                <div className="space-y-2">
                  {tp.payouts.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-xs">{p.period}</div>
                        <div className="text-xs text-gray-400">{p.sessionCount} sessions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-brand-600 text-xs">{formatCurrency(p.amount)}</div>
                        <span className={`text-xs ${p.status === 'PAID' ? 'text-green-500' : 'text-amber-500'}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
