import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const now   = new Date()
  const day30 = new Date(now); day30.setDate(now.getDate()-30)

  const [
    totalTutors, totalStudents, verifiedTutors,
    newTutors30, newStudents30,
    totalBookings, bookings30, completedBookings,
    totalRevenue, revenue30,
    totalPapers, totalAttempts,
    recentUsers,
    topSubjects,
  ] = await Promise.all([
    prisma.tutorProfile.count(),
    prisma.studentProfile.count(),
    prisma.tutorProfile.count({ where: { isVerified: true } }),
    prisma.tutorProfile.count({ where: { createdAt: { gte: day30 } } }),
    prisma.studentProfile.count({ where: { createdAt: { gte: day30 } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: day30 } } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.aggregate({ _sum: { totalAmount: true } }).then(r=>r._sum.totalAmount??0),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: day30 } } }).then(r=>r._sum.totalAmount??0),
    (prisma as any).govPaper.count().catch(()=>0),
    (prisma as any).govAttempt.count().catch(()=>0),
    prisma.user.findMany({ orderBy:{ createdAt:'desc' }, take:10, select:{ id:true, name:true, email:true, role:true, createdAt:true } }),
    prisma.tutorSubject.groupBy({ by:['subjectId'], _count:{ id:true }, orderBy:{ _count:{ id:'desc' } }, take:8 }).then(async rows => {
      const subs = await prisma.subject.findMany({ where:{ id:{ in:rows.map(r=>r.subjectId) } } })
      return rows.map(r=>({ name:subs.find(s=>s.id===r.subjectId)?.name??r.subjectId, count:r._count.id }))
    }),
  ])

  return NextResponse.json({
    overview: {
      totalTutors, totalStudents, verifiedTutors, newTutors30, newStudents30,
      totalBookings, bookings30, completedBookings,
      totalRevenue, revenue30, totalPapers, totalAttempts,
      platformRevenue: Math.round((totalRevenue as number)*0.05),
    },
    recentUsers, topSubjects,
  })
}
