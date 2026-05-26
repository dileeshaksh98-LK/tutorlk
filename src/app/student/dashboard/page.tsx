import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
            take: 5,
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

  const profile = user.studentProfile
  const upcoming = profile.bookings.filter(b => b.scheduledAt > new Date() && b.status !== 'CANCELLED')
  const pendingPapers = profile.submissions.filter(s => s.status !== 'REVIEWED')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Good morning, {user.name?.split(' ')[0]} ☀️</h1>
        {profile.examDate && (
          <p className="text-gray-500">Your exam is in <span className="font-semibold text-red-500">{daysUntil(profile.examDate)} days</span> — keep going!</p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Upcoming sessions',  value: upcoming.length,       color: 'text-brand-600' },
          { label: 'Papers to do',       value: pendingPapers.length,  color: 'text-amber-600' },
          { label: 'Total sessions',     value: profile.bookings.length, color: '' },
          { label: 'My tutors',          value: new Set(profile.bookings.map(b => b.tutorProfileId)).size, color: '' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Upcoming sessions</h2>
            <Link href="/student/bookings" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-3">No upcoming sessions</p>
              <Link href="/tutors"><Button size="sm">Find a tutor</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map(b => (
                <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={b.tutorProfile.user.name ?? 'T'} image={b.tutorProfile.user.image} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{b.tutorProfile.user.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatDate(b.scheduledAt)} · {formatTime(b.scheduledAt)} · {b.sessionMode === 'ONLINE' ? 'Online' : 'Home visit'}
                      </div>
                    </div>
                    <Badge variant={b.status === 'CONFIRMED' ? 'teal' : 'amber'}>
                      {b.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
                    </Badge>
                  </div>
                  {b.status === 'CONFIRMED' && b.sessionMode === 'ONLINE' && (
                    <div className="mt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs">Join Zoom</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending papers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Papers to do</h2>
            <Link href="/student/papers" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {pendingPapers.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm">No pending papers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPapers.map(s => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{s.paper.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.paper.subject.name}</div>
                      {s.paper.dueDate && (
                        <div className={`text-xs mt-1 font-medium ${new Date(s.paper.dueDate) < new Date() ? 'text-red-500' : 'text-amber-600'}`}>
                          {new Date(s.paper.dueDate) < new Date() ? 'Overdue' : `Due ${formatDate(s.paper.dueDate)}`}
                        </div>
                      )}
                    </div>
                    <Link href={`/student/papers/${s.id}`}>
                      <Button size="sm">{s.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 bg-brand-50 border border-brand-100 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tutors',          label: 'Find a tutor',    icon: '🔍' },
            { href: '/student/papers',  label: 'My papers',       icon: '📄' },
            { href: '/student/progress',label: 'My progress',     icon: '📈' },
            { href: '/messages',        label: 'Messages',        icon: '💬' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-brand-400 transition-all">
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-xs font-medium text-gray-700">{a.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
