import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/admin/login')
  if ((session.user as any).role !== 'ADMIN') redirect('/admin/login')

  const now   = new Date()
  const day30 = new Date(now); day30.setDate(now.getDate()-30)
  const day7  = new Date(now); day7.setDate(now.getDate()-7)

  const [
    totalTutors, totalStudents, verifiedTutors,
    newTutors30, newStudents30, newUsers7,
    totalBookings, bookings30, completedBookings, pendingBookings,
    revenueData, revenue30Data,
    totalPapers, totalAttempts,
    recentUsers, topSubjects,
    allTutors,
  ] = await Promise.all([
    prisma.tutorProfile.count(),
    prisma.studentProfile.count(),
    prisma.tutorProfile.count({ where: { isVerified: true } }),
    prisma.tutorProfile.count({ where: { createdAt: { gte: day30 } } }),
    prisma.studentProfile.count({ where: { createdAt: { gte: day30 } } }),
    prisma.user.count({ where: { createdAt: { gte: day7 } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: day30 } } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.aggregate({ _sum: { totalAmount: true } }),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: day30 } } }),
    (prisma as any).govPaper.count().catch(() => 0),
    (prisma as any).govAttempt.count().catch(() => 0),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id:true, name:true, email:true, role:true, createdAt:true, image:true } }),
    prisma.tutorSubject.groupBy({ by:['subjectId'], _count:{ id:true }, orderBy:{ _count:{ id:'desc' } }, take:8 }).then(async rows => {
      const subs = await prisma.subject.findMany({ where:{ id:{ in:rows.map(r=>r.subjectId) } } })
      return rows.map(r=>({ name:subs.find(s=>s.id===r.subjectId)?.name??r.subjectId, count:r._count.id }))
    }),
    prisma.tutorProfile.findMany({ take:10, orderBy:{ createdAt:'desc' }, include:{ user:{ select:{ name:true, email:true } } } }),
  ])

  const totalRevenue   = revenueData._sum.totalAmount ?? 0
  const revenue30      = revenue30Data._sum.totalAmount ?? 0
  const platformRevenue = Math.round(totalRevenue * 0.05)

  const adminName = session.user.name?.split(' ')[0] ?? 'Admin'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">T</div>
          <div>
            <span className="font-bold text-white">TutorSpot</span>
            <span className="text-gray-500 text-sm ml-2">/ Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/papers" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">📄 Papers</Link>
          <Link href="/admin/tutors" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">👨‍🏫 Tutors</Link>
          <Link href="/admin/students" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">🎓 Students</Link>
          <Link href="/admin/papers/upload" className="text-sm bg-brand-400 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">+ Upload Paper</Link>
          <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
            <div className="w-7 h-7 rounded-full bg-brand-400 flex items-center justify-center text-xs font-bold">{adminName[0]}</div>
            <span className="text-sm text-gray-300">{adminName}</span>
            <Link href="/api/auth/signout" className="text-xs text-gray-600 hover:text-red-400 ml-1">Sign out</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {adminName} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening on TutorSpot today</p>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:'👨‍🏫', label:'Total Tutors',     value:totalTutors,   sub:`${newTutors30} new this month`,  color:'from-brand-400 to-brand-600' },
            { icon:'🎓', label:'Total Students',   value:totalStudents, sub:`${newStudents30} new this month`, color:'from-blue-500 to-blue-700' },
            { icon:'📅', label:'Total Bookings',   value:totalBookings, sub:`${bookings30} this month`,        color:'from-purple-500 to-purple-700' },
            { icon:'✅', label:'Verified Tutors',  value:verifiedTutors,sub:`${Math.round(verifiedTutors/(totalTutors||1)*100)}% of tutors`,color:'from-green-500 to-green-700' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <div className="text-3xl font-black text-white">{s.value.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Revenue row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-brand-400/20 to-brand-600/10 border border-brand-400/20 rounded-2xl p-5">
            <div className="text-xs text-brand-300 font-medium mb-1">PLATFORM REVENUE (5% fee)</div>
            <div className="text-3xl font-black text-white">LKR {platformRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-1">All time</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="text-xs text-gray-500 font-medium mb-1">TOTAL BOOKING VALUE</div>
            <div className="text-3xl font-black text-white">LKR {totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-1">LKR {revenue30.toLocaleString()} this month</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="text-xs text-gray-500 font-medium mb-1">PAST PAPERS STATS</div>
            <div className="text-3xl font-black text-white">{totalPapers}</div>
            <div className="text-sm text-gray-400 mt-1">{totalAttempts.toLocaleString()} student attempts</div>
          </div>
        </div>

        {/* Booking stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Pending', value:pendingBookings, color:'text-amber-400', bg:'bg-amber-400/10 border-amber-400/20' },
            { label:'Completed', value:completedBookings, color:'text-green-400', bg:'bg-green-400/10 border-green-400/20' },
            { label:'This month', value:bookings30, color:'text-blue-400', bg:'bg-blue-400/10 border-blue-400/20' },
          ].map(s => (
            <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.bg}`}>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label} bookings</div>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent users */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-white">Recently joined</h3>
              <span className="text-xs text-gray-600">Last 10 users</span>
            </div>
            <div className="divide-y divide-gray-800">
              {recentUsers.map(u => (
                <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {u.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{u.name}</div>
                    <div className="text-xs text-gray-600 truncate">{u.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role==='TUTOR'  ? 'bg-brand-400/20 text-brand-300' :
                      u.role==='ADMIN'  ? 'bg-red-400/20 text-red-300' :
                      'bg-blue-400/20 text-blue-300'
                    }`}>{u.role}</span>
                    <span className="text-xs text-gray-700">{new Date(u.createdAt).toLocaleDateString('en-LK',{day:'numeric',month:'short'})}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top subjects */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="font-bold text-white">Most popular subjects</h3>
              <p className="text-xs text-gray-600 mt-0.5">By number of tutors offering</p>
            </div>
            <div className="p-5 space-y-3">
              {topSubjects.map((s, i) => {
                const max = topSubjects[0]?.count || 1
                const pct = Math.round((s.count/max)*100)
                const colors = ['bg-brand-400','bg-blue-400','bg-green-400','bg-amber-400','bg-purple-400','bg-red-400','bg-pink-400','bg-indigo-400']
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center font-medium">{i+1}</span>
                        <span className="text-sm text-gray-300">{s.name}</span>
                      </div>
                      <span className="text-xs text-gray-600">{s.count} tutors</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i]||'bg-brand-400'} rounded-full`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4">Quick actions</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href:'/admin/papers/upload', icon:'🤖', label:'Upload past paper', sub:'AI extracts questions', accent:true },
              { href:'/admin/tutors',        icon:'👨‍🏫', label:'Manage tutors',     sub:'Verify & view profiles' },
              { href:'/admin/students',      icon:'🎓', label:'Manage students',   sub:'View student accounts' },
              { href:'/past-papers',         icon:'📚', label:'View library',      sub:'See live past papers' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-102 ${a.accent ? 'border-brand-400/30 bg-brand-400/10 hover:bg-brand-400/20' : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800'}`}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className={`text-sm font-semibold ${a.accent?'text-brand-300':'text-white'}`}>{a.label}</div>
                  <div className="text-xs text-gray-600">{a.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
