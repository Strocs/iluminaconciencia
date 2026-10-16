import type { Metadata } from 'next'
import { Ubuntu, Baskervville } from 'next/font/google'
import { Footer as UserenaFooter } from '@/_shared/userena/footer/Footer'
import { ProjectFooter } from '@/_shared/footer/ProjectFooter'
import { NavUSerena } from '@/_shared/userena/nav-userena/NavUSerena'
import '@/_styles/globals.css'
import { Background } from './_components/Background'
import { Separator } from './_components/Separator'
import { cn } from './_utils/cn'

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
    <html lang="es" className={cn('h-full antialiased', ubuntuSans.variable, baskervilleSerif.variable)}>
      <body className="relative isolate flex min-h-dvh flex-col font-body">
        <Background />
        <NavUSerena />
        {children}
        <Separator />
        <footer>
          <ProjectFooter />
          <UserenaFooter />
        </footer>
      </body>
    </html>
  )
}
