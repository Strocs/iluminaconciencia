import type { Metadata } from 'next'
import { Ubuntu_Sans, Baskervville } from 'next/font/google'
import { UserenaLayout } from '@/_features/userena'
import { ProjectFooter } from '@/_features/footer/ProjectFooter'
import '@/_styles/globals.css'
import { HeaderLayout } from '@/_features/header'
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
    <html
      lang="es"
      className={cn(
        'h-full antialiased max-lg:has-[[data-menu-toggle]:checked]:overflow-hidden',
        ubuntuSans.variable,
        baskervilleSerif.variable
      )}
    >
      <body className="relative isolate flex min-h-dvh flex-col font-body max-lg:has-[[data-menu-toggle]:checked]:overflow-hidden">
        <Background />
        <UserenaLayout>
          <HeaderLayout>
            {children}
            <footer className="border-t border-border bg-background">
              <ProjectFooter />
            </footer>
          </HeaderLayout>
        </UserenaLayout>
      </body>
    </html>
  )
}
