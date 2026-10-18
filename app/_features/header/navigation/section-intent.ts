'use client'

export type HomeSectionId = 'explorar' | 'contacto'

type SectionIntent = { section: HomeSectionId; sourcePathname: string }

let pendingIntent: SectionIntent | null = null
let mountedLinks = 0
let observer: MutationObserver | null = null
let frame: number | null = null

function stopWatching() {
  observer?.disconnect()
  observer = null
  if (frame !== null) window.cancelAnimationFrame(frame)
  frame = null
}

function clearIntent() {
  pendingIntent = null
  stopWatching()
}

function attemptScroll(intent: SectionIntent) {
  if (pendingIntent !== intent || window.location.pathname !== '/') return

  const target = document.getElementById(intent.section)
  if (!target) return

  if (frame !== null) window.cancelAnimationFrame(frame)
  frame = window.requestAnimationFrame(() => {
    frame = null
    if (pendingIntent !== intent || window.location.pathname !== '/') return

    const currentTarget = document.getElementById(intent.section)
    if (!currentTarget) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    currentTarget.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })
    currentTarget.focus({ preventScroll: true })
    clearIntent()
  })
}

function watchForTarget(pathname: string) {
  if (!pendingIntent || mountedLinks === 0 || pathname !== '/') return
  attemptScroll(pendingIntent)
  if (!pendingIntent || observer || window.location.pathname !== '/') return

  observer = new MutationObserver(() => {
    if (window.location.pathname !== '/') {
      clearIntent()
      return
    }
    if (pendingIntent) attemptScroll(pendingIntent)
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

export function setPendingSectionIntent(section: HomeSectionId, sourcePathname: string) {
  stopWatching()
  pendingIntent = { section, sourcePathname }
  if (sourcePathname === '/') watchForTarget(sourcePathname)
}

export function clearPendingSectionIntent() {
  clearIntent()
}

export function registerNavigationLink(node: HTMLAnchorElement | null, pathname: string) {
  if (node) {
    mountedLinks += 1
    if (pendingIntent && pathname !== '/' && pathname !== pendingIntent.sourcePathname) {
      clearIntent()
    } else {
      watchForTarget(pathname)
    }
    return
  }

  mountedLinks = Math.max(0, mountedLinks - 1)
  if (mountedLinks === 0) stopWatching()
}

export function scrollToHomeSection(section: HomeSectionId) {
  const target = document.getElementById(section)
  if (!target) return false

  clearIntent()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })
  target.focus({ preventScroll: true })
  return true
}
