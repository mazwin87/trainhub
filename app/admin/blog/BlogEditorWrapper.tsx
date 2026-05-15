'use client'

import { useRouter } from 'next/navigation'
import { BlogEditor } from './BlogEditor'

export function BlogEditorWrapper({ post }: { post: any }) {
  const router = useRouter()
  return (
    <BlogEditor
      initialPost={post}
      onSaved={() => router.refresh()}
    />
  )
}