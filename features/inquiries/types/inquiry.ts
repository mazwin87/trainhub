export type InquiryStatus = 'new' | 'read' | 'replied' | 'closed'
export type DeliveryPreference = 'online' | 'offline' | 'hybrid' | 'flexible'

export interface Inquiry {
  id: string
  trainer_id: string
  company_user_id: string | null
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  message: string
  training_topic: string | null
  pax_count: number | null
  preferred_date: string | null
  delivery_mode: DeliveryPreference | null
  status: InquiryStatus
  created_at: string
}

export interface InquiryFormData {
  contact_name: string
  company_name: string
  contact_email: string
  contact_phone: string
  training_topic: string
  pax_count: number | null
  preferred_date: string
  delivery_mode: DeliveryPreference
  message: string
}
