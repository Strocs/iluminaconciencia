import type { ReactNode } from 'react'
import { Header } from '@/_shared/header'

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header mode="hero" />
      {children}
    </>
  )
}
