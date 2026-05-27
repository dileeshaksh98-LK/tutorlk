// ============================================================
// Sri Lankan Curriculum — Complete Subject & Stream Data
// ============================================================

export type Medium = 'SINHALA' | 'TAMIL' | 'ENGLISH'
export type EducationLevel = 'SCHOLARSHIP' | 'GRADE_6_9' | 'OL' | 'AL' | 'REVISION' | 'FOUNDATION' | 'PROFESSIONAL'
export type ALStream = 'SCIENCE' | 'COMMERCE' | 'ARTS' | 'TECHNOLOGY'

export interface Subject {
  id: string
  name: string
  sinhalaName?: string
  tamilName?: string
  category: string
  level: EducationLevel[]
  stream?: ALStream[]
  icon: string
  popular: boolean
  keywords: string[]
}

// ============================================================
// SCHOLARSHIP (Grade 5)
// ============================================================
export const SCHOLARSHIP_SUBJECTS: Subject[] = [
  { id: 'sch_maths',    name: 'Mathematics',     sinhalaName: 'ගණිතය',       category: 'Scholarship', level: ['SCHOLARSHIP'], icon: '🔢', popular: true,  keywords: ['maths', 'mathematics', 'ganithaya'] },
  { id: 'sch_sinhala',  name: 'Sinhala',         sinhalaName: 'සිංහල',        category: 'Scholarship', level: ['SCHOLARSHIP'], icon: '📖', popular: true,  keywords: ['sinhala', 'language'] },
  { id: 'sch_english',  name: 'English',         sinhalaName: 'ඉංග්‍රීසි',     category: 'Scholarship', level: ['SCHOLARSHIP'], icon: '🇬🇧', popular: true,  keywords: ['english'] },
  { id: 'sch_science',  name: 'Environment',     sinhalaName: 'පරිසරය',       category: 'Scholarship', level: ['SCHOLARSHIP'], icon: '🌿', popular: false, keywords: ['environment', 'science'] },
]

// ============================================================
// O/L CORE SUBJECTS
// ============================================================
export const OL_CORE_SUBJECTS: Subject[] = [
  { id: 'ol_maths',       name: 'Mathematics',          sinhalaName: 'ගණිතය',           category: 'O/L Core',     level: ['GRADE_6_9', 'OL'], icon: '🔢', popular: true,  keywords: ['maths', 'mathematics'] },
  { id: 'ol_science',     name: 'Science',              sinhalaName: 'විද්‍යාව',           category: 'O/L Core',     level: ['GRADE_6_9', 'OL'], icon: '🔬', popular: true,  keywords: ['science', 'vidyawa'] },
  { id: 'ol_english',     name: 'English',              sinhalaName: 'ඉංග්‍රීසි',          category: 'O/L Core',     level: ['GRADE_6_9', 'OL'], icon: '🇬🇧', popular: true,  keywords: ['english'] },
  { id: 'ol_sinhala',     name: 'Sinhala',              sinhalaName: 'සිංහල',             category: 'O/L Core',     level: ['GRADE_6_9', 'OL'], icon: '📖', popular: true,  keywords: ['sinhala'] },
  { id: 'ol_tamil',       name: 'Tamil',                tamilName:  'தமிழ்',             category: 'O/L Core',     level: ['GRADE_6_9', 'OL'], icon: '✍️', popular: false, keywords: ['tamil'] },
  { id: 'ol_history',     name: 'History',              sinhalaName: 'ඉතිහාසය',          category: 'O/L Core',     level: ['GRADE_6_9', 'OL'], icon: '📜', popular: false, keywords: ['history', 'ithihasaya'] },
  { id: 'ol_buddhism',    name: 'Buddhism',             sinhalaName: 'බෞද්ධ ධර්මය',      category: 'O/L Religion', level: ['GRADE_6_9', 'OL'], icon: '☸️', popular: false, keywords: ['buddhism', 'dharma'] },
  { id: 'ol_christianity',name: 'Christianity',                                          category: 'O/L Religion', level: ['GRADE_6_9', 'OL'], icon: '✝️', popular: false, keywords: ['christianity'] },
  { id: 'ol_islam',       name: 'Islam',                                                 category: 'O/L Religion', level: ['GRADE_6_9', 'OL'], icon: '☪️', popular: false, keywords: ['islam'] },
  { id: 'ol_hinduism',    name: 'Hinduism',                                              category: 'O/L Religion', level: ['GRADE_6_9', 'OL'], icon: '🕉️', popular: false, keywords: ['hinduism'] },
]

