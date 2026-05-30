import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminUploadClient from './client'

export default async function AdminUploadPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/admin/login')
  return <AdminUploadClient />
}
