export interface CompletenessCheck {
  key: string
  label: string
  points: number
  completed: boolean
}

export function calculateCompleteness(
  profile: any,
  user: any,
  topicCount: number,
  courseCount: number,
  certCount: number
): { score: number; checks: CompletenessCheck[] } {
  const checks: CompletenessCheck[] = [
    {
      key: 'photo',
      label: 'Upload profile photo',
      points: 15,
      completed: Boolean(user?.avatar_url),
    },
    {
      key: 'bio',
      label: 'Write bio (200+ characters)',
      points: 15,
      completed: Boolean(profile?.bio && profile.bio.length >= 200),
    },
    {
      key: 'hrdf',
      label: 'Add HRDC cert number',
      points: 15,
      completed: Boolean(profile?.hrdf_cert_number),
    },
    {
      key: 'tagline',
      label: 'Add tagline',
      points: 5,
      completed: Boolean(profile?.tagline),
    },
    {
      key: 'topics',
      label: 'Select 3+ topics',
      points: 10,
      completed: topicCount >= 3,
    },
    {
      key: 'courses',
      label: 'Add at least 1 course',
      points: 10,
      completed: courseCount >= 1,
    },
    {
      key: 'location',
      label: 'Add location',
      points: 5,
      completed: Boolean(profile?.location_state),
    },
    {
      key: 'whatsapp',
      label: 'Add WhatsApp number',
      points: 5,
      completed: Boolean(profile?.whatsapp_number),
    },
    {
      key: 'website',
      label: 'Add website or LinkedIn',
      points: 5,
      completed: Boolean(profile?.website_url || profile?.linkedin_url),
    },
    {
      key: 'certs',
      label: 'Add certifications',
      points: 10,
      completed: certCount >= 1,
    },
    {
      key: 'pricing',
      label: 'Set pricing',
      points: 5,
      completed: profile?.pricing_mode === 'quotation' || Boolean(profile?.pricing_from),
    },
  ]

  const score = checks
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.points, 0)

  return { score: Math.min(score, 100), checks }
}