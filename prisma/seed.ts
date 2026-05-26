import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const PROVINCES = [
  { name: 'Western',       slug: 'western',       districts: [
    { name: 'Colombo',  slug: 'colombo',  cities: ['Colombo 3','Colombo 5','Colombo 7','Nugegoda','Dehiwala','Mount Lavinia','Maharagama','Kotte','Rajagiriya','Boralesgamuwa'] },
    { name: 'Gampaha',  slug: 'gampaha',  cities: ['Gampaha','Negombo','Ja-Ela','Wattala','Kelaniya','Kadawatha'] },
    { name: 'Kalutara', slug: 'kalutara', cities: ['Kalutara','Panadura','Horana','Beruwala','Aluthgama'] },
  ]},
  { name: 'Central',       slug: 'central',       districts: [
    { name: 'Kandy',        slug: 'kandy',        cities: ['Kandy City','Peradeniya','Katugastota','Gampola','Kundasale'] },
    { name: 'Matale',       slug: 'matale',       cities: ['Matale','Dambulla','Sigiriya'] },
    { name: 'Nuwara Eliya', slug: 'nuwara-eliya', cities: ['Nuwara Eliya','Hatton','Talawakele'] },
  ]},
  { name: 'Southern',      slug: 'southern',      districts: [
    { name: 'Galle',       slug: 'galle',       cities: ['Galle','Hikkaduwa','Ambalangoda'] },
    { name: 'Matara',      slug: 'matara',      cities: ['Matara','Weligama','Dikwella'] },
    { name: 'Hambantota',  slug: 'hambantota',  cities: ['Hambantota','Tangalle','Tissamaharama'] },
  ]},
  { name: 'Northern',      slug: 'northern',      districts: [
    { name: 'Jaffna',      slug: 'jaffna',      cities: ['Jaffna','Nallur','Chavakachcheri'] },
    { name: 'Vavuniya',    slug: 'vavuniya',    cities: ['Vavuniya'] },
    { name: 'Mannar',      slug: 'mannar',      cities: ['Mannar'] },
  ]},
  { name: 'North Western', slug: 'north-western', districts: [
    { name: 'Kurunegala', slug: 'kurunegala', cities: ['Kurunegala','Kuliyapitiya','Maho','Wariyapola'] },
    { name: 'Puttalam',   slug: 'puttalam',   cities: ['Puttalam','Chilaw','Wennappuwa'] },
  ]},
  { name: 'Sabaragamuwa',  slug: 'sabaragamuwa',  districts: [
    { name: 'Ratnapura', slug: 'ratnapura', cities: ['Ratnapura','Embilipitiya','Balangoda'] },
    { name: 'Kegalle',   slug: 'kegalle',   cities: ['Kegalle','Mawanella','Warakapola'] },
  ]},
  { name: 'Uva',           slug: 'uva',           districts: [
    { name: 'Badulla',    slug: 'badulla',    cities: ['Badulla','Bandarawela','Haputale','Welimada'] },
    { name: 'Monaragala', slug: 'monaragala', cities: ['Monaragala','Bibile'] },
  ]},
  { name: 'North Central', slug: 'north-central', districts: [
    { name: 'Anuradhapura', slug: 'anuradhapura', cities: ['Anuradhapura','Kekirawa','Mihintale'] },
    { name: 'Polonnaruwa',  slug: 'polonnaruwa',  cities: ['Polonnaruwa','Kaduruwela'] },
  ]},
  { name: 'Eastern',       slug: 'eastern',       districts: [
    { name: 'Trincomalee', slug: 'trincomalee', cities: ['Trincomalee','Kantale'] },
    { name: 'Batticaloa',  slug: 'batticaloa',  cities: ['Batticaloa','Kalmunai'] },
    { name: 'Ampara',      slug: 'ampara',      cities: ['Ampara','Sammanthurai'] },
  ]},
]

