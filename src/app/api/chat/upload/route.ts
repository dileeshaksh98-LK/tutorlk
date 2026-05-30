import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const conversationId = formData.get('conversationId') as string
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > 20*1024*1024) return NextResponse.json({ error: 'Max 20MB' }, { status: 400 })
  const ext  = file.name.split('.').pop()
  const path = `chat/${conversationId}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const sb = supabaseAdmin()
  const { error } = await sb.storage.from('resources').upload(path, buffer, { contentType: file.type, upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const { data } = sb.storage.from('resources').getPublicUrl(path)
  return NextResponse.json({ fileUrl: data.publicUrl, fileName: file.name, fileSize: file.size, mimeType: file.type })
}
