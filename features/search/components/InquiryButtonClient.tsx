'use client'

import { useState } from 'react'
import { InquiryModal } from '@/features/inquiries/components/InquiryModal'

interface Props {
  trainerName: string
  trainerId: string
}

export function InquiryButtonClient({ trainerName, trainerId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-outline"
        style={{ width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}
      >
        📩 Send inquiry
      </button>
      <InquiryModal
        trainerName={trainerName}
        trainerId={trainerId}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}