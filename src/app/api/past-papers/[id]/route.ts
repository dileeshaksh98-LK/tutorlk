import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paper = await (prisma as any).govPaper.findUnique({
      where: { id: params.id },
      include: {
        subject: true,
        questions: { orderBy: { orderNum: 'asc' } },
        _count: { select: { attempts: true } },
      },
    })
    if (!paper) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ paper })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
