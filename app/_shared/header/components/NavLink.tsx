import { BrandStarIcon } from '@/_components/BrandStarIcon'
import Link from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-current' | 'aria-disabled' | 'className' | 'href'> & {
  active?: boolean
  'aria-current'?: AnchorHTMLAttributes<HTMLAnchorElement>['aria-current']
  'aria-disabled'?: AnchorHTMLAttributes<HTMLAnchorElement>['aria-disabled']
  className?: string
  disabled?: boolean
  href: string
  variant?: 'desktop' | 'mobile'
}

export function NavLink({
  active = false,
  className,
  disabled = false,
  href,
  variant = 'desktop',
  tabIndex,
  'aria-current': ariaCurrent,
  'aria-disabled': ariaDisabled,
  ...props
}: Props) {
  const classes = [
    'group/nav-link relative inline-flex font-body text-text transition-colors outline-none hover:text-accent focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
    variant === 'mobile' && 'text-xl',
    className,
    active && 'text-accent',
    disabled && 'pointer-events-none cursor-not-allowed text-text opacity-50'
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link
      {...props}
      data-nav-link
      href={disabled ? '#' : href}
      tabIndex={disabled ? -1 : tabIndex}
      aria-disabled={disabled ? 'true' : ariaDisabled}
      aria-current={disabled ? undefined : active ? 'page' : ariaCurrent}
      className={classes}
    >
      <span className="relative inline-flex transition-transform duration-200 ease-out group-hover/nav-link:-translate-y-1 group-focus-visible/nav-link:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
        <span>{props.children}</span>
        <BrandStarIcon
          className={`absolute top-full left-1/2 mt-px -translate-x-1/2 text-accent transition-opacity duration-200 ease-out motion-reduce:transition-none ${
            disabled
              ? 'opacity-0'
              : active
                ? 'opacity-100'
                : 'opacity-0 group-hover/nav-link:opacity-100 group-focus-visible/nav-link:opacity-100'
          }`}
        />
      </span>
    </Link>
  )
}
