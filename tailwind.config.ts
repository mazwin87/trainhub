import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Wire Tailwind to CSS tokens so both systems stay in sync.
      // Change a token value → Tailwind utilities update automatically.
      colors: {
        accent:   'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
        'accent-dark':  'var(--color-accent-dark)',
        cta:      'var(--color-cta)',
        'cta-dark': 'var(--color-cta-dark)',
        'cta-light': 'var(--color-cta-light)',
        ink:      'var(--color-ink)',
        muted:    'var(--color-muted)',
        subtle:   'var(--color-subtle)',
        bg:       'var(--color-bg)',
        surface:  'var(--color-surface)',
        border:   'var(--color-border)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body:    'var(--font-body)',
        mono:    'var(--font-mono)',
      },
      fontSize: {
        xs:   'var(--text-xs)',
        sm:   'var(--text-sm)',
        base: 'var(--text-base)',
        md:   'var(--text-md)',
        lg:   'var(--text-lg)',
        xl:   'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      maxWidth: {
        content: 'var(--max-width-content)',
        narrow:  'var(--max-width-narrow)',
      },
    },
  },
  plugins: [],
}

export default config
