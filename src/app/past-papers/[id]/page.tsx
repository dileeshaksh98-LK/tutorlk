import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const paper = await (prisma as any).govPaper.findUnique({
    where: { id: params.id },
    include: {
      subject: true,
      questions: { orderBy: { orderNum: 'asc' } },
      _count: { select: { attempts: true } },
    },
  }).catch(() => null)

  if (!paper) notFound()

  const EXAM_COLORS: Record<string, string> = {
    AL: 'from-brand-400 to-brand-600',
    OL: 'from-green-400 to-emerald-600',
    SCHOLARSHIP: 'from-amber-400 to-amber-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${EXAM_COLORS[paper.examType] ?? 'from-gray-700 to-gray-900'} text-white`}>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link href="/past-papers" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            ← Back to papers
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
              {paper.examType === 'AL' ? '🎓' : paper.examType === 'OL' ? '📝' : '🏆'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{paper.title}</h1>
              <p className="text-white/80 text-sm">{paper.subject?.name} · {paper.year} · Government Past Paper</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                <span className="bg-white/15 px-3 py-1 rounded-full">❓ {paper.questions.length} MCQ questions</span>
                <span className="bg-white/15 px-3 py-1 rounded-full">⏱ {paper.timeMins} minutes</span>
                <span className="bg-white/15 px-3 py-1 rounded-full">🎯 {paper.totalMarks} marks</span>
                <span className="bg-white/15 px-3 py-1 rounded-full">👥 {(paper._count?.attempts ?? 0).toLocaleString()} attempts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon:'📋', title:'MCQ Practice', desc:'Answer all questions and get instant right/wrong feedback' },
            { icon:'📊', title:'Performance Analysis', desc:'See your score, accuracy and which topics need work' },
            { icon:'🔄', title:'Unlimited Retakes', desc:'Practise as many times as you want — completely free' },
          ].map(f => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-sm text-gray-800 mb-1">{f.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Question preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Questions preview</h2>
          {paper.questions.slice(0, 3).map((q: any, i: number) => (
            <div key={q.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center flex-shrink-0 font-medium">{i + 1}</span>
              <p className="text-sm text-gray-700 line-clamp-2">{q.content}</p>
            </div>
          ))}
          {paper.questions.length > 3 && (
            <p className="text-xs text-gray-400 mt-3">+ {paper.questions.length - 3} more questions</p>
          )}
        </div>

        {/* Start button */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <h2 className="font-bold text-gray-900 mb-1">Ready to practise?</h2>
          <p className="text-sm text-gray-400 mb-5">You have {paper.timeMins} minutes for {paper.questions.length} questions.</p>
          <Link href={`/past-papers/${params.id}/attempt`}>
            <Button size="lg" className="px-12 shadow-md">🚀 Start paper →</Button>
          </Link>
          <p className="text-xs text-gray-400 mt-3">Your progress is saved automatically</p>
        </div>
      </div>
    </div>
  )
}
