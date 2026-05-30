import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ conversations: [], userId: '' })
  try {
    const convs = await (prisma as any).conversation.findMany({
      where: { OR: [{ studentId: user.id }, { tutorId: user.id }] },
      orderBy: { lastAt: 'desc' },
      include: {
        student: { select: { id:true, name:true, image:true } },
        tutor:   { select: { id:true, name:true, image:true } },
      },
    })
    return NextResponse.json({ conversations: convs, userId: user.id })
  } catch {
    return NextResponse.json({ conversations: [], userId: user.id })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { tutorId } = await req.json()
  try {
    const existing = await (prisma as any).conversation.findFirst({
      where: { OR: [{ studentId: user.id, tutorId }, { studentId: tutorId, tutorId: user.id }] },
      include: { student: { select:{id:true,name:true,image:true} }, tutor: { select:{id:true,name:true,image:true} } },
    })
    if (existing) return NextResponse.json({ conversation: existing })
    const tutor = await prisma.user.findUnique({ where: { id: tutorId } })
    const conv = await (prisma as any).conversation.create({
      data: { studentId: user.id, tutorId, lastAt: new Date() },
      include: { student: { select:{id:true,name:true,image:true} }, tutor: { select:{id:true,name:true,image:true} } },
    })
    return NextResponse.json({ conversation: conv }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
