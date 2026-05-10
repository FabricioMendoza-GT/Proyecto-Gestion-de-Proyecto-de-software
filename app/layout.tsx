import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

/* =====================================================================
   CONFIGURACIÓN DE FUENTES
   - Se utiliza Geist como fuente principal (sans-serif)
   - Geist Mono para elementos de código o datos numéricos
   ===================================================================== */
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

/* =====================================================================
   METADATOS SEO
   - Título y descripción del proyecto
   - Adaptado para el proyecto de métodos de transporte
   ===================================================================== */
export const metadata: Metadata = {
  title: 'Métodos de Transporte - ULEAM',
  description: 'Aplicación web para resolver problemas de transporte mediante métodos matemáticos: Esquina Noroeste, Costo Mínimo y Aproximación de Vogel',
  generator: 'v0.app',
  keywords: ['transporte', 'investigación de operaciones', 'vogel', 'esquina noroeste', 'costo mínimo', 'ULEAM'],
  authors: [
    { name: 'Fabricio Jesús Mendoza Bazurto' },
    { name: 'Carmen Annabel Valeriano Delgado' },
    { name: 'Amelia Beatriz Salvatierra Vásquez' },
    { name: 'Damarys Dayanira Mero Zambrano' },
  ],
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
}

/* =====================================================================
   LAYOUT PRINCIPAL
   - Envuelve toda la aplicación
   - Configura idioma español y fuentes
   ===================================================================== */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
