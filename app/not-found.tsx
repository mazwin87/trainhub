import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', fontWeight: 500, color: 'var(--color-accent)', lineHeight: 1, marginBottom: 'var(--space-4)' }}>
          404
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
          Page not found
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
          The page you're looking for doesn't exist or may have been moved. Try one of these instead:
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Home size={16} /> Homepage
          </Link>
          <Link href="/trainers" className="btn btn-outline">
            Find a trainer
          </Link>
          <Link href="/blog" className="btn btn-outline">
            Read the blog
          </Link>
        </div>
      </div>
    </div>
  )
}