/** Stack interleaved source runs into two rails without moving or duplicating DOM nodes. */
export function observeOpeningNewsMedia(element: HTMLDivElement) {
  if (element.dataset.hasOpening !== 'true' || typeof ResizeObserver === 'undefined') return

  const runs = Array.from(element.children).flatMap((run) => {
    const content = run.querySelector<HTMLElement>('[data-news-run-content]')
    return run instanceof HTMLElement && content ? [{ run, content }] : []
  })
  const update = () => {
    const gap = 1.5 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    const heights = { text: 0, media: 0 }
    for (const { run, content } of runs) {
      if (run.dataset.hasContent !== 'true') continue
      const rail = run.dataset.newsRail === 'media' ? 'media' : 'text'
      run.style.setProperty('--news-run-offset', `${heights[rail]}px`)
      heights[rail] += content.getBoundingClientRect().height + gap
    }
    const mediaHeight = Math.max(0, heights.media - gap)
    const mediaContent = runs.find(
      ({ run }) => run.dataset.newsRail === 'media' && run.dataset.hasContent === 'true'
    )?.content
    const top = mediaContent ? Number.parseFloat(getComputedStyle(mediaContent).top) || 0 : 0
    const available = document.documentElement.clientHeight - top - 24
    element.style.setProperty('--news-media-height', `${mediaHeight}px`)
    element.dataset.openingFits = String(mediaHeight <= available)
    element.dataset.openingReady = 'true'
  }
  const observer = new ResizeObserver(update)
  for (const { content } of runs) observer.observe(content)
  window.addEventListener('resize', update)
  update()

  return () => {
    observer.disconnect()
    window.removeEventListener('resize', update)
  }
}
