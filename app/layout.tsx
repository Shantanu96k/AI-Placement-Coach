import type { Metadata } from 'next'
import './globals.css'
import { FeatureFlagProvider } from '@/components/FeatureFlagProvider'

export const metadata: Metadata = {
  title: 'AI Placement Coach',
  description: 'India AI-powered placement preparation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <FeatureFlagProvider>
          {children}
        </FeatureFlagProvider>
      </body>
    </html>
  )
}