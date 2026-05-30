import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminStudentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/admin/login')

  const students = await prisma.studentProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name:true, email:true, createdAt:true } }, _count: { select: { bookings:true, govAttempts:true } } },
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-white text-sm">← Dashboard</Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm font-medium text-white">Students ({students.length})</span>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Student','Grade','School','Bookings','Paper Attempts','Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{s.user.name}</div>
                    <div className="text-xs text-gray-600">{s.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s.grade||'—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-32 truncate">{s.school||'—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s._count.bookings}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s._count.govAttempts}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{new Date(s.createdAt).toLocaleDateString('en-LK',{day:'numeric',month:'short',year:'numeric'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
