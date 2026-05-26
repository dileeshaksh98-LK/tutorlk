import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'TutorLK — Find private tutors in Sri Lanka',
  description: 'Find verified private tutors for O/L, A/L, music and sports island-wide. Compare ratings, book sessions and pay securely. The #1 tutor marketplace in Sri Lanka.',
  keywords: 'tutors sri lanka, private tutor colombo, al tutor, ol tutor, online tuition sri lanka',
  openGraph: {
    title: 'TutorLK — Find private tutors in Sri Lanka',
    description: 'Verified tutors for O/L, A/L, music and sports. Book online or home visit.',
    type: 'website',
    locale: 'en_LK',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
