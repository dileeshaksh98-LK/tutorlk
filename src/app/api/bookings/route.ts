import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PLATFORM_FEE_RATE } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tutorId, studentId, subject, mode, scheduledAt, durationMins, notes } = body

    const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } })
    if (!tutor) return NextResponse.json({ error: "Tutor not found" }, { status: 404 })

    const totalAmount = Math.round((tutor.hourlyRate * durationMins) / 60)
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_RATE)
    const tutorEarning = totalAmount - platformFee

    const booking = await prisma.booking.create({
      data: { tutorId, studentId, subject, mode, scheduledAt: new Date(scheduledAt), durationMins, hourlyRate: tutor.hourlyRate, totalAmount, platformFee, tutorEarning, notes },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
