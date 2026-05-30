import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { conversationId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  try {
    const messages = await (prisma as any).directMessage.findMany({
      where: { conversationId: params.conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id:true, name:true, image:true } } },
    })
    return NextResponse.json({ messages, userId: user?.id })
  } catch {
    return NextResponse.json({ messages: [], userId: user?.id })
  }
}

export async function POST(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { content, fileUrl, fileName, fileSize, mimeType } = await req.json()
  if (!content?.trim() && !fileUrl) return NextResponse.json({ error: 'Content or file required' }, { status: 400 })
  try {
    const msg = await (prisma as any).directMessage.create({
      data: { conversationId: params.conversationId, senderId: user.id, content: content?.trim() || '', fileUrl: fileUrl||null, fileName: fileName||null, fileSize: fileSize||null, mimeType: mimeType||null },
      include: { sender: { select:{id:true,name:true,image:true} } },
    })
    await (prisma as any).conversation.update({
      where: { id: params.conversationId },
      data: { lastMessage: content?.trim() || `📎 ${fileName}`, lastAt: new Date() },
    })
    return NextResponse.json({ message: msg })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
