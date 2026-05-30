'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  overview: {
    totalTutors:number; totalStudents:number; verifiedTutors:number
    newTutors30:number; newStudents30:number; totalBookings:number
    bookings30:number; completedBookings:number; totalRevenue:number
    revenue30:number; totalPapers:number; totalAttempts:number; platformRevenue:number
  }
  recentUsers: { id:string; name:string; email:string; role:string; createdAt:string }[]
  topSubjects:  { name:string; count:number }[]
}

function StatCard({ icon, label, value, sub, color='brand' }:{ icon:string; label:string; value:string|number; sub?:string; color?:string }) {
  const colors: Record<string,string> = {
    brand:  'from-brand-400 to-brand-600',
    green:  'from-green-400 to-emerald-600',
    blue:   'from-blue-400 to-blue-600',
    amber:  'from-amber-400 to-amber-600',
    purple: 'from-purple-400 to-purple-600',
    red:    'from-red-400 to-red-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]||colors.brand} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>{icon}</div>
      <div>
        <div className="text-2xl font-black text-gray-900">{typeof value==='number'?value.toLocaleString():value}</div>
        <div className="text-sm font-medium text-gray-600">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function RoleBadge({ role }:{ role:string }) {
  const c = role==='TUTOR' ? 'bg-brand-50 text-brand-700 border-brand-200'
          : role==='STUDENT' ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-red-50 text-red-700 border-red-200'
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c}`}>{role}</span>
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats|null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch('/api/admin/stats').then(r=>r.json()).then(d => {
      if (d.error) setError(d.error)
      else setStats(d)
      setLoading(false)
    }).catch(()=>{ setError('Failed to load'); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-bold text-gray-700 mb-2">Access Denied</h2>
        <p className="text-gray-400 text-sm">{error}</p>
        <Link href="/" className="mt-4 inline-block text-brand-600 text-sm hover:underline">← Go home</Link>
      </div>
    </div>
  )

  const o = stats!.overview

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">T</div>
                <span className="text-gray-400 text-sm">TutorSpot</span>
                <span className="text-gray-600 text-sm">/</span>
                <span className="text-sm font-medium">Admin Dashboard</span>
              </div>
              <h1 className="text-2xl font-bold">Platform Overview</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time statistics for TutorSpot</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/tutors" className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
                👨‍🏫 Manage Tutors
              </Link>
              <Link href="/admin/past-papers/upload" className="px-4 py-2 bg-brand-400 hover:bg-brand-500 rounded-xl text-sm font-medium transition-colors">
                📄 Upload Paper
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Users overview */}
        <div>
          <h2 className="text-base font-bold text-gray-700 mb-4">👥 Users</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon="👨‍🏫" label="Total tutors"   value={o.totalTutors}   color="brand"/>
            <StatCard icon="🎓" label="Total students" value={o.totalStudents} color="blue"/>
            <StatCard icon="✅" label="Verified tutors" value={o.verifiedTutors} sub={`${Math.round(o.verifiedTutors/(o.totalTutors||1)*100)}% verified`} color="green"/>
            <StatCard icon="📈" label="New tutors (30d)" value={o.newTutors30}   color="amber"/>
            <StatCard icon="📊" label="New students (30d)" value={o.newStudents30} color="amber"/>
            <StatCard icon="👥" label="Total users"    value={o.totalTutors+o.totalStudents} color="purple"/>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <h2 className="text-base font-bold text-gray-700 mb-4">📅 Bookings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon="📅" label="Total bookings" value={o.totalBookings} color="blue"/>
            <StatCard icon="🆕" label="Bookings (30d)"  value={o.bookings30}  color="green"/>
            <StatCard icon="✅" label="Completed"       value={o.completedBookings} sub={`${Math.round(o.completedBookings/(o.totalBookings||1)*100)}% completion rate`} color="brand"/>
            <StatCard icon="💰" label="Total revenue"   value={`LKR ${o.totalRevenue.toLocaleString()}`} color="amber"/>
          </div>
        </div>

        {/* Revenue */}
        <div>
          <h2 className="text-base font-bold text-gray-700 mb-4">💰 Revenue</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl p-5 text-white shadow-md">
              <div className="text-3xl font-black mb-1">LKR {o.platformRevenue.toLocaleString()}</div>
              <div className="text-brand-100 text-sm font-medium">Platform revenue (5% fee)</div>
              <div className="text-brand-200 text-xs mt-1">Total all time</div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-5 text-white shadow-md">
              <div className="text-3xl font-black mb-1">LKR {o.revenue30.toLocaleString()}</div>
              <div className="text-green-100 text-sm font-medium">Revenue (last 30 days)</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-5 text-white shadow-md">
              <div className="text-3xl font-black mb-1">LKR {o.totalRevenue.toLocaleString()}</div>
              <div className="text-blue-100 text-sm font-medium">Total booking value</div>
              <div className="text-blue-200 text-xs mt-1">Tutor earnings + platform fee</div>
            </div>
          </div>
        </div>

        {/* Past papers */}
        <div>
          <h2 className="text-base font-bold text-gray-700 mb-4">📄 Past Papers</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <StatCard icon="📄" label="Total papers"   value={o.totalPapers}   color="purple"/>
            <StatCard icon="📝" label="Total attempts" value={o.totalAttempts} color="blue"/>
          </div>
        </div>

        {/* Two column: recent users + top subjects */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Recent users */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Recently joined</h3>
              <span className="text-xs text-gray-400">Last 10 users</span>
            </div>
            <div className="divide-y divide-gray-50">
              {stats!.recentUsers.map(u=>(
                <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                    <div className="text-xs text-gray-400 truncate">{u.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RoleBadge role={u.role}/>
                    <span className="text-xs text-gray-300">{new Date(u.createdAt).toLocaleDateString('en-LK',{day:'numeric',month:'short'})}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top subjects */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Most popular subjects</h3>
              <p className="text-xs text-gray-400 mt-0.5">By number of tutors offering</p>
            </div>
            <div className="p-5 space-y-3">
              {stats!.topSubjects.map((s,i)=>{
                const max = stats!.topSubjects[0]?.count||1
                const pct = Math.round((s.count/max)*100)
                const colors = ['bg-brand-400','bg-blue-400','bg-green-400','bg-amber-400','bg-purple-400','bg-red-400','bg-pink-400','bg-indigo-400']
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium">{i+1}</span>
                        <span className="text-sm font-medium text-gray-700">{s.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{s.count} tutors</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i]||'bg-brand-400'} rounded-full transition-all duration-700`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4">Quick actions</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href:'/admin/tutors',              icon:'👨‍🏫', label:'Manage tutors',       sub:'Verify & view profiles' },
              { href:'/admin/past-papers/upload',  icon:'📄', label:'Upload past paper',    sub:'AI PDF extraction' },
              { href:'/past-papers',               icon:'📚', label:'View past papers',     sub:'See live library' },
              { href:'/tutors',                    icon:'🔍', label:'View tutor search',    sub:'Test search page' },
            ].map(a=>(
              <Link key={a.href} href={a.href}
                className="group flex items-center gap-3 p-4 border-2 border-gray-100 rounded-2xl hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-800 group-hover:text-brand-700">{a.label}</div>
                  <div className="text-xs text-gray-400">{a.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
