import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { BlogEditorWrapper } from '../BlogEditorWrapper'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single() as { data: any }

  if (!post) notFound()

  return <BlogEditorWrapper post={post} />
}