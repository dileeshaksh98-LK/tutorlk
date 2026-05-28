import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const year = searchParams.get('year')

  const where: any = { isActive: true }
  if (type) where.examType = type
  if (year) where.year = parseInt(year)

  try {
    const papers = await prisma.govPaper.findMany({
      where,
      orderBy: [{ examType: 'asc' }, { year: 'desc' }],
      include: { subject: true, _count: { select: { questions: true, govAttempts: true } } },
    })
    return NextResponse.json({ papers })
  } catch (err: any) {
    return NextResponse.json({ papers: [], error: err.message })
  }
}
