'use client'

function scrollOnReturn(anchor: HTMLSpanElement | null) {
  if (!anchor || window.location.hash !== '#map-return') return
  const section = anchor.closest('section')
  if (!section) return

  const frame = requestAnimationFrame(() => {
    if (window.location.hash !== '#map-return') return
    section.scrollIntoView({ behavior: 'instant' })
    section.focus({ preventScroll: true })
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
  })
  return () => cancelAnimationFrame(frame)
}

export function MapReturnAnchor() {
  return <span hidden ref={scrollOnReturn} />
}
