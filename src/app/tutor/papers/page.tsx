import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function TutorPapersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { tutorProfile: { include: {
      papers: {
        orderBy: { createdAt: 'desc' },
        include: {
          subject: true,
          _count: { select: { submissions: true, questions: true } },
        },
      },
    }}},
  })
  if (!user?.tutorProfile) redirect('/tutor/setup')

  const papers = user.tutorProfile.papers

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-brand-900 text-white py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Model Papers & Tests</h1>
            <p className="text-gray-400 text-sm mt-1">{papers.length} papers · Manage and assign to students</p>
          </div>
          <Link href="/tutor/papers/new">
            <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20">+ Upload paper</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {papers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No papers yet</h2>
            <p className="text-gray-400 mb-6">Upload model papers, past papers and topic tests for your students</p>
            <Link href="/tutor/papers/new"><Button>+ Upload your first paper</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {papers.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${p.isPublished ? 'bg-brand-50' : 'bg-gray-100'}`}>
                    {p.type === 'MODEL_PAPER' ? '📋' : p.type === 'PAST_PAPER' ? '📜' : p.type === 'TOPIC_TEST' ? '📝' : '⚡'}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isPublished ? '✓ Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{p.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{p.subject.name} · {p.type.replace('_',' ')}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span>❓ {p._count.questions} questions</span>
                  <span>👥 {p._count.submissions} submissions</span>
                  {p.timeLimitMins && <span>⏱ {p.timeLimitMins}min</span>}
                </div>
                <div className="flex gap-2">
                  <Link href={`/tutor/papers/${p.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">Edit</Button>
                  </Link>
                  <Link href={`/tutor/papers/${p.id}/submissions`} className="flex-1">
                    <Button size="sm" className="w-full text-xs">Review</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