// ============================================================
// O/L BASKET SUBJECTS
// ============================================================
export const OL_BASKET_SUBJECTS: Subject[] = [
  { id: 'ol_commerce',    name: 'Commerce',             sinhalaName: 'වාණිජ විද්‍යාව',   category: 'O/L Basket', level: ['OL'], icon: '💼', popular: true,  keywords: ['commerce', 'business'] },
  { id: 'ol_accounting',  name: 'Accounting',           sinhalaName: 'ගිණුම්කරණය',       category: 'O/L Basket', level: ['OL'], icon: '🧾', popular: true,  keywords: ['accounting', 'accounts'] },
  { id: 'ol_ict',         name: 'ICT',                  sinhalaName: 'තොරතුරු තාක්ෂණය',  category: 'O/L Basket', level: ['OL'], icon: '💻', popular: true,  keywords: ['ict', 'computer', 'technology'] },
  { id: 'ol_art',         name: 'Art',                  sinhalaName: 'චිත්‍ර කලාව',       category: 'O/L Basket', level: ['OL'], icon: '🎨', popular: false, keywords: ['art', 'drawing'] },
  { id: 'ol_music',       name: 'Music',                sinhalaName: 'සංගීතය',            category: 'O/L Basket', level: ['OL'], icon: '🎵', popular: false, keywords: ['music', 'sangeetaya'] },
  { id: 'ol_dancing',     name: 'Dancing',              sinhalaName: 'නර්තනය',            category: 'O/L Basket', level: ['OL'], icon: '💃', popular: false, keywords: ['dancing', 'dance'] },
  { id: 'ol_drama',       name: 'Drama',                sinhalaName: 'නාට්‍ය',             category: 'O/L Basket', level: ['OL'], icon: '🎭', popular: false, keywords: ['drama', 'theatre'] },
  { id: 'ol_geography',   name: 'Geography',            sinhalaName: 'භූගෝල විද්‍යාව',   category: 'O/L Basket', level: ['OL'], icon: '🌍', popular: false, keywords: ['geography'] },
  { id: 'ol_japanese',    name: 'Japanese',                                              category: 'O/L Basket', level: ['OL'], icon: '🇯🇵', popular: false, keywords: ['japanese', 'japan'] },
  { id: 'ol_french',      name: 'French',                                                category: 'O/L Basket', level: ['OL'], icon: '🇫🇷', popular: false, keywords: ['french', 'france'] },
  { id: 'ol_chinese',     name: 'Chinese',                                               category: 'O/L Basket', level: ['OL'], icon: '🇨🇳', popular: false, keywords: ['chinese', 'china'] },
]

// ============================================================
// A/L SCIENCE STREAM
// ============================================================
export const AL_SCIENCE_SUBJECTS: Subject[] = [
  { id: 'al_combmaths',  name: 'Combined Mathematics', sinhalaName: 'සංයුක්ත ගණිතය',   category: 'A/L Science', level: ['AL'], stream: ['SCIENCE'],    icon: '📐', popular: true,  keywords: ['combined maths', 'maths', 'mathematics'] },
  { id: 'al_physics',    name: 'Physics',              sinhalaName: 'භෞතික විද්‍යාව',    category: 'A/L Science', level: ['AL'], stream: ['SCIENCE'],    icon: '⚡', popular: true,  keywords: ['physics'] },
  { id: 'al_chemistry',  name: 'Chemistry',            sinhalaName: 'රසායන විද්‍යාව',    category: 'A/L Science', level: ['AL'], stream: ['SCIENCE'],    icon: '🧪', popular: true,  keywords: ['chemistry'] },
  { id: 'al_biology',    name: 'Biology',              sinhalaName: 'ජීව විද්‍යාව',       category: 'A/L Science', level: ['AL'], stream: ['SCIENCE'],    icon: '🔬', popular: true,  keywords: ['biology'] },
  { id: 'al_ict_sci',    name: 'ICT',                  sinhalaName: 'තොරතුරු තාක්ෂණය',   category: 'A/L Science', level: ['AL'], stream: ['SCIENCE'],    icon: '💻', popular: false, keywords: ['ict', 'computer'] },
]

// ============================================================
// A/L COMMERCE STREAM
// ============================================================
export const AL_COMMERCE_SUBJECTS: Subject[] = [
  { id: 'al_accounting',  name: 'Accounting',          sinhalaName: 'ගිණුම්කරණය',       category: 'A/L Commerce', level: ['AL'], stream: ['COMMERCE'], icon: '🧾', popular: true,  keywords: ['accounting', 'accounts'] },
  { id: 'al_business',    name: 'Business Studies',    sinhalaName: 'ව්‍යාපාර අධ්‍යයනය', category: 'A/L Commerce', level: ['AL'], stream: ['COMMERCE'], icon: '💼', popular: true,  keywords: ['business', 'business studies'] },
  { id: 'al_economics',   name: 'Economics',           sinhalaName: 'ආර්ථික විද්‍යාව',   category: 'A/L Commerce', level: ['AL'], stream: ['COMMERCE'], icon: '📊', popular: true,  keywords: ['economics'] },
  { id: 'al_ict_com',     name: 'ICT',                 sinhalaName: 'තොරතුරු තාක්ෂණය',   category: 'A/L Commerce', level: ['AL'], stream: ['COMMERCE'], icon: '💻', popular: false, keywords: ['ict'] },
]

