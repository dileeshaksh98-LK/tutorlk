import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminPapersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/admin/login')

  const papers = await (prisma as any).govPaper.findMany({
    orderBy: { createdAt: 'desc' },
    include: { subject: true, _count: { select: { questions: true, govAttempts: true } } },
  }).catch(() => [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-gray-700">/</span>
          <span className="text-sm font-medium text-white">Past Papers</span>
        </div>
        <Link href="/admin/papers/upload" className="text-sm bg-brand-400 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          🤖 Upload PDF with AI
        </Link>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">{papers.length} Past Papers</h1>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Paper</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Type</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Questions</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Attempts</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {papers.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-800/50">
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium text-white">{p.title}</div>
                    <div className="text-xs text-gray-600">{p.subject?.name} · {p.year} · {p.medium}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.examType==='AL' ? 'bg-brand-400/20 text-brand-300' :
                      p.examType==='OL' ? 'bg-blue-400/20 text-blue-300' :
                      'bg-amber-400/20 text-amber-300'
                    }`}>{p.examType}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">{p._count?.questions ?? 0}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{p._count?.govAttempts ?? 0}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-400/20 text-green-300' : 'bg-gray-700 text-gray-500'}`}>
                      {p.isActive ? 'Live' : 'Draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {papers.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <div className="text-4xl mb-3">📄</div>
              <p>No papers yet — upload a PDF to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
