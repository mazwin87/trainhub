import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Welcome back 👋
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Complete your profile to start receiving inquiries
      </p>

      <div style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
          🚀 Get started
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)', marginBottom: 'var(--space-4)', lineHeight: 'var(--leading-relaxed)' }}>
          Fill in your profile details to be discovered by companies looking for HRDF-certified trainers.
        </p>
        <Link href="/trainer/profile" className="btn btn-primary">
          Edit my profile →
        </Link>
      </div>
    </div>
  )
}