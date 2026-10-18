import type { ReactNode } from 'react'
import Link from 'next/link'

interface AsideSectionProps {
  title: string
  href: string
  linkLabel: string
  children: ReactNode
}

export function AsideSection({ title, href, linkLabel, children }: AsideSectionProps) {
  return (
    <section>
      <h2 className="font-heading text-xl leading-tight text-foreground">{title}</h2>
      {children}
      <Link
        href={href}
        className="mt-5 inline-flex rounded-sm text-sm text-primary underline underline-offset-4 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
      >
        {linkLabel}
      </Link>
    </section>
  )
}
