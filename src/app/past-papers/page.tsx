import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Government Past Papers — Free O/L & A/L Practice | TutorSpot',
  description: 'Free government past papers for O/L, A/L and Grade 5 Scholarship. Interactive MCQ practice with instant answers and performance analysis.',
}

export default async function PastPapersPage({
  searchParams,
}: {
  searchParams: { type?: string; year?: string }
}) {
  const where: any = { isActive: true }
  if (searchParams.type && searchParams.type !== 'all') where.examType = searchParams.type
  if (searchParams.year) where.year = parseInt(searchParams.year)

  const papers = await prisma.govPaper.findMany({
    where,
    orderBy: [{ examType: 'asc' }, { year: 'desc' }],
    include: { subject: true, _count: { select: { questions: true, govAttempts: true } } },
  }).catch(() => [])

  const years = Array.from({ length: 6 }, (_, i) => 2023 - i)

  const grouped = papers.reduce((acc: any, p: any) => {
    if (!acc[p.examType]) acc[p.examType] = []
    acc[p.examType].push(p)
    return acc
  }, {})

  const EXAM_LABELS: Record<string, string> = {
    SCHOLARSHIP: '🏆 Grade 5 Scholarship',
    OL: '📝 G.C.E O/L',
    AL: '🎓 G.C.E A/L',
  }

  const FILTERS = [
    { id: 'all', label: 'All papers' },
    { id: 'SCHOLARSHIP', label: '🏆 Scholarship' },
    { id: 'OL', label: '📝 O/L' },
    { id: 'AL', label: '🎓 A/L' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-3">
                🇱🇰 Official Department of Examinations — Sri Lanka
              </div>
              <h1 className="text-3xl font-bold mb-2">Government Past Papers</h1>
              <p className="text-gray-300 max-w-xl">Free interactive MCQ practice for O/L, A/L and Grade 5 Scholarship. Instant answer feedback and performance analysis.</p>
            </div>
            <div className="flex gap-3">
              {[
                { value: papers.length, label: 'Papers' },
                { value: papers.reduce((s: number, p: any) => s + (p._count?.questions ?? 0), 0), label: 'Questions' },
                { value: '100%', label: 'Free' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center min-w-16">
                  <div className="text-xl font-black text-brand-300">{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <Link key={f.id} href={f.id === 'all' ? '/past-papers' : `/past-papers?type=${f.id}`}>
                <button className={`px-4 py-2 text-sm rounded-xl border-2 font-medium transition-all ${
                  (f.id === 'all' && !searchParams.type) || searchParams.type === f.id
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}>{f.label}</button>
              </Link>
            ))}
          </div>
        </div>

        {Object.entries(grouped).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-gray-500 mb-2 font-medium">No papers found</p>
            <p className="text-gray-400 text-sm">Make sure you ran the past papers SQL in Supabase.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([type, typePapers]: [string, any]) => (
            <div key={type} className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                {EXAM_LABELS[type] ?? type}
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{(typePapers as any[]).length} papers</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(typePapers as any[]).map((p: any) => (
                  <Link key={p.id} href={`/past-papers/${p.id}`}>
                    <div className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 hover:shadow-md transition-all duration-200 card-3d cursor-pointer h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                          type === 'AL' ? 'bg-brand-50' : type === 'OL' ? 'bg-green-50' : 'bg-amber-50'
                        }`}>
                          {type === 'AL' ? '🎓' : type === 'OL' ? '📝' : '🏆'}
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Free</span>
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-brand-600 transition-colors line-clamp-2">{p.title}</h3>
                      <p className="text-xs text-gray-400 mb-3">{p.subject?.name} · {p.year} · {p.timeMins} mins</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                        <span>❓ {p._count?.questions ?? 0} MCQs</span>
                        <span>👥 {(p.attempts ?? 0).toLocaleString()} attempts</span>
                      </div>
                      <div className="pt-3 border-t border-gray-50">
                        <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700">Start practice →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="mt-8 bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100 rounded-2xl p-6 flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">💡</div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How past paper practice works</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Answer MCQ questions one by one with instant feedback</li>
              <li>✓ Read the explanation for every question after answering</li>
              <li>✓ Get a score, grade and performance analysis at the end</li>
              <li>✓ Retake any paper as many times as you want — completely free</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
