'use client'

function monitorFps(node: HTMLSpanElement | null) {
  if (!node) return
  const document = node.ownerDocument
  let frameId = 0
  let sampleStart: number | undefined
  let intervals = 0

  const tick = (now: number): void => {
    if (sampleStart === undefined) sampleStart = now
    else {
      intervals += 1
      const elapsed = now - sampleStart
      if (elapsed >= 1_000) {
        node.textContent = `${Math.round((intervals * 1_000) / elapsed)} FPS`
        sampleStart = now
        intervals = 0
      }
    }
    frameId = requestAnimationFrame(tick)
  }
  const onVisibilityChange = (): void => {
    cancelAnimationFrame(frameId)
    sampleStart = undefined
    intervals = 0
    node.textContent = '— FPS'
    if (!document.hidden) frameId = requestAnimationFrame(tick)
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  if (!document.hidden) frameId = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(frameId)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}

export function HeroFpsMonitor() {
  return (
    <span
      ref={monitorFps}
      className="min-w-16 text-right font-mono tabular-nums"
      title="Animation-frame cadence, not GPU-presented frames. Updated once per second."
    >
      — FPS
    </span>
  )
}
