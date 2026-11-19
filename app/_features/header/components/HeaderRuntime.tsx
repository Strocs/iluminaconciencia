'use client'

import type { ReactNode } from 'react'
import { useHeaderBehavior } from '../hooks/useHeaderBehavior'

type Props = {
  children: ReactNode
}

function setMenuOpen(header: HTMLElement, open: boolean) {
  header.toggleAttribute('data-menu-open', open)
  header.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', String(open))
  header.dispatchEvent(new Event('header-menu-change'))
}

export function HeaderMenuButton({ children, className }: Props & { className: string }) {
  return (
    <button
      type="button"
      data-menu-toggle
      aria-expanded={false}
      aria-controls="site-mobile-navigation"
      className={className}
      onClick={(event) => {
        const header = event.currentTarget.closest<HTMLElement>('[data-site-header]')
        if (header) setMenuOpen(header, !header.hasAttribute('data-menu-open'))
      }}
    >
      {children}
    </button>
  )
}

export function HeaderRuntime({ children }: Props) {
  const headerRef = useHeaderBehavior()

  return (
    <header
      ref={headerRef}
      style={{ viewTransitionName: 'site-header' }}
      onClickCapture={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          !(event.target instanceof Element)
        )
          return

        const link = event.target.closest<HTMLAnchorElement>('a[href]')
        if (
          !link ||
          link.getAttribute('aria-disabled') === 'true' ||
          link.hasAttribute('download') ||
          (link.target && link.target !== '_self')
        )
          return

        if (event.currentTarget.hasAttribute('data-menu-open')) {
          // Unlock before Next.js navigation or same-page scrolling.
          setMenuOpen(event.currentTarget, false)
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !event.currentTarget.hasAttribute('data-menu-open')) return
        setMenuOpen(event.currentTarget, false)
        event.currentTarget.querySelector<HTMLElement>('[data-menu-toggle]')?.focus({ preventScroll: true })
      }}
      data-site-header
      data-appearance="transparent"
      data-hidden="false"
      className="group sticky inset-x-0 top-0 z-100 col-start-1 row-start-1 flex h-24 flex-col self-start overflow-hidden bg-transparent px-6 transition-[height,translate] duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] data-menu-open:h-(--header-open-height,100dvh)! data-menu-open:min-h-24 data-menu-open:translate-y-0! data-[appearance=solid]:h-20 data-menu-open:data-[appearance=solid]:min-h-20 data-[hidden=true]:-translate-y-full motion-reduce:transition-none lg:h-32 lg:px-8 lg:data-menu-open:min-h-32 lg:data-[appearance=solid]:h-20 lg:data-menu-open:data-[appearance=solid]:min-h-20"
    >
      {children}
    </header>
  )
}
