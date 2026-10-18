'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { cn } from '@/_utils/cn'
import type { ComponentProps } from 'react'
import {
  clearPendingSectionIntent,
  registerNavigationLink,
  scrollToHomeSection,
  setPendingSectionIntent,
  type HomeSectionId
} from './section-intent'

type Props = ComponentProps<typeof Link> & {
  section?: HomeSectionId
  active?: boolean
  disabled?: boolean
  variant?: 'desktop' | 'mobile'
}

export function NavLink({
  active = false,
  className,
  disabled = false,
  href,
  section,
  variant = 'desktop',
  tabIndex,
  onClick,
  'aria-current': ariaCurrent,
  'aria-disabled': ariaDisabled,
  ...props
}: Props) {
  const pathname = usePathname()
  const navigationLinkRef = useCallback(
    (node: HTMLAnchorElement | null) => registerNavigationLink(node, pathname),
    [pathname]
  )
  const classes = cn(
    'group/nav-link relative inline-flex font-body text-text transition-colors outline-none hover:text-accent focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
    variant === 'mobile' && 'text-xl',
    className,
    active && 'text-accent',
    disabled && 'pointer-events-none cursor-not-allowed text-text opacity-50'
  )

  const linkProps = {
    ...props,
    ref: navigationLinkRef,
    'data-nav-link': true,
    href: disabled ? '#' : href,
    tabIndex: disabled ? -1 : tabIndex,
    'aria-disabled': disabled ? 'true' : ariaDisabled,
    'aria-current': disabled ? undefined : active ? 'page' : ariaCurrent,
    className: classes
  }
  const children = (
    <span className="relative inline-flex transition-transform duration-200 ease-out group-hover/nav-link:-translate-y-1 group-focus-visible/nav-link:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
      <span>{props.children}</span>
      <BrandStarIcon
        className={cn(
          'absolute top-full left-1/2 mt-px -translate-x-1/2 text-accent transition-opacity duration-200 ease-out motion-reduce:transition-none',
          disabled
            ? 'opacity-0'
            : active
              ? 'opacity-100'
              : 'opacity-0 group-hover/nav-link:opacity-100 group-focus-visible/nav-link:opacity-100'
        )}
      />
    </span>
  )

  return section ? (
    <Link
      {...linkProps}
      href={disabled ? '#' : href}
      scroll={false}
      onClick={(event) => {
        onClick?.(event)
        if (disabled) {
          event.preventDefault()
          return
        }
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) return

        if (pathname === '/') {
          event.preventDefault()
          scrollToHomeSection(section)
        }
      }}
      onNavigate={(event) => {
        if (disabled) {
          event.preventDefault()
          return
        }
        setPendingSectionIntent(section, pathname)
      }}
    >
      {children}
    </Link>
  ) : (
    <Link
      {...linkProps}
      onClick={onClick}
      onNavigate={clearPendingSectionIntent}
    >
      {children}
    </Link>
  )
}
