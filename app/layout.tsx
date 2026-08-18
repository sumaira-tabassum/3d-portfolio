import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

import CustomCursor from '@/components/CustomCursor'
import Grain from '@/components/Grain'
import Navbar from '@/components/Navbar'
import ScrollProgressBar from '@/components/ScrollProgressBar'
import { AGENCY_NAME, TAGLINE } from '@/lib/site'

import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  // TODO: point at the real production domain before launch — this is what
  // resolves the relative Open Graph image below.
  metadataBase: new URL('https://example.com'),
  title: `${AGENCY_NAME} — ${TAGLINE}`,
  description:
    'Software development & consulting. No shortcuts, built right.',
  openGraph: {
    title: `${AGENCY_NAME} — ${TAGLINE}`,
    description:
      'Software development & consulting. No shortcuts, built right.',
    images: ['/frames/frame_0001.webp'],
  },
}

export const viewport: Viewport = {
  themeColor: '#05070A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <ScrollProgressBar />
        <Navbar />
        {children}
        <Grain />
        <CustomCursor />
      </body>
    </html>
  )
}
