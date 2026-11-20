import { useRef, type PointerEvent, type ReactNode, type Ref } from 'react'
import { cn } from '@/_utils/cn'

interface MapPanelScrollAreaProps {
  children: ReactNode
  className?: string
  ref?: Ref<HTMLDivElement>
}

export function MapPanelScrollArea({ children, className, ref }: MapPanelScrollAreaProps) {
  const hintRef = useRef<HTMLSpanElement>(null)
  const flash = useRef<Animation | null>(null)

  function showScrollHint(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const { clientHeight, clientWidth, offsetWidth, scrollHeight, scrollTop } = event.currentTarget
    const hint = hintRef.current
    if (!hint || scrollHeight <= clientHeight || offsetWidth > clientWidth || clientHeight <= 0) return

    // Native overlay scrollbars are controlled by the browser. Preview the thumb without scrolling.
    const thumbHeight = Math.min(clientHeight, Math.max(16, (clientHeight * clientHeight) / scrollHeight))
    const progress = Math.min(1, Math.max(0, scrollTop / (scrollHeight - clientHeight)))
    hint.style.height = thumbHeight + 'px'
    hint.style.top = (clientHeight - thumbHeight) * progress + 'px'
    flash.current?.cancel()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    flash.current = hint.animate([{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], {
      duration: 850,
      easing: reducedMotion ? 'steps(1, end)' : 'linear'
    })
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={ref}
        className={cn('min-h-0 map-panel-scrollbar flex-1 overflow-y-auto overscroll-contain', className)}
        onPointerEnter={showScrollHint}
        onScroll={() => flash.current?.cancel()}
      >
        {children}
      </div>
      <span
        ref={hintRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-e-0.5 w-[3px] rounded-full bg-primary opacity-0 forced-colors:hidden"
      />
    </div>
  )
}
