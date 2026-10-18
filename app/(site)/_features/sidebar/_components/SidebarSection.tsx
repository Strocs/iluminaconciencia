import type { ReactNode } from 'react'
import { LinkButton } from '@/_components/LinkButton'

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
      <LinkButton href={href} variant="default" size="sm" className="mt-5">
        {linkLabel}
      </LinkButton>
    </section>
  )
}
