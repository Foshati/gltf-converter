import type { Metadata } from 'next'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'GLTF → React Three Fiber',
  description: 'Easily convert GLTF models into React Three Fiber components to use in your projects',
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#da532c',
  },
  openGraph: {
    title: 'GLTF → React Three Fiber',
    description: 'Easily convert GLTF models into React Three Fiber components to use in your projects',
    images: ['/android-chrome-192x192.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}