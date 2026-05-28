import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { bio, qualification, university, experience, subjects, grade, mediums, districts, modes, hourlyRate, trialClass, travelRadius } = await req.json()

  try {
    // Upsert tutor profile
    const tp = await prisma.tutorProfile.upsert({
      where:  { userId: user.id },
      update: { bio, qualification, university, experience, hourlyRate, trialClass, travelRadius },
      create: { userId: user.id, bio, qualification, university, experience, hourlyRate, trialClass, travelRadius },
    })

    // Update user role to TUTOR
    await prisma.user.update({ where: { id: user.id }, data: { role: 'TUTOR' } })

    // Clear and re-add subjects
    await prisma.tutorSubject.deleteMany({ where: { tutorProfileId: tp.id } })
    for (const subjectId of (subjects as string[])) {
      const subject = await prisma.subject.findFirst({ where: { id: subjectId } })
      if (subject) {
        await prisma.tutorSubject.create({ data: { tutorProfileId: tp.id, subjectId: subject.id, grade } })
      }
    }

    // Clear and re-add session modes
    await prisma.tutorSessionMode.deleteMany({ where: { tutorProfileId: tp.id } })
    for (const mode of (modes as string[])) {
      await prisma.tutorSessionMode.create({ data: { tutorProfileId: tp.id, mode: mode as any } })
    }

    // Clear and re-add locations
    await prisma.tutorLocation.deleteMany({ where: { tutorProfileId: tp.id } })
    for (const districtSlug of (districts as string[])) {
      const district = await prisma.district.findUnique({ where: { slug: districtSlug } })
      if (district) {
        await prisma.tutorLocation.create({ data: { tutorProfileId: tp.id, districtId: district.id } })
      }
    }

    return NextResponse.json({ success: true, profileId: tp.id })
  } catch (err: any) {
    console.error('Tutor setup error:', err)
    return NextResponse.json({ error: 'Setup failed: ' + err.message }, { status: 500 })
  }
}
