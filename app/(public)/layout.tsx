import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--nav-height))' }}>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  )
}
