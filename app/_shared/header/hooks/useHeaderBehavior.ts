'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

const DIRECTION_THRESHOLD = 6

function handleAnchorClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  const eventTarget = event.target
  if (!(eventTarget instanceof Element)) return

  const link = eventTarget.closest<HTMLAnchorElement>('a[data-nav-link]')
  const href = link?.getAttribute('href')
  if (!link || link.target || link.hasAttribute('download') || !href?.startsWith('#')) return

  const targetId = href.slice(1)
  if (!targetId) return

  const target = document.querySelector<HTMLElement>(`#${CSS.escape(targetId)}`)
  if (!target) return

  event.preventDefault()
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  })

  const hadTabIndex = target.hasAttribute('tabindex')
  if (!hadTabIndex) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })

  if (!hadTabIndex) {
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }
}

export function useHeaderBehavior() {
  const pathname = usePathname()

  return useCallback((header: HTMLElement | null) => {
    if (!header) return

    header.addEventListener('click', handleAnchorClick)
    header.dataset.headerPathname = pathname
    header.dataset.region = 'hero'
    header.dataset.hidden = 'false'

    const boundary = document.querySelector<HTMLElement>('[data-header-boundary]')
    const banner = document.querySelector<HTMLElement>('[data-site-banner]')
    const menuToggle = header.querySelector<HTMLInputElement>('[data-menu-toggle]')
    let frameId: number | null = null

    const updateHeaderOffset = () => {
      header.style.top = menuToggle?.checked
        ? '0px'
        : `${Math.max(0, banner?.getBoundingClientRect().bottom ?? 0)}px`
    }
    updateHeaderOffset()

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateHeaderOffset)
    if (banner) resizeObserver?.observe(banner)

    const handleResize = () => updateHeaderOffset()
    const handleScrollOffset = () => updateHeaderOffset()
    const handleMenuChange = () => updateHeaderOffset()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScrollOffset, { passive: true })
    menuToggle?.addEventListener('change', handleMenuChange)

    if (!boundary || typeof IntersectionObserver === 'undefined') {
      return () => {
        resizeObserver?.disconnect()
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScrollOffset)
        menuToggle?.removeEventListener('change', handleMenuChange)
        header.removeEventListener('click', handleAnchorClick)
        delete header.dataset.headerPathname
      }
    }

    let hasPassedRelease = boundary.getBoundingClientRect().top < window.innerHeight
    let hasPassedCenter = boundary.getBoundingClientRect().top < window.innerHeight / 2
    let referenceScrollY = window.scrollY

    const renderThresholdState = (hideAtCenter = false) => {
      header.dataset.region = hasPassedRelease ? 'post-hero' : 'hero'
      if (!hasPassedCenter) header.dataset.hidden = 'false'
      else if (hideAtCenter) header.dataset.hidden = 'true'
    }

    renderThresholdState(hasPassedCenter)

    const releaseObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.rootBounds) return
        hasPassedRelease = entry.boundingClientRect.top < entry.rootBounds.bottom
        renderThresholdState()
        referenceScrollY = window.scrollY
      },
      { threshold: 0 }
    )
    const centerObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.rootBounds) return
        const wasPastCenter = hasPassedCenter
        hasPassedCenter = entry.boundingClientRect.top < entry.rootBounds.bottom
        renderThresholdState(!wasPastCenter && hasPassedCenter)
        referenceScrollY = window.scrollY
      },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    )

    releaseObserver.observe(boundary)
    centerObserver.observe(boundary)

    const updateDirection = () => {
      frameId = null
      const currentScrollY = window.scrollY
      const delta = currentScrollY - referenceScrollY
      if (!hasPassedCenter || Math.abs(delta) < DIRECTION_THRESHOLD) return
      header.dataset.hidden = delta > 0 ? 'true' : 'false'
      referenceScrollY = currentScrollY
    }
    const handleScroll = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateDirection)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      resizeObserver?.disconnect()
      releaseObserver.disconnect()
      centerObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScrollOffset)
      window.removeEventListener('resize', handleResize)
      menuToggle?.removeEventListener('change', handleMenuChange)
      header.removeEventListener('click', handleAnchorClick)
      delete header.dataset.headerPathname
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [pathname])
}
