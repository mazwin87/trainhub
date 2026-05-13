/* ── SHARED TYPES ────────────────────────────────────────── */

export type UserRole = 'trainer' | 'company' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface MalaysianState {
  name: string
  slug: string
  trainer_count?: number
}

export const MALAYSIAN_STATES: MalaysianState[] = [
  { name: 'Kuala Lumpur', slug: 'kuala-lumpur' },
  { name: 'Selangor', slug: 'selangor' },
  { name: 'Penang', slug: 'penang' },
  { name: 'Johor', slug: 'johor' },
  { name: 'Perak', slug: 'perak' },
  { name: 'Sabah', slug: 'sabah' },
  { name: 'Sarawak', slug: 'sarawak' },
  { name: 'Negeri Sembilan', slug: 'negeri-sembilan' },
  { name: 'Melaka', slug: 'melaka' },
  { name: 'Kedah', slug: 'kedah' },
  { name: 'Kelantan', slug: 'kelantan' },
  { name: 'Terengganu', slug: 'terengganu' },
  { name: 'Pahang', slug: 'pahang' },
  { name: 'Perlis', slug: 'perlis' },
  { name: 'Putrajaya', slug: 'putrajaya' },
  { name: 'Labuan', slug: 'labuan' },
]

export const TRAINER_TOPICS = [
  'AI & Data',
  'Audit & Compliance',
  'Communication',
  'Health & Safety',
  'Leadership',
  'Mental Health',
  'Personal Development',
  'Procurement',
  'Sales & Marketing',
  'Strategy',
  'Sustainability & ESG',
  'Finance',
  'Human Resources',
  'Operations',
] as const

export type TrainerTopic = typeof TRAINER_TOPICS[number]