// ============================================================
// A/L ARTS STREAM
// ============================================================
export const AL_ARTS_SUBJECTS: Subject[] = [
  { id: 'al_sinhala',     name: 'Sinhala',              sinhalaName: 'සිංහල',             category: 'A/L Arts', level: ['AL'], stream: ['ARTS'], icon: '📖', popular: true,  keywords: ['sinhala'] },
  { id: 'al_english',     name: 'English',              sinhalaName: 'ඉංග්‍රීසි',          category: 'A/L Arts', level: ['AL'], stream: ['ARTS'], icon: '🇬🇧', popular: true,  keywords: ['english'] },
  { id: 'al_geography',   name: 'Geography',            sinhalaName: 'භූගෝල විද්‍යාව',   category: 'A/L Arts', level: ['AL'], stream: ['ARTS'], icon: '🌍', popular: false, keywords: ['geography'] },
  { id: 'al_political',   name: 'Political Science',    sinhalaName: 'දේශපාලන විද්‍යාව',  category: 'A/L Arts', level: ['AL'], stream: ['ARTS'], icon: '🏛️', popular: false, keywords: ['political science', 'politics'] },
  { id: 'al_logic',       name: 'Logic',                sinhalaName: 'තර්කශාස්ත්‍රය',      category: 'A/L Arts', level: ['AL'], stream: ['ARTS'], icon: '🧠', popular: false, keywords: ['logic'] },
  { id: 'al_media',       name: 'Media',                sinhalaName: 'මාධ්‍ය',              category: 'A/L Arts', level: ['AL'], stream: ['ARTS'], icon: '📺', popular: false, keywords: ['media'] },
  { id: 'al_buddhist_civ',name: 'Buddhist Civilization',sinhalaName: 'බෞද්ධ ශිෂ්ටාචාරය', category: 'A/L Arts', level: ['AL'], stream: ['ARTS'], icon: '☸️', popular: false, keywords: ['buddhist civilization'] },
  { id: 'al_history',     name: 'History',              sinhalaName: 'ඉතිහාසය',           category: 'A/L Arts', level: ['AL'], stream: ['ARTS'], icon: '📜', popular: false, keywords: ['history'] },
]

// ============================================================
// A/L TECHNOLOGY STREAM
// ============================================================
export const AL_TECH_SUBJECTS: Subject[] = [
  { id: 'al_eng_tech',    name: 'Engineering Technology', sinhalaName: 'ඉංජිනේරු තාක්ෂණය',   category: 'A/L Technology', level: ['AL'], stream: ['TECHNOLOGY'], icon: '⚙️', popular: true,  keywords: ['engineering', 'technology'] },
  { id: 'al_sci_tech',    name: 'Science for Technology', sinhalaName: 'තාක්ෂණය සඳහා විද්‍යාව', category: 'A/L Technology', level: ['AL'], stream: ['TECHNOLOGY'], icon: '🔧', popular: false, keywords: ['science for technology'] },
  { id: 'al_ict_tech',    name: 'ICT',                    sinhalaName: 'තොරතුරු තාක්ෂණය',      category: 'A/L Technology', level: ['AL'], stream: ['TECHNOLOGY'], icon: '💻', popular: true,  keywords: ['ict', 'computer'] },
  { id: 'al_biosys',      name: 'Bio Systems Technology', sinhalaName: 'ජෛව පද්ධති තාක්ෂණය',  category: 'A/L Technology', level: ['AL'], stream: ['TECHNOLOGY'], icon: '🌱', popular: false, keywords: ['bio systems', 'biosystems'] },
]

// ============================================================
// EXTRA-CURRICULAR
// ============================================================
export const EXTRACURRICULAR_SUBJECTS: Subject[] = [
  { id: 'ec_piano',      name: 'Piano',    category: 'Music',  level: ['GRADE_6_9', 'OL', 'AL'], icon: '🎹', popular: true,  keywords: ['piano', 'keyboard'] },
  { id: 'ec_violin',     name: 'Violin',   category: 'Music',  level: ['GRADE_6_9', 'OL', 'AL'], icon: '🎻', popular: false, keywords: ['violin'] },
  { id: 'ec_guitar',     name: 'Guitar',   category: 'Music',  level: ['GRADE_6_9', 'OL', 'AL'], icon: '🎸', popular: false, keywords: ['guitar'] },
  { id: 'ec_swimming',   name: 'Swimming', category: 'Sports', level: ['GRADE_6_9', 'OL', 'AL'], icon: '🏊', popular: true,  keywords: ['swimming'] },
  { id: 'ec_cricket',    name: 'Cricket',  category: 'Sports', level: ['GRADE_6_9', 'OL', 'AL'], icon: '🏏', popular: false, keywords: ['cricket'] },
]

