'use client'

import { useCallback, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/_utils/cn'

type Size = 'sm' | 'md'
type Placement = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
type Side = 'above' | 'below'
type Variant = 'default' | 'outline'
type Alignment = 'left' | 'right'

interface InfoPopoverProps {
  label: string
  children: ReactNode
  placement?: Placement
  openOnHover?: boolean
  size?: Size
  variant?: Variant
  className?: string
}

interface MeasuredPlacement {
  side: Side
  align: Alignment
  panelWidth: number
  panelHeight: number
}

const triggerSizeClasses: Record<Size, string> = { sm: 'size-5', md: 'size-8' }
const iconSizeClasses: Record<Size, string> = { sm: 'size-4', md: 'size-6' }
const variantClasses: Record<Variant, string> = { default: '', outline: 'border border-border' }

export function InfoPopover({
  label,
  children,
  placement = 'top-right',
  openOnHover = true,
  size = 'md',
  variant = 'default',
  className
}: InfoPopoverProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [measured, setMeasured] = useState<MeasuredPlacement>({
    side: 'below',
    align: 'left',
    panelWidth: 0,
    panelHeight: 0
  })

  const measureAndPlace = useCallback(() => {
    const root = rootRef.current
    const trigger = root?.querySelector('button')
    const panel = root?.querySelector<HTMLElement>('[data-panel]')
    if (!trigger || !panel) return

    const triggerRect = trigger.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const preferredSide: Side = placement.startsWith('top') ? 'above' : 'below'
    const aboveSpace = triggerRect.top
    const belowSpace = window.innerHeight - triggerRect.bottom
    const preferredSpace = preferredSide === 'above' ? aboveSpace : belowSpace
    const oppositeSpace = preferredSide === 'above' ? belowSpace : aboveSpace
    const side =
      preferredSpace >= panelRect.height || preferredSpace >= oppositeSpace
        ? preferredSide
        : preferredSide === 'above'
          ? 'below'
          : 'above'

    const fitsRight = triggerRect.right + 4 + panelRect.width <= window.innerWidth
    const fitsLeft = triggerRect.left - 4 - panelRect.width >= 0
    const extendRight = placement.endsWith('right') ? fitsRight || !fitsLeft : !fitsLeft && fitsRight
    setMeasured({
      side,
      align: extendRight ? 'left' : 'right',
      panelWidth: panelRect.width,
      panelHeight: panelRect.height
    })
  }, [placement])

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      rootRef.current = node
      const controller = new AbortController()
      measureAndPlace()
      window.addEventListener('resize', measureAndPlace, { signal: controller.signal })
      window.addEventListener('scroll', measureAndPlace, { capture: true, signal: controller.signal })
      return () => {
        controller.abort()
        if (rootRef.current === node) rootRef.current = null
      }
    },
    [measureAndPlace]
  )

  const bridge = openOnHover ? 'data-[open-on-hover=true]:hover:before:visible' : ''

  return (
    <div
      ref={setRootRef}
      className={cn(
        "group/popover relative inline-flex font-body before:pointer-events-auto before:invisible before:absolute before:z-9 before:h-[calc(100%+0.25rem+var(--hover-card-height))] before:w-[calc(100%+0.25rem+var(--hover-card-width))] before:content-[\'\'] focus-within:before:visible",
        bridge,
        'data-[align=left]:before:left-0 data-[align=right]:before:right-0 data-[side=above]:before:bottom-0 data-[side=below]:before:top-0',
        className
      )}
      style={
        {
          '--hover-card-width': `${measured.panelWidth}px`,
          '--hover-card-height': `${measured.panelHeight}px`
        } as CSSProperties
      }
      data-placement={placement}
      data-side={measured.side}
      data-align={measured.align}
      data-open-on-hover={openOnHover}
      onFocus={measureAndPlace}
      onPointerEnter={measureAndPlace}
    >
      <button
        type="button"
        aria-label={label}
        aria-controls={panelId}
        className={cn(
          'relative z-20 inline-flex cursor-pointer items-center justify-center rounded-full text-primary outline-none group-hover/popover:bg-primary group-hover/popover:text-background focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          triggerSizeClasses[size],
          variantClasses[variant]
        )}
      >
        <svg
          className={iconSizeClasses[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4" />
          <path d="M12 18h.01" />
        </svg>
      </button>
      <div
        id={panelId}
        className="pointer-events-none invisible absolute z-99 box-border w-max max-w-[min(24rem,calc(100vw-1.5rem))] rounded-lg border border-border bg-background p-4 text-sm/relaxed text-foreground shadow-lg [clip-path:inset(0_100%_100%_0)] [transition:clip-path_180ms_ease-out,visibility_0s_linear_180ms] data-[align=left]:left-full data-[align=left]:ml-1 data-[align=right]:right-full data-[align=right]:mr-1 data-[side=above]:bottom-full data-[side=above]:mb-1 data-[align=left]:data-[side=above]:[clip-path:inset(100%_100%_0_0)] data-[align=right]:data-[side=above]:[clip-path:inset(100%_0_0_100%)] data-[side=below]:top-full data-[side=below]:mt-1 data-[align=right]:data-[side=below]:[clip-path:inset(0_0_100%_100%)] motion-reduce:duration-[0.01ms!important] [:focus-within_>_&]:pointer-events-auto [:focus-within_>_&]:visible [:focus-within_>_&]:[clip-path:inset(0)] [:focus-within_>_&]:[transition:clip-path_180ms_ease-out,visibility_0s_linear_0s] [[data-open-on-hover=true]:hover_>_&]:pointer-events-auto [[data-open-on-hover=true]:hover_>_&]:visible [[data-open-on-hover=true]:hover_>_&]:[clip-path:inset(0)] [[data-open-on-hover=true]:hover_>_&]:[transition:clip-path_180ms_ease-out,visibility_0s_linear_0s]"
        role="dialog"
        aria-label={label}
        data-panel
        data-side={measured.side}
        data-align={measured.align}
      >
        <div className="translate-y-1 wrap-break-word opacity-0 [transition:opacity_120ms_ease-out,transform_120ms_ease-out] motion-reduce:duration-[0.01ms!important] [:focus-within_>_*_>_&]:translate-y-0 [:focus-within_>_*_>_&]:opacity-100 [:focus-within_>_*_>_&]:[transition:opacity_120ms_ease-out_60ms,transform_120ms_ease-out_60ms] [[data-open-on-hover=true]:hover_>_*_>_&]:translate-y-0 [[data-open-on-hover=true]:hover_>_*_>_&]:opacity-100 [[data-open-on-hover=true]:hover_>_*_>_&]:[transition:opacity_120ms_ease-out_60ms,transform_120ms_ease-out_60ms]">
          {children}
        </div>
      </div>
    </div>
  )
}
