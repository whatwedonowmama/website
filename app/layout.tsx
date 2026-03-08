import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'whatwedonowmama — OC Parent Community',
    template: '%s | whatwedonowmama',
  },
  description: 'Free weekly events, parenting resources, and a community for Orange County parents. No fluff. Just good stuff.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://whatwedonowmama.com'),
  openGraph: {
    siteName: 'whatwedonowmama',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand-cream">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
