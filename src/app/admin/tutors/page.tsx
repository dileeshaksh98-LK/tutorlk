import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminTutorsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/admin/login')

  const tutors = await prisma.tutorProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name:true, email:true, createdAt:true } }, _count: { select: { bookings:true, reviews:true } } },
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-white text-sm">← Dashboard</Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm font-medium text-white">Tutors ({tutors.length})</span>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Tutor','Experience','Rate','Rating','Bookings','Reviews','Verified'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tutors.map(t => (
                <tr key={t.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{t.user.name}</div>
                    <div className="text-xs text-gray-600">{t.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{t.experience}y</td>
                  <td className="px-4 py-3 text-sm text-gray-400">LKR {t.hourlyRate.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-amber-400">{t.avgRating > 0 ? `★ ${t.avgRating.toFixed(1)}` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{t._count.bookings}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{t._count.reviews}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${t.isVerified ? 'bg-green-400/20 text-green-300' : 'bg-gray-700 text-gray-500'}`}>
                      {t.isVerified ? '✓ Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
