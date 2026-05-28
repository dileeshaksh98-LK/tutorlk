import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime, formatCurrency, daysUntil } from '@/lib/utils'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      studentProfile: {
        include: {
          bookings: {
            orderBy: { scheduledAt: 'asc' },
            take: 10,
            include: {
              tutorProfile: { include: { user: { select: { name: true, image: true } } } },
            },
          },
          submissions: {
            where: { status: { not: 'REVIEWED' } },
            include: { paper: { include: { subject: true } } },
            take: 3,
          },
        },
      },
    },
  })

  if (!user?.studentProfile) redirect('/register')

  const profile  = user.studentProfile
  const now      = new Date()
  const upcoming = profile.bookings.filter(b => b.scheduledAt > now && b.status !== 'CANCELLED')
  const completed= profile.bookings.filter(b => b.status === 'COMPLETED')
  const pending  = profile.submissions
  const myTutors = new Set(profile.bookings.map(b => b.tutorProfileId)).size
  const firstName = user.name?.split(' ')[0] ?? 'there'

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greetingIcon = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header banner */}
      <div className="bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">{greeting} {greetingIcon}</p>
              <h1 className="text-2xl font-bold">{firstName}!</h1>
              {profile.examDate && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <p className="text-sm text-gray-300">Exam in <span className="text-red-300 font-bold">{daysUntil(profile.examDate)} days</span> — keep going!</p>
                </div>
              )}
            </div>
            <Link href="/tutors">
              <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20" size="sm">
                + Find a new tutor
              </Button>
            </Link>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: '📅', label: 'Upcoming',  value: upcoming.length,   color: 'text-brand-300' },
              { icon: '✅', label: 'Completed', value: completed.length,  color: 'text-green-300' },
              { icon: '📄', label: 'Papers due', value: pending.length,   color: 'text-amber-300' },
              { icon: '👨‍🏫', label: 'My tutors', value: myTutors,          color: 'text-blue-300' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Upcoming sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">📅 Upcoming sessions</h2>
                <Link href="/student/bookings" className="text-xs text-brand-600 hover:underline">View all</Link>
              </div>
              {upcoming.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm text-gray-400 mb-3">No upcoming sessions</p>
                  <Link href="/tutors"><Button size="sm">Find a tutor</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.slice(0, 3).map(b => {
                    const isToday = b.scheduledAt.toDateString() === now.toDateString()
                    const isSoon = b.scheduledAt.getTime() - now.getTime() < 4 * 3600 * 1000
                    return (
                      <div key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isToday ? 'border-brand-200 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <Avatar name={b.tutorProfile.user.name ?? 'T'} image={b.tutorProfile.user.image} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{b.tutorProfile.user.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {isToday ? <span className="text-brand-600 font-medium">Today</span> : formatDate(b.scheduledAt)} · {formatTime(b.scheduledAt)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                            {b.status === 'CONFIRMED' ? '✓ Confirmed' : '⏳ Pending'}
                          </span>
                          {b.status === 'CONFIRMED' && b.sessionMode === 'ONLINE' && isSoon && (
                            <Button size="sm" className="text-xs px-2 py-1">Join Zoom</Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Papers to do */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">📄 Papers to complete</h2>
                <Link href="/student/papers" className="text-xs text-brand-600 hover:underline">View all</Link>
              </div>
              {pending.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-sm text-gray-400">All caught up! No pending papers.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map(s => {
                    const overdue = s.paper.dueDate && new Date(s.paper.dueDate) < now
                    return (
                      <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${overdue ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${overdue ? 'bg-red-100' : 'bg-amber-50'}`}>
                          {overdue ? '⚠️' : '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{s.paper.title}</div>
                          <div className="text-xs text-gray-400">{s.paper.subject.name}</div>
                          {s.paper.dueDate && (
                            <div className={`text-xs font-medium mt-0.5 ${overdue ? 'text-red-500' : 'text-amber-600'}`}>
                              {overdue ? '⚠️ Overdue' : `Due ${formatDate(s.paper.dueDate)}`}
                            </div>
                          )}
                        </div>
                        <Link href={`/student/papers/${s.id}`}>
                          <Button size="sm" className="text-xs flex-shrink-0">
                            {s.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
                          </Button>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Quick actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/tutors',         icon: '🔍', label: 'Find a tutor',   color: 'bg-brand-50 text-brand-600' },
                  { href: '/student/papers', icon: '📄', label: 'My papers',      color: 'bg-blue-50 text-blue-600' },
                  { href: '/messages',       icon: '💬', label: 'Messages',       color: 'bg-purple-50 text-purple-600' },
                  { href: '/student/progress',icon:'📈', label: 'My progress',    color: 'bg-green-50 text-green-600' },
                ].map(a => (
                  <Link key={a.href} href={a.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${a.color}`}>{a.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600 transition-colors">{a.label}</span>
                    <span className="ml-auto text-gray-300 group-hover:text-brand-400 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* My tutors */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900">My tutors</h2>
                <Link href="/tutors" className="text-xs text-brand-600 hover:underline">+ Add</Link>
              </div>
              {profile.bookings.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400 mb-2">No tutors yet</p>
                  <Link href="/tutors"><Button size="sm" variant="outline" className="text-xs">Find tutors</Button></Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.from(new Map(profile.bookings.map(b => [b.tutorProfileId, b])).values()).slice(0, 3).map(b => (
                    <div key={b.id} className="flex items-center gap-2">
                      <Avatar name={b.tutorProfile.user.name ?? 'T'} image={b.tutorProfile.user.image} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{b.tutorProfile.user.name}</div>
                      </div>
                      <Link href={`/book/${b.tutorProfileId}`}>
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1">Book</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tip card */}
            <div className="bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100 rounded-2xl p-5">
              <div className="text-2xl mb-2">💡</div>
              <p className="text-sm font-medium text-gray-800 mb-1">Tip of the day</p>
              <p className="text-xs text-gray-500 leading-relaxed">Consistency beats cramming. Even 1 hour of focused study daily can raise your grade significantly over a term.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
