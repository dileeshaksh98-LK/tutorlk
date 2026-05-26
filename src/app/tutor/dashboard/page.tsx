import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
            orderBy: { scheduledAt: 'asc' },
            take: 10,
            include: {
              studentProfile: { include: { user: { select: { name: true, image: true } } } },
            },
          },
          payouts: { orderBy: { createdAt: 'desc' }, take: 3 },
        },
      },
    },
  })

  if (!user?.tutorProfile) redirect('/tutor/setup')

  const tp = user.tutorProfile
  const now = new Date()
  const upcoming = tp.bookings.filter(b => b.scheduledAt > now && b.status !== 'CANCELLED')
  const requests  = tp.bookings.filter(b => b.status === 'PENDING' && b.scheduledAt > now)

  const thisMonth = tp.bookings.filter(b => {
    const d = new Date(b.scheduledAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && b.status === 'COMPLETED'
  })
  const monthlyEarnings = thisMonth.reduce((sum, b) => sum + b.tutorAmount, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tp.isVerified ? '✅ Verified tutor' : '⏳ Verification pending'}
          </p>
        </div>
        <Link href="/tutor/profile"><Button variant="outline" size="sm">Edit profile</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'This month',      value: formatCurrency(monthlyEarnings), color: 'text-brand-600' },
          { label: 'Sessions/month',  value: thisMonth.length,               color: '' },
          { label: 'Pending requests',value: requests.length,                color: requests.length > 0 ? 'text-amber-600' : '' },
          { label: 'Avg rating',      value: `${tp.avgRating.toFixed(1)} ★`, color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking requests */}
        <div>
          <h2 className="font-semibold mb-3">Booking requests {requests.length > 0 && <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full ml-1">{requests.length}</span>}</h2>
          {requests.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(b => (
                <div key={b.id} className="bg-white border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={b.studentProfile.user.name ?? 'S'} image={b.studentProfile.user.image} size="sm" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{b.studentProfile.user.name}</div>
                      <div className="text-xs text-gray-500">{formatDate(b.scheduledAt)} · {formatTime(b.scheduledAt)}</div>
                    </div>
                    <div className="text-sm font-semibold text-brand-600">{formatCurrency(b.totalAmount)}</div>
                  </div>
                  {b.notes && <p className="text-xs text-gray-500 italic mb-3">"{b.notes}"</p>}
                  <div className="flex gap-2">
                    <form action={`/api/bookings/${b.id}/confirm`} method="POST" className="flex-1">
                      <Button size="sm" className="w-full">Accept</Button>
                    </form>
                    <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming sessions */}
        <div>
          <h2 className="font-semibold mb-3">Upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm">No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map(b => (
                <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={b.studentProfile.user.name ?? 'S'} image={b.studentProfile.user.image} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{b.studentProfile.user.name}</div>
                      <div className="text-xs text-gray-500">{formatDate(b.scheduledAt)} · {formatTime(b.scheduledAt)}</div>
                    </div>
                    <Badge variant={b.status === 'CONFIRMED' ? 'teal' : 'amber'}>{b.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payout history */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent payouts</h2>
          <Link href="/tutor/payouts" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {tp.payouts.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No payouts yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Period</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Sessions</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Amount</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {tp.payouts.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">{p.period}</td>
                    <td className="px-4 py-3">{p.sessionCount}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3"><Badge variant={p.status === 'PAID' ? 'teal' : 'amber'}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
