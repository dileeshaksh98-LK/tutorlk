// ============================================================
// TutorSpot — AI Tutor Ranking Engine
// ============================================================

export interface TutorScore {
  tutorId:         string
  totalScore:      number
  distanceScore:   number
  ratingScore:     number
  popularityScore: number
  priceScore:      number
  availabilityScore: number
  breakdown:       string
}

export interface RankingInput {
  tutor: {
    id:           string
    avgRating:    number
    totalReviews: number
    totalSessions:number
    hourlyRate:   number
    isVerified:   boolean
    trialClass:   boolean
    modes:        string[]
  }
  studentBudget?: number
  studentDistrict?: string
  tutorDistrict?:   string
}

// Haversine formula for distance between two lat/lng points
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ============================================================
// RANKING FORMULA
// TutorScore =
//   RatingScore      * 0.30
//   PopularityScore  * 0.20
//   PriceScore       * 0.15
//   VerifiedBonus    * 0.15
//   AvailabilityScore* 0.10
//   TrialBonus       * 0.10
// ============================================================
export function calculateTutorScore(input: RankingInput): TutorScore {
  const { tutor, studentBudget } = input

  // 1. Rating score (0–100)
  const ratingScore = tutor.avgRating > 0
    ? Math.min(100, (tutor.avgRating / 5) * 100)
    : 50

  // 2. Popularity score based on sessions + reviews
  const popularityScore = Math.min(100,
    (Math.log1p(tutor.totalSessions) * 15) +
    (Math.log1p(tutor.totalReviews) * 10)
  )

  // 3. Price compatibility score
  let priceScore = 70
  if (studentBudget && tutor.hourlyRate > 0) {
    const ratio = studentBudget / tutor.hourlyRate
    if (ratio >= 1.2) priceScore = 100
    else if (ratio >= 1.0) priceScore = 85
    else if (ratio >= 0.8) priceScore = 60
    else priceScore = 30
  }

  // 4. Verification bonus
  const verifiedBonus = tutor.isVerified ? 100 : 40

  // 5. Online availability score
  const availabilityScore = tutor.modes.includes('ONLINE') ? 90 : 60

  // 6. Trial class bonus
  const trialBonus = tutor.trialClass ? 100 : 50

  // Weighted total
  const totalScore = Math.round(
    ratingScore      * 0.30 +
    popularityScore  * 0.20 +
    priceScore       * 0.15 +
    verifiedBonus    * 0.15 +
    availabilityScore* 0.10 +
    trialBonus       * 0.10
  )

  return {
    tutorId: tutor.id,
    totalScore,
    distanceScore: 0,
    ratingScore:   Math.round(ratingScore),
    popularityScore: Math.round(popularityScore),
    priceScore:    Math.round(priceScore),
    availabilityScore: Math.round(availabilityScore),
    breakdown: `Rating:${Math.round(ratingScore)} Pop:${Math.round(popularityScore)} Price:${Math.round(priceScore)} Verified:${verifiedBonus}`,
  }
}

// Sort tutors by score
export function rankTutors<T extends { id: string; avgRating: number; totalReviews: number; totalSessions: number; hourlyRate: number; isVerified: boolean; trialClass: boolean; modes?: string[] }>(
  tutors: T[],
  options?: { budget?: number }
): T[] {
  const scored = tutors.map(t => ({
    tutor: t,
    score: calculateTutorScore({
      tutor: { ...t, modes: (t as any).modes?.map((m: any) => m.mode ?? m) ?? [] },
      studentBudget: options?.budget,
    }),
  }))
  scored.sort((a, b) => b.score.totalScore - a.score.totalScore)
  return scored.map(s => s.tutor)
}
