export default function Loading() {
  return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--color-border)',
          borderTop: '3px solid var(--color-accent)',
          borderRadius: '50%',
          margin: '0 auto var(--space-3)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>Loading...</p>
      </div>
    </div>
  )
}