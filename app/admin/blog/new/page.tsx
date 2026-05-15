'use client'

import { useRouter } from 'next/navigation'
import { BlogEditor } from '../BlogEditor'

export default function NewBlogPage() {
  const router = useRouter()

  return (
    <BlogEditor
      onSaved={(id) => router.push(`/admin/blog/${id}`)}
    />
  )
}