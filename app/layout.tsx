import type { Metadata } from 'next'
import { Ubuntu_Sans, Baskervville } from 'next/font/google'
import { Footer as UserenaFooter } from '@/_features/userena/footer/Footer'
import { ProjectFooter } from '@/_features/footer/ProjectFooter'
import { NavUSerena } from '@/_features/userena/nav-userena/NavUSerena'
import '@/_styles/globals.css'
import { Header } from '@/_features/header'
import { Background } from './_components/Background'
import { cn } from './_utils/cn'

const ubuntuSans = Ubuntu_Sans({
  variable: '--font-ubuntu',
  weight: ['200', '400', '600', '800'],
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
    <html lang="es" className={cn('h-full antialiased', ubuntuSans.variable, baskervilleSerif.variable)}>
      <body className="relative isolate flex min-h-dvh flex-col font-body">
        <Background />
        <NavUSerena />
        <Header />
        {children}
        <footer className="border-t border-border bg-background">
          <ProjectFooter />
          <UserenaFooter />
        </footer>
      </body>
    </html>
  )
}
