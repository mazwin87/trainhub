import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 2,
  themeColor: '#115E59',
}

export const metadata: Metadata = {
  title: {
    default: 'TrainHub Malaysia — HRDC Trainer Directory',
    template: '%s | TrainHub Malaysia',
  },
  description:
    'Discover and connect with 500+ verified HRDC-certified trainers across Malaysia. Search by topic, state, language, and more.',
  keywords: ['HRDC trainer', 'Malaysia trainer directory', 'HRD Corp', 'training provider Malaysia'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai.nimonimo.tech/trainhub'),  openGraph: {
    siteName: 'TrainHub Malaysia',
    type: 'website',
    locale: 'en_MY',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ overflowX: 'hidden', width: '100%' }}>
      <body style={{ overflowX: 'hidden', width: '100%' }}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
