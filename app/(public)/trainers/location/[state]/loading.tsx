export default function Loading() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <div style={{ width: '160px', height: '20px', background: 'var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-6)' }} />
      <div style={{ width: '280px', height: '14px', background: 'var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)' }} />
      <div style={{ width: '480px', height: '40px', background: 'var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)' }} />
      <div style={{ width: '520px', height: '60px', background: 'var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-8)' }} />
      <div className="dir-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: '240px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  )
}
