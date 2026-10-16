import type { ReactNode } from 'react'
import { Header } from '@/_shared/header'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