// ============================================================
// ALL SUBJECTS COMBINED
// ============================================================
export const ALL_SUBJECTS: Subject[] = [
  ...SCHOLARSHIP_SUBJECTS,
  ...OL_CORE_SUBJECTS,
  ...OL_BASKET_SUBJECTS,
  ...AL_SCIENCE_SUBJECTS,
  ...AL_COMMERCE_SUBJECTS,
  ...AL_ARTS_SUBJECTS,
  ...AL_TECH_SUBJECTS,
  ...EXTRACURRICULAR_SUBJECTS,
]

// ============================================================
// STREAM DEFINITIONS
// ============================================================
export const AL_STREAMS = {
  SCIENCE: {
    id: 'SCIENCE',
    name: 'Science Stream',
    sinhalaName: 'විද්‍යා අංශය',
    icon: '🔬',
    color: 'blue',
    subjects: AL_SCIENCE_SUBJECTS,
    description: 'Combined Maths, Physics, Chemistry, Biology',
  },
  COMMERCE: {
    id: 'COMMERCE',
    name: 'Commerce Stream',
    sinhalaName: 'වාණිජ අංශය',
    icon: '💼',
    color: 'green',
    subjects: AL_COMMERCE_SUBJECTS,
    description: 'Accounting, Business Studies, Economics',
  },
  ARTS: {
    id: 'ARTS',
    name: 'Arts Stream',
    sinhalaName: 'කලා අංශය',
    icon: '🎨',
    color: 'purple',
    subjects: AL_ARTS_SUBJECTS,
    description: 'Sinhala, English, Geography, History',
  },
  TECHNOLOGY: {
    id: 'TECHNOLOGY',
    name: 'Technology Stream',
    sinhalaName: 'තාක්ෂණ අංශය',
    icon: '⚙️',
    color: 'amber',
    subjects: AL_TECH_SUBJECTS,
    description: 'Engineering Technology, ICT, Bio Systems',
  },
}

// ============================================================
// EDUCATION LEVELS
// ============================================================
export const EDUCATION_LEVELS = [
  { id: 'SCHOLARSHIP', name: 'Scholarship (Grade 5)', sinhalaName: 'ශිෂ්‍යත්ව', icon: '🏆' },
  { id: 'GRADE_6_9',   name: 'Grade 6–9',             sinhalaName: 'ශ්‍රේණිය 6-9', icon: '📚' },
  { id: 'OL',          name: 'O/L (Grade 10–11)',      sinhalaName: 'සා/පෙළ',    icon: '📝' },
  { id: 'AL',          name: 'A/L (Grade 12–13)',      sinhalaName: 'උ/පෙළ',     icon: '🎓' },
  { id: 'REVISION',    name: 'Revision Classes',       sinhalaName: 'නැවත අධ්‍යයනය', icon: '🔄' },
  { id: 'FOUNDATION',  name: 'University Foundation',  sinhalaName: 'විශ්ව විද්‍යාල', icon: '🏫' },
  { id: 'PROFESSIONAL',name: 'Professional Courses',   sinhalaName: 'වෘත්තීය',   icon: '💼' },
]

// ============================================================
// MEDIUMS
// ============================================================
export const MEDIUMS = [
  { id: 'SINHALA', name: 'Sinhala Medium', sinhalaName: 'සිංහල මාධ්‍යය', icon: '🇱🇰' },
  { id: 'TAMIL',   name: 'Tamil Medium',   tamilName: 'தமிழ் மொழி',     icon: '📿' },
  { id: 'ENGLISH', name: 'English Medium', sinhalaName: 'ඉංග්‍රීසි මාධ්‍යය', icon: '🇬🇧' },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getSubjectsByLevel(level: EducationLevel): Subject[] {
  return ALL_SUBJECTS.filter(s => s.level.includes(level))
}

export function getSubjectsByStream(stream: ALStream): Subject[] {
  return ALL_SUBJECTS.filter(s => s.stream?.includes(stream))
}

export function searchSubjects(query: string): Subject[] {
  const q = query.toLowerCase()
  return ALL_SUBJECTS.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.keywords.some(k => k.includes(q)) ||
    s.sinhalaName?.includes(q) ||
    s.tamilName?.includes(q)
  )
}

export function getPopularSubjects(): Subject[] {
  return ALL_SUBJECTS.filter(s => s.popular)
}
