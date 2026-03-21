import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
