import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HiveHaul™ - Service Agreement & Operations',
  description: 'HiveHaul lightweight transport and service operations platform',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        {children}
      </body>
    </html>
  )
}
