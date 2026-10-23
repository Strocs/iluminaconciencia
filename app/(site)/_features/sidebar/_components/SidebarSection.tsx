import type { ReactNode } from 'react'
import { Button } from '@/_components/Button'

interface SidebarSectionProps {
  title: string
  href: string
  linkLabel: string
  children: ReactNode
}

export function SidebarSection({ title, href, linkLabel, children }: SidebarSectionProps) {
  return (
    <section>
      <h2 className="font-heading text-xl leading-tight text-foreground">{title}</h2>
      {children}
      <Button href={href} variant="default" size="sm" className="mt-5">
        {linkLabel}
      </Button>
    </section>
  )
}
