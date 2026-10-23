import type { ReactNode } from 'react'
import { Header } from './components/Header'

export function HeaderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-w-0 flex-1 grid-cols-1">
      <Header />
      <div className="col-start-1 row-start-1 min-w-0">{children}</div>
    </div>
  )
}
