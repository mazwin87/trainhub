/* ============================================================
   TRAINHUB — TRAINER TYPES
   All trainer-related TypeScript interfaces.
   Generated from Supabase schema — do not edit column names.
   ============================================================ */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type PricingMode = 'fixed' | 'quotation' | 'range'
export type DeliveryMode = 'online' | 'offline' | 'hybrid'
export type LanguageProficiency = 'native' | 'fluent' | 'conversational'

/* ── TRAINER PROFILE ─────────────────────────────────────── */
export interface TrainerProfile {
  id: string
  user_id: string
  slug: string
  bio: string
  tagline: string
  hrdf_cert_number: string | null
  years_experience: number
  location_state: string
  location_city: string
  is_online: boolean
  is_offline: boolean
  pricing_mode: PricingMode
  pricing_from: number | null
  pricing_to: number | null
  whatsapp_number: string | null
  website_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
  profile_completeness: number      // 0–100
  is_verified_hrdf: boolean
  is_identity_verified: boolean
  is_featured: boolean
  is_published: boolean
  approval_status: ApprovalStatus
  rejection_reason: string | null
  featured_until: string | null
  views_count: number
  inquiry_count: number
  avg_rating: number
  review_count: number
  created_at: string
  updated_at: string

  /* ── Relations (joined) */
  topics?: Topic[]
  languages?: TrainerLanguage[]
  industries?: Industry[]
  certifications?: Certification[]
  courses?: Course[]
  user?: UserPublic
}

/* ── TRAINER CARD (lightweight — for directory listing) ──── */
export interface TrainerCard {
  id: string
  slug: string
  tagline: string
  location_state: string
  location_city: string
  is_online: boolean
  is_offline: boolean
  is_verified_hrdf: boolean
  is_featured: boolean
  pricing_mode: PricingMode
  pricing_from: number | null
  pricing_to: number | null
  whatsapp_number: string | null
  avg_rating: number
  review_count: number
  years_experience: number
  avatar_url?: string
  full_name?: string
  users?: { full_name: string }
  topics: { id: string; name: string; slug: string }[]
  languages: string[]
}

/* ── TOPIC / SPECIALISATION ──────────────────────────────── */
export interface Topic {
  id: string
  name: string
  slug: string
  category: string
  icon: string | null
  trainer_count: number
}

/* ── TRAINER LANGUAGE ────────────────────────────────────── */
export interface TrainerLanguage {
  trainer_id: string
  language: string
  proficiency: LanguageProficiency
}

/* ── INDUSTRY ────────────────────────────────────────────── */
export interface Industry {
  id: string
  name: string
  slug: string
}

/* ── CERTIFICATION ───────────────────────────────────────── */
export interface Certification {
  id: string
  trainer_id: string
  name: string
  issuing_body: string | null
  issue_date: string | null
  expiry_date: string | null
  cert_file_url: string | null
  is_verified: boolean
}

/* ── COURSE ──────────────────────────────────────────────── */
export interface Course {
  id: string
  trainer_id: string
  title: string
  description: string | null
  duration_hours: number | null
  delivery_mode: DeliveryMode
  is_hrdf_claimable: boolean
  price_per_pax: number | null
  topic_id: string | null
  topic?: Pick<Topic, 'id' | 'name'>
  created_at: string
}

/* ── SEARCH FILTERS ──────────────────────────────────────── */
export interface TrainerSearchFilters {
  q?: string
  state?: string
  topics?: string[]
  languages?: string[]
  verified?: boolean
  online?: boolean
  offline?: boolean
  min_price?: number
  max_price?: number
  sort?: 'rating' | 'reviews' | 'experience' | 'newest' | 'price_asc'
  page?: number
  limit?: number
}

/* ── SEARCH RESULT ───────────────────────────────────────── */
export interface TrainerSearchResult {
  data: TrainerCard[]
  total: number
  page: number
  limit: number
  total_pages: number
}

/* ── USER (public-safe subset) ───────────────────────────── */
export interface UserPublic {
  id: string
  full_name: string
  avatar_url: string | null
}

/* ── PROFILE COMPLETENESS ────────────────────────────────── */
export interface CompletenessItem {
  key: string
  label: string
  points: number
  completed: boolean
}
