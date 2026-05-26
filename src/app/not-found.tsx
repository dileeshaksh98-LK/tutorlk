import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <GraduationCap className="w-12 h-12 text-emerald-600 mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">This page could not be found.</p>
      <Link href="/" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
        Go back home
      </Link>
    </div>
  )
}
