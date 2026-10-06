'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

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
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    header.addEventListener('click', handleAnchorClick)
    header.dataset.region = 'hero'
    header.dataset.hidden = 'false'

    const boundary = document.querySelector<HTMLElement>('[data-header-boundary]')
    if (!boundary || typeof IntersectionObserver === 'undefined') {
      return () => header.removeEventListener('click', handleAnchorClick)
    }

    let hasPassedRelease = boundary.getBoundingClientRect().top < window.innerHeight
    let hasPassedCenter = boundary.getBoundingClientRect().top < window.innerHeight / 2
    let referenceScrollY = window.scrollY
    let frameId: number | null = null

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
      releaseObserver.disconnect()
      centerObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      header.removeEventListener('click', handleAnchorClick)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [pathname])

  return headerRef
}
