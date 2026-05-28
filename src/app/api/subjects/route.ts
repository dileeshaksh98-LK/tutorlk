import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ subjects })
  } catch {
    return NextResponse.json({ subjects: [] })
  }
}
