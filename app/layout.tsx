import type { Metadata } from 'next'
import { Inter, Fira_Code } from 'next/font/google'
import './globals.css'
import { profile } from '@/data/profile'
import { StructuredData } from '@/components/StructuredData'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://deshith-deemantha.vercel.app'),
  title: {
    default: `${profile.name} - ${profile.title} | Portfolio`,
    template: `%s | ${profile.name}`,
  },
  description: profile.bio,
  keywords: [
    profile.name.toLowerCase(),
    'full stack developer',
    'react developer',
    'portfolio',
    'web development',
    profile.location,
    'next.js',
    'typescript',
    'node.js',
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  publisher: profile.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://deshith-deemantha.vercel.app',
    title: `${profile.name} - ${profile.title} Portfolio`,
    description: profile.bio,
    siteName: `${profile.name} Portfolio`,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${profile.name} Portfolio Preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${profile.name} - ${profile.title}`,
    description: profile.bio,
    creator: '@yourhandle', // Update with your Twitter handle
    images: ['/og-image.jpg'],
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE || 'L6qegcjmde_AXEp1EP1WUah6nEhlYx2qIzFZ9iSIKS4',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://deshith-deemantha.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.variable} ${firaCode.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

