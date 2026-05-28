'use client'
import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function ResultsContent() {
  const { id }   = useParams()
  const sp       = useSearchParams()
  const score    = parseInt(sp.get('score')   ?? '0')
  const correct  = parseInt(sp.get('correct') ?? '0')
  const total    = parseInt(sp.get('total')   ?? '0')
  const timeSecs = parseInt(sp.get('time')    ?? '0')
  const wrong    = total - correct
  const mm = String(Math.floor(timeSecs / 60)).padStart(2,'0')
  const ss = String(timeSecs % 60).padStart(2,'0')

  const grade = score >= 75 ? { label:'Distinction', color:'text-green-600', bg:'bg-green-50', border:'border-green-200', icon:'🏆' }
             : score >= 65 ? { label:'Merit', color:'text-blue-600', bg:'bg-blue-50', border:'border-blue-200', icon:'🥈' }
             : score >= 55 ? { label:'Credit', color:'text-brand-600', bg:'bg-brand-50', border:'border-brand-200', icon:'🥉' }
             : score >= 35 ? { label:'Pass', color:'text-amber-600', bg:'bg-amber-50', border:'border-amber-200', icon:'✅' }
             :               { label:'Fail', color:'text-red-600', bg:'bg-red-50', border:'border-red-200', icon:'📚' }

  const circumference = 2 * Math.PI * 45
  const dash = circumference - (score / 100) * circumference

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Score card */}
        <div className={`bg-white rounded-3xl border-2 ${grade.border} shadow-lg p-8 text-center mb-6`}>
          <div className="text-4xl mb-3">{grade.icon}</div>

          {/* Circular progress */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f0f0" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none"
                stroke={score >= 65 ? '#1D9E75' : score >= 35 ? '#BA7517' : '#E24B4A'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dash}
                style={{transition:'stroke-dashoffset 1s ease'}} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-black text-gray-900">{score}%</div>
            </div>
          </div>

          <div className={`inline-block text-lg font-black px-4 py-1.5 rounded-full ${grade.bg} ${grade.color} ${grade.border} border mb-2`}>{grade.label}</div>
          <p className="text-sm text-gray-400">
            {correct} correct · {wrong} wrong · {mm}:{ss} taken
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon:'✅', label:'Correct',    value: correct, color:'text-green-600', bg:'bg-green-50' },
            { icon:'✗',  label:'Wrong',      value: wrong,   color:'text-red-600',   bg:'bg-red-50' },
            { icon:'📊', label:'Accuracy',   value: `${score}%`, color:'text-brand-600', bg:'bg-brand-50' },
            { icon:'⏱',  label:'Time taken', value: `${mm}:${ss}`, color:'text-gray-600', bg:'bg-gray-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feedback message */}
        <div className={`${grade.bg} ${grade.border} border rounded-2xl p-5 mb-6`}>
          <h3 className={`font-bold ${grade.color} mb-2`}>
            {score >= 75 ? '🎉 Excellent work!' : score >= 55 ? '👍 Good effort!' : score >= 35 ? '📖 Keep practising!' : '💪 Don\'t give up!'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {score >= 75 ? `You scored ${score}% — a distinction level result. You clearly understand this subject well. Try the next year's paper to maintain this standard.`
            : score >= 55 ? `You scored ${score}% — a solid result. Review the questions you got wrong and their explanations, then try again to push for distinction.`
            : score >= 35 ? `You scored ${score}% — you passed but there's room to improve. Focus on the topics you found difficult and consider booking a tutor session.`
            : `You scored ${score}% — this paper needs more preparation. Review the subject basics, practise the explanations, and try again. A tutor can help you improve faster.`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/past-papers/${id}/attempt`} className="flex-1">
            <Button variant="outline" size="lg" className="w-full">🔄 Retake this paper</Button>
          </Link>
          <Link href="/past-papers" className="flex-1">
            <Button size="lg" className="w-full">📚 More past papers</Button>
          </Link>
        </div>

        {score < 65 && (
          <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-sm text-gray-600 mb-3">Want to improve faster? Find a tutor who specialises in this subject.</p>
            <Link href="/tutors">
              <Button variant="outline" className="gap-2">👨‍🏫 Find a tutor →</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>}><ResultsContent /></Suspense>
}
