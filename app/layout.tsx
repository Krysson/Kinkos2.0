import type { Metadata } from 'next'
import { Syne, Outfit, JetBrains_Mono } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from 'sonner'
import './globals.css'

// Display font - geometric with personality, slightly brutalist edge
const syne = Syne({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800']
})

// Body font - geometric sans with warmth, premium feel
const outfit = Outfit({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
})

// Mono font - distinctive, better ligatures than Roboto Mono
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600']
})

export const metadata: Metadata = {
  title: 'KinkOS - The Woodshed Orlando',
  description: 'Next-gen venue management system'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      className='dark'>
      <body
        className={`${syne.variable} ${outfit.variable} ${jetbrainsMono.variable} font-body antialiased`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          richColors
          position='top-right'
          toastOptions={{
            style: {
              background: 'hsl(270 12% 10%)',
              border: '1px solid hsl(270 10% 20%)',
              color: 'hsl(30 15% 92%)'
            }
          }}
        />
      </body>
    </html>
  )
}
