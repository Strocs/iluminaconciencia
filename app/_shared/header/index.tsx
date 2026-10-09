import Image from 'next/image'
import Link from 'next/link'
import logo from '@/_assets/images/logo.png'
import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { LinkButton } from '@/_components/LinkButton'
import { HeaderBehaviorSentinel } from './HeaderBehaviorSentinel'
import { HeaderRuntime } from './components/HeaderRuntime'
import { navigationItems } from './data/navigation'

export { HeaderBehaviorSentinel }

export function Header() {
  return (
    <HeaderRuntime>
      <input id="site-menu-toggle" data-menu-toggle className="peer sr-only lg:hidden" type="checkbox" />

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] group-has-checked:opacity-100 group-data-[region=post-hero]:opacity-100 motion-reduce:transition-none"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 h-dvh bg-[radial-gradient(ellipse_at_50%_100%,#3b1f45_0%,#170d2f_40%,#010005_100%)]" />
        <span className="absolute inset-x-0 bottom-0 border-b border-border" />
      </div>

      <div className="relative z-20 flex h-full max-h-24 shrink-0 items-center lg:max-h-32">
        <div className="container mx-auto grid grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8">
          <Link
            className="flex shrink-0 items-center justify-self-start text-text no-underline outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href="/"
            aria-label="Iluminaconciencia, inicio"
          >
            <Image
              className="size-12 object-contain lg:size-14"
              src={logo}
              alt="Logo del proyecto Iluminaconciencia"
              loading="eager"
            />
          </Link>

          <nav className="hidden items-center justify-center gap-4 lg:flex" aria-label="Navegación principal">
            {navigationItems.map(({ label, href }) => (
              <NavLink key={href} href={href}>
                {label}
              </NavLink>
            ))}
          </nav>

          <LinkButton
            className="hidden shrink-0 justify-self-end tracking-wider lg:inline-flex"
            href="#"
            variant="important"
          >
            Ir a <strong>CALUZ</strong>
          </LinkButton>

          <label
            htmlFor="site-menu-toggle"
            className="relative flex size-11 cursor-pointer items-center justify-center justify-self-end text-text outline-none group-has-[[data-menu-toggle]:focus-visible]:ring-2 group-has-[[data-menu-toggle]:focus-visible]:ring-accent group-has-[[data-menu-toggle]:focus-visible]:ring-offset-3 lg:hidden"
          >
            <span className="sr-only group-has-checked:hidden">Abrir menú de navegación</span>
            <span className="sr-only hidden group-has-checked:inline">Cerrar menú de navegación</span>
            <span className="relative block h-5 w-7" aria-hidden="true">
              <span className="absolute top-0 left-0 h-0.5 w-7 rounded-full bg-border transition-opacity delay-300 duration-150 ease-out group-has-checked:opacity-0 group-has-checked:delay-0 motion-reduce:transition-none" />
              <span className="absolute top-1/2 left-0 h-px w-2 -translate-y-1/2 transition-[width] delay-300 duration-150 ease-out group-has-checked:w-full group-has-checked:delay-0 motion-reduce:transition-none">
                <span className="block size-full origin-center rounded-full bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-has-checked:rotate-45 group-has-checked:delay-150 motion-reduce:transition-none" />
              </span>
              <span className="absolute top-1/2 right-0 h-px w-2 -translate-y-1/2 transition-[width] delay-300 duration-150 ease-out group-has-checked:w-full group-has-checked:delay-0 motion-reduce:transition-none">
                <span className="block size-full origin-center rounded-full bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-has-checked:-rotate-45 group-has-checked:delay-150 motion-reduce:transition-none" />
              </span>
              <BrandStarIcon className="absolute top-1/2 left-1/2 z-10 -translate-1/2 text-primary transition-opacity delay-300 duration-150 ease-out group-has-checked:opacity-0 group-has-checked:delay-0 motion-reduce:transition-none" />
              <span className="absolute right-0 bottom-0 h-0.5 w-7 rounded-full bg-border transition-opacity delay-300 duration-150 ease-out group-has-checked:opacity-0 group-has-checked:delay-0 motion-reduce:transition-none" />
            </span>
          </label>
        </div>
      </div>

      <div className="pointer-events-none invisible absolute inset-x-0 top-24 z-10 h-[calc(100dvh-6rem)] overflow-y-auto transition-[visibility] duration-600 group-data-[region=post-hero]:top-20 group-data-[region=post-hero]:h-[calc(100dvh-5rem)] peer-checked:pointer-events-auto peer-checked:visible motion-reduce:transition-none lg:hidden">
        <nav className="flex h-full flex-col items-center justify-center gap-6" aria-label="Navegación móvil">
          {navigationItems.map(({ label, href }) => (
            <NavLink key={href} href={href} variant="mobile">
              {label}
            </NavLink>
          ))}
          <LinkButton className="mt-4 tracking-wider" href="#" variant="important">
            Ir a <strong>CALUZ</strong>
          </LinkButton>
        </nav>
      </div>
    </HeaderRuntime>
  )
}

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
