import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Refugia — Niñeras de confianza para tu hogar',
  description:
    'Encuentra niñeras verificadas y confiables en Concepción y alrededores. Perfiles revisados, reserva fácil y sin complicaciones. Para que tus hijos siempre estén en buenas manos.',
  keywords: ['niñera', 'cuidado de niños', 'babysitter', 'Concepción', 'Chile', 'Refugia'],
  authors: [{ name: 'Refugia' }],
  openGraph: {
    title: 'Refugia — Niñeras de confianza para tu hogar',
    description: 'Niñeras verificadas cerca de ti. Reserva fácil, perfiles revisados y tranquilidad para tu familia.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stone-50 text-stone-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
