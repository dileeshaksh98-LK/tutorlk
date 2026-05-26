export type UserRole = 'STUDENT' | 'TUTOR' | 'ADMIN'
export type SessionMode = 'ONLINE' | 'HOME_VISIT' | 'TUITION_CENTRE'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
export type PaperType = 'MODEL_PAPER' | 'PAST_PAPER' | 'TOPIC_TEST' | 'QUICK_QUIZ'
export type QuestionType = 'MCQ' | 'STRUCTURED' | 'ESSAY'

export interface TutorSearchParams {
  subject?: string
  district?: string
  city?: string
  grade?: string
  mode?: SessionMode
  minRate?: number
  maxRate?: number
  verified?: boolean
  trial?: boolean
  page?: number
}

export interface SearchResult {
  tutors: TutorCard[]
  total: number
  page: number
  pages: number
}

export interface TutorCard {
  id: string
  userId: string
  name: string
  image?: string
  bio?: string
  qualification?: string
  experience: number
  hourlyRate: number
  trialClass: boolean
  isVerified: boolean
  avgRating: number
  totalReviews: number
  totalSessions: number
  subjects: { name: string; grade: string }[]
  locations: { district: string; city?: string }[]
  modes: SessionMode[]
}

export interface BookingFormData {
  tutorProfileId: string
  subjectId: string
  sessionMode: SessionMode
  durationMins: number
  scheduledAt: string
  notes?: string
}