const SUBJECTS = [
  { name: 'Combined Maths', slug: 'combined-maths', category: 'A/L Science',  icon: '📐' },
  { name: 'Physics',        slug: 'physics',        category: 'A/L Science',  icon: '⚡' },
  { name: 'Chemistry',      slug: 'chemistry',      category: 'A/L Science',  icon: '🧪' },
  { name: 'Biology',        slug: 'biology',        category: 'A/L Science',  icon: '🔬' },
  { name: 'English',        slug: 'english',        category: 'Languages',    icon: '📚' },
  { name: 'Sinhala',        slug: 'sinhala',        category: 'Languages',    icon: '🇱🇰' },
  { name: 'Tamil',          slug: 'tamil',          category: 'Languages',    icon: '✍️' },
  { name: 'Mathematics',    slug: 'mathematics',    category: 'O/L Core',     icon: '🔢' },
  { name: 'Science',        slug: 'science',        category: 'O/L Core',     icon: '🔬' },
  { name: 'Economics',      slug: 'economics',      category: 'A/L Commerce', icon: '📊' },
  { name: 'Accounting',     slug: 'accounting',     category: 'A/L Commerce', icon: '🧾' },
  { name: 'ICT',            slug: 'ict',            category: 'Technology',   icon: '💻' },
  { name: 'Piano',          slug: 'piano',          category: 'Music',        icon: '🎹' },
  { name: 'Violin',         slug: 'violin',         category: 'Music',        icon: '🎻' },
  { name: 'Swimming',       slug: 'swimming',       category: 'Sports',       icon: '🏊' },
]

async function main() {
  console.log('Seeding database...')

  for (const province of PROVINCES) {
    const p = await prisma.province.upsert({
      where:  { slug: province.slug },
      update: {},
      create: { name: province.name, slug: province.slug },
    })
    for (const district of province.districts) {
      const d = await prisma.district.upsert({
        where:  { slug: district.slug },
        update: {},
        create: { name: district.name, slug: district.slug, provinceId: p.id },
      })
      for (const cityName of district.cities) {
        const citySlug = cityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        await prisma.city.upsert({
          where:  { slug: citySlug },
          update: {},
          create: { name: cityName, slug: citySlug, districtId: d.id },
        })
      }
    }
  }

  for (const subject of SUBJECTS) {
    await prisma.subject.upsert({
      where:  { slug: subject.slug },
      update: {},
      create: subject,
    })
  }

  // Demo tutor
  const pw = await bcrypt.hash('tutor123', 12)
  const tutorUser = await prisma.user.upsert({
    where:  { email: 'nuwan@demo.com' },
    update: {},
    create: { name: 'Nuwan Karunaratne', email: 'nuwan@demo.com', passwordHash: pw, role: 'TUTOR', emailVerified: new Date() },
  })
  const colombo  = await prisma.district.findUnique({ where: { slug: 'colombo' } })
  const mathSubj = await prisma.subject.findUnique({ where: { slug: 'combined-maths' } })

  if (colombo && mathSubj) {
    const existing = await prisma.tutorProfile.findUnique({ where: { userId: tutorUser.id } })
    if (!existing) {
      const tp = await prisma.tutorProfile.create({
        data: {
          userId: tutorUser.id, bio: 'BSc (Hons) Mathematics, University of Kelaniya. 6 years teaching A/L Combined Maths. 92% of students scored A or B.',
          qualification: 'BSc (Hons) Mathematics', university: 'University of Kelaniya',
          experience: 6, hourlyRate: 1800, trialClass: true, isVerified: true,
          avgRating: 4.9, totalReviews: 84, totalSessions: 420,
        },
      })
      await prisma.tutorSubject.create({ data: { tutorProfileId: tp.id, subjectId: mathSubj.id, grade: 'A/L' } })
      await prisma.tutorLocation.create({ data: { tutorProfileId: tp.id, districtId: colombo.id } })
      await prisma.tutorSessionMode.createMany({ data: [{ tutorProfileId: tp.id, mode: 'ONLINE' }, { tutorProfileId: tp.id, mode: 'HOME_VISIT' }] })
    }
  }

  // Demo student
  const spw = await bcrypt.hash('student123', 12)
  const studentUser = await prisma.user.upsert({
    where:  { email: 'ayesha@demo.com' },
    update: {},
    create: { name: 'Ayesha Perera', email: 'ayesha@demo.com', passwordHash: spw, role: 'STUDENT', emailVerified: new Date() },
  })
  const existingStudent = await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } })
  if (!existingStudent) {
    await prisma.studentProfile.create({ data: { userId: studentUser.id, grade: 'A/L', school: 'Visakha Vidyalaya', district: 'Colombo' } })
  }

  console.log('✅ Seed complete')
  console.log('Demo tutor:   nuwan@demo.com / tutor123')
  console.log('Demo student: ayesha@demo.com / student123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
