'use client'

import Link from 'next/link'
import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

const sectionByPath: Record<string, string> = {
  '/explorar': 'explorar',
  '/contacto': 'contacto'
}

function scrollToHomeSection(path: string) {
  const target = document.getElementById(sectionByPath[path])
  if (!target) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })
  target.focus({ preventScroll: true })
}

export function HomeSectionLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname()
  const path = typeof href === 'string' ? href : href.pathname ?? ''
  const isAlias = path in sectionByPath

  return (
    <Link
      {...props}
      href={href}
      scroll={!isAlias}
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          !isAlias ||
          pathname !== path
        ) return

        event.preventDefault()
        scrollToHomeSection(path)
      }}
    />
  )
}

export function HomeSectionNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const sectionId = sectionByPath[pathname]

  const mainRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || !sectionId) return

      const frame = window.requestAnimationFrame(() => {
        scrollToHomeSection(pathname)
      })

      return () => window.cancelAnimationFrame(frame)
    },
    [pathname, sectionId]
  )

  return <main ref={mainRef}>{children}</main>
}
