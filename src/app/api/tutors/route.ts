import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get("subject")
  const district = searchParams.get("district")
  const verified = searchParams.get("verified")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "12")

  try {
    const where: Record<string, unknown> = { isActive: true }
    if (verified === "true") where.isVerified = true
    if (subject) where.subjects = { some: { subject: { slug: subject } } }
    if (district) where.locations = { some: { district: { slug: district } } }

    const [tutors, total] = await Promise.all([
      prisma.tutor.findMany({
        where,
        include: {
          user: { select: { name: true, image: true } },
          subjects: { include: { subject: true } },
          locations: { include: { district: true, city: true } },
          sessionModes: true,
        },
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tutor.count({ where }),
    ])

    return NextResponse.json({ tutors, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("Tutors API error:", error)
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 })
  }
}
