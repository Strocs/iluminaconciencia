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

  return useCallback(
    (header: HTMLElement | null) => {
      if (!header) return

      header.addEventListener('click', handleAnchorClick)
      header.dataset.headerPathname = pathname
      header.dataset.hidden = 'false'

      const headerLayout = header.parentElement
      const menuToggle = header.querySelector<HTMLInputElement>('[data-menu-toggle]')
      let frameId: number | null = null
      let referenceScrollY = Math.max(0, window.scrollY)

      const updateHeader = (trackDirection = false) => {
        const currentScrollY = Math.max(0, window.scrollY)
        // Use our own layout, not the expanding header, so height changes cannot shift the measurement.
        const layoutBounds = headerLayout?.getBoundingClientRect()
        const visibleTop = Math.max(0, layoutBounds?.top ?? 0)
        const visibleBottom = Math.min(window.innerHeight, layoutBounds?.bottom ?? window.innerHeight)
        const openHeight = `${Math.max(0, visibleBottom - visibleTop)}px`
        if (header.style.getPropertyValue('--header-open-height') !== openHeight) {
          header.style.setProperty('--header-open-height', openHeight)
        }

        // Cached route trees may remain mounted but must not supply the active marker.
        const solidStart = Array.from(document.querySelectorAll<HTMLElement>('[data-header-solid-start]')).find(
          (element) => element.getClientRects().length > 0
        )
        const solid = solidStart ? solidStart.getBoundingClientRect().top < window.innerHeight : currentScrollY > 0

        header.dataset.appearance = solid ? 'solid' : 'transparent'

        if (!solid || currentScrollY === 0 || menuToggle?.checked) {
          header.dataset.hidden = 'false'
          referenceScrollY = currentScrollY
        } else if (trackDirection) {
          const delta = currentScrollY - referenceScrollY
          if (Math.abs(delta) >= DIRECTION_THRESHOLD) {
            header.dataset.hidden = delta > 0 ? 'true' : 'false'
            referenceScrollY = currentScrollY
          }
        }
      }

      let scrollPending = false
      const scheduleUpdate = () => {
        if (frameId !== null) return
        frameId = window.requestAnimationFrame(() => {
          frameId = null
          updateHeader(scrollPending)
          scrollPending = false
        })
      }
      const handleScroll = () => {
        scrollPending = true
        scheduleUpdate()
      }
      const handleMenuChange = () => {
        referenceScrollY = Math.max(0, window.scrollY)
        updateHeader()
      }

      // Keep streamed/cached route visibility updates, but ignore animation-only styles.
      const previousStyle = document.createElement('div').style
      const mutationObserver = new MutationObserver((records) => {
        const relevant = records.some((record) => {
          if (header.contains(record.target)) return false
          if (record.type === 'childList' || record.attributeName === 'data-header-solid-start') return true
          if (!(record.target instanceof HTMLElement)) return false
          if (record.attributeName === 'hidden') {
            return record.oldValue !== record.target.getAttribute('hidden')
          }
          if (record.attributeName !== 'style') return false
          const style = record.target.style
          // Most hero writes only change transforms, opacity or CSS variables.
          if (
            !style.display &&
            !style.contentVisibility &&
            !/(?:^|;)\s*(?:display|content-visibility)\s*:/i.test(record.oldValue ?? '')
          ) {
            return false
          }
          previousStyle.cssText = record.oldValue ?? ''
          return previousStyle.display !== style.display || previousStyle.contentVisibility !== style.contentVisibility
        })
        if (relevant) scheduleUpdate()
      })
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['data-header-solid-start', 'hidden', 'style']
      })
      const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate)
      resizeObserver?.observe(document.body)
      if (headerLayout) resizeObserver?.observe(headerLayout)

      window.addEventListener('resize', scheduleUpdate)
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('pageshow', scheduleUpdate)
      document.addEventListener('load', scheduleUpdate, true)
      menuToggle?.addEventListener('change', handleMenuChange)
      updateHeader()
      scheduleUpdate()

      return () => {
        mutationObserver.disconnect()
        resizeObserver?.disconnect()
        window.removeEventListener('resize', scheduleUpdate)
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('pageshow', scheduleUpdate)
        document.removeEventListener('load', scheduleUpdate, true)
        menuToggle?.removeEventListener('change', handleMenuChange)
        header.removeEventListener('click', handleAnchorClick)
        delete header.dataset.headerPathname
        header.style.removeProperty('--header-open-height')
        if (frameId !== null) window.cancelAnimationFrame(frameId)
      }
    },
    [pathname]
  )
}
