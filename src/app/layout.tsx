import type { Metadata } from 'next'
import './globals.css'
import { OrigenBusinessOS } from './OrigenBusinessOS'

export const metadata: Metadata = {
  title: 'Raziel — Asesor Comercial',
  description: 'I am Raziel, first-born of His lieutenants. Your supreme business advisor.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="h-screen overflow-hidden bg-[#060810]">
        {children}
        <OrigenBusinessOS />
      </body>
    </html>
  )
}
