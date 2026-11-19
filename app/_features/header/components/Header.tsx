import Image from 'next/image'
import Link from 'next/link'
import logo from '@/_assets/images/logo-header.webp'
import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { Button } from '@/_components/Button'
import { HeaderMenuButton, HeaderRuntime } from './HeaderRuntime'
import { NavLink } from '../navigation/NavLink'
import { navigationItems } from '../../navigation/navigation'

export function Header() {
  return (
    <HeaderRuntime>
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] group-data-menu-open:opacity-100 group-data-[appearance=solid]:opacity-100 motion-reduce:transition-none"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 h-(--header-open-height,100dvh) min-h-full bg-[radial-gradient(ellipse_at_50%_100%,#3b1f45_0%,#170d2f_40%,#010005_100%)]" />
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
              className="size-12 object-contain motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:scale-105 lg:size-14"
              src={logo}
              unoptimized
              alt="Logo del proyecto Iluminaconciencia"
              loading="eager"
            />
          </Link>

          <nav className="hidden items-center justify-center gap-4 lg:flex" aria-label="Navegación principal">
            {navigationItems.map(({ label, href, section }) => (
              <NavLink key={label} href={href} section={section}>
                {label}
              </NavLink>
            ))}
          </nav>

          <Button
            className="hidden shrink-0 justify-self-end tracking-wider lg:inline-flex"
            href="#"
            variant="important"
          >
            Ir a <strong>CALUZ</strong>
          </Button>

          <HeaderMenuButton className="relative flex size-11 cursor-pointer items-center justify-center justify-self-end text-text outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-3 lg:hidden">
            <span className="sr-only group-data-menu-open:hidden">Abrir menú de navegación</span>
            <span className="sr-only hidden group-data-menu-open:inline">Cerrar menú de navegación</span>
            <span className="relative block h-5 w-7" aria-hidden="true">
              <span className="absolute top-0 left-0 h-0.5 w-7 rounded-full bg-border transition-opacity delay-300 duration-150 ease-out group-data-menu-open:opacity-0 group-data-menu-open:delay-0 motion-reduce:transition-none" />
              <span className="absolute top-1/2 left-0 h-px w-2 -translate-y-1/2 transition-[width] delay-300 duration-150 ease-out group-data-menu-open:w-full group-data-menu-open:delay-0 motion-reduce:transition-none">
                <span className="block size-full origin-center rounded-full bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-data-menu-open:rotate-45 group-data-menu-open:delay-150 motion-reduce:transition-none" />
              </span>
              <span className="absolute top-1/2 right-0 h-px w-2 -translate-y-1/2 transition-[width] delay-300 duration-150 ease-out group-data-menu-open:w-full group-data-menu-open:delay-0 motion-reduce:transition-none">
                <span className="block size-full origin-center rounded-full bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-data-menu-open:-rotate-45 group-data-menu-open:delay-150 motion-reduce:transition-none" />
              </span>
              <BrandStarIcon className="absolute top-1/2 left-1/2 z-10 -translate-1/2 text-primary transition-opacity delay-300 duration-150 ease-out group-data-menu-open:opacity-0 group-data-menu-open:delay-0 motion-reduce:transition-none" />
              <span className="absolute right-0 bottom-0 h-0.5 w-7 rounded-full bg-border transition-opacity delay-300 duration-150 ease-out group-data-menu-open:opacity-0 group-data-menu-open:delay-0 motion-reduce:transition-none" />
            </span>
          </HeaderMenuButton>
        </div>
      </div>

      <div
        id="site-mobile-navigation"
        className="pointer-events-none invisible absolute inset-x-0 top-24 z-10 h-[max(0px,calc(var(--header-open-height,100dvh)-6rem))] overflow-y-auto overscroll-contain transition-[visibility] duration-600 group-data-menu-open:pointer-events-auto group-data-menu-open:visible group-data-[appearance=solid]:top-20 group-data-[appearance=solid]:h-[max(0px,calc(var(--header-open-height,100dvh)-5rem))] motion-reduce:transition-none lg:hidden"
      >
        <nav className="flex h-full flex-col items-center justify-center gap-6" aria-label="Navegación móvil">
          {navigationItems.map(({ label, href, section }) => (
            <NavLink key={label} href={href} section={section} variant="mobile">
              {label}
            </NavLink>
          ))}
          <Button className="mt-4 tracking-wider" href="#" variant="important">
            Ir a <strong>CALUZ</strong>
          </Button>
        </nav>
      </div>
    </HeaderRuntime>
  )
}
