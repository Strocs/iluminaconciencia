/** Enable sticky only while the complete resource group fits below the site header. */
export function observeNewsMedia(element: HTMLDivElement) {
  if (typeof ResizeObserver === 'undefined') return

  const update = () => {
    const top = Number.parseFloat(getComputedStyle(element).top) || 0
    const available = document.documentElement.clientHeight - top - 24
    element.dataset.stickyFits = String(element.scrollHeight <= available)
  }
  const observer = new ResizeObserver(update)
  observer.observe(element)
  window.addEventListener('resize', update)
  update()

  return () => {
    observer.disconnect()
    window.removeEventListener('resize', update)
  }
}
