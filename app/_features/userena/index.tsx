import type { ReactNode } from 'react'
import { Footer } from './footer/Footer'
import { NavUSerena } from './nav-userena/NavUSerena'

export function UserenaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavUSerena />
      {children}
      <Footer />
    </>
  )
}
