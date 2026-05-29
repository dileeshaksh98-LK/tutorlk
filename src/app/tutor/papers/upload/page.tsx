'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const EXAM_TYPES = ['SCHOLARSHIP', 'OL', 'AL']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i)

export default function UploadPDFPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [examType, setExamType] = useState('OL')
  const [subject, setSubject] = useState('')
  const [year, setYear] = useState(String(CURRENT_YEAR - 1))
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  function handleFile(f: File) {
    if (f.type !== 'application/pdf') { setError('Please select a PDF file.'); return }
    if (f.size > 20 * 1024 * 1024) { setError('File must be under 20 MB.'); return }
    setError('')
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ''))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please select a PDF file.'); return }
    if (!title.trim()) { setError('Please enter a paper title.'); return }
    if (!subject.trim()) { setError('Please enter a subject.'); return }

    setUploading(true); setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title.trim())
    fd.append('examType', examType)
    fd.append('subject', subject.trim())
    fd.append('year', year)

    try {
      const res = await fetch('/api/papers/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed.'); return }
      router.push(`/tutor/papers/review/${data.paperId}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 to-brand-900 text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm mb-4 block">← Back</button>
          <h1 className="text-2xl font-bold">Upload PDF Past Paper</h1>
          <p className="text-gray-400 text-sm mt-1">Auto-extract MCQ questions from a government past paper PDF</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragOver ? 'border-brand-400 bg-brand-50' :
              file ? 'border-green-400 bg-green-50' :
              'border-gray-300 bg-white hover:border-brand-300 hover:bg-brand-50/30'
            }`}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
            {file ? (
              <div>
                <div className="text-4xl mb-2">📄</div>
                <p className="font-semibold text-green-700">{file.name}</p>
                <p className="text-sm text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB — click to change</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">📁</div>
                <p className="font-semibold text-gray-700">Drop your PDF here or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">Max 20 MB · Text-based PDFs give the best extraction results</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Paper Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. G.C.E. O/L Mathematics 2023"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Level</label>
                <select value={examType} onChange={e => setExamType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
                  {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select value={year} onChange={e => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Tip:</strong> For best extraction results, use text-selectable PDFs (not scanned images).
            If you have a scanned paper, consider using an online OCR tool first.
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={uploading || !file}>
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading & processing…
              </span>
            ) : '🚀 Upload & Extract Questions'}
          </Button>
        </form>
      </div>
    </div>
  )
}
