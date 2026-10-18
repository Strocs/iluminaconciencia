import type { ReactNode } from 'react'

export function SiteAside({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Explora otras secciones"
      className="min-w-0 space-y-10 border-l border-border/40 pl-6 2xl:sticky 2xl:top-24 2xl:col-start-2 2xl:self-start"
    >
      {children}
    </aside>
  )
}
