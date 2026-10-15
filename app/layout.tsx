import type { Metadata } from 'next'
import { Ubuntu, Baskervville } from 'next/font/google'
import { Header } from '@/_shared/header'
import { Footer } from '@/_shared/uls/footer/Footer'
import { NavUSerena } from '@/_shared/uls/nav-userena/NavUSerena'
import '@/_styles/globals.css'

const ubuntuSans = Ubuntu({
  variable: '--font-ubuntu',
  weight: ['300', '400', '500', '700'],
  subsets: ['latin']
})

const baskervilleSerif = Baskervville({
  variable: '--font-baskerville',
  weight: 'variable',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'IluminAconciencia',
  description:
    'IluminAconciencia es un proyecto de la Región de Coquimbo que monitorea la contaminación lumínica y promueve el cuidado del cielo y la salud.'
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${ubuntuSans.variable} ${baskervilleSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NavUSerena />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
