'use client'

import { useCallback, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/_utils/cn'

type Size = 'sm' | 'md'
type Placement = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
type Variant = 'default' | 'outline'

interface InfoPopoverProps {
  label: string
  children: ReactNode
  /** Wrap plain text in the trigger; omit it for an independent help button. */
  trigger?: string
  placement?: Placement
  openOnHover?: boolean
  size?: Size
  variant?: Variant
  className?: string
}

const triggerSizeClasses: Record<Size, string> = { sm: 'size-5 text-sm', md: 'size-8 text-base' }

export function InfoPopover({
  label,
  children,
  trigger,
  placement = 'bottom-right',
  openOnHover = true,
  size = 'md',
  variant = 'default',
  className
}: InfoPopoverProps) {
  const panelId = useId()
  const titleId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)

  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), [])

  const close = useCallback(() => {
    cancelClose()
    setOpen(false)
  }, [cancelClose])

  const show = () => {
    cancelClose()
    setOpen(true)
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => {
      const panel = panelRef.current
      if (!panel?.matches(':hover') && !panel?.contains(document.activeElement)) setOpen(false)
    }, 240)
  }

  const measureAndPlace = useCallback(() => {
    const button = triggerRef.current
    const panel = panelRef.current
    const body = panel?.querySelector<HTMLElement>('[data-popover-body]')
    const heading = panel?.querySelector<HTMLElement>('[data-popover-heading]')
    if (!button || !panel || !body || !heading) return

    const rect = button.getBoundingClientRect()
    const margin = 16
    const gap = 8
    const above = Math.max(0, rect.top - margin - gap)
    const below = Math.max(0, window.innerHeight - rect.bottom - margin - gap)
    const desiredHeight = Math.min(288, heading.offsetHeight + body.scrollHeight + 2)
    const preferAbove = placement.startsWith('top')
    const preferred = preferAbove ? above : below
    const opposite = preferAbove ? below : above
    const useAbove = preferred >= desiredHeight || preferred >= opposite ? preferAbove : !preferAbove
    panel.style.maxHeight = `${Math.min(288, useAbove ? above : below)}px`

    const panelRect = panel.getBoundingClientRect()
    const preferredLeft = placement.endsWith('right') ? rect.left : rect.right - panelRect.width
    const left = Math.max(margin, Math.min(preferredLeft, window.innerWidth - panelRect.width - margin))
    const top = useAbove ? rect.top - gap - panelRect.height : rect.bottom + gap
    panel.style.left = `${left}px`
    panel.style.top = `${Math.max(margin, Math.min(top, window.innerHeight - panelRect.height - margin))}px`
    panel.dataset.side = useAbove ? 'above' : 'below'
    panel.dataset.align = placement.endsWith('right') ? 'left' : 'right'
    if (rect.bottom < 0 || rect.top > window.innerHeight || button.closest('[inert]')) setOpen(false)
  }, [placement])

  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (!node) return
      triggerRef.current = node
      setPortalHost(node.ownerDocument.body)
      return () => {
        cancelClose()
        triggerRef.current = null
      }
    },
    [cancelClose]
  )

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      panelRef.current = node
      const controller = new AbortController()
      const observer = new ResizeObserver(measureAndPlace)
      observer.observe(node)
      const body = node.querySelector<HTMLElement>('[data-popover-body]')
      if (body) observer.observe(body)
      measureAndPlace()
      window.addEventListener('resize', measureAndPlace, { signal: controller.signal })
      window.addEventListener('scroll', measureAndPlace, { capture: true, passive: true, signal: controller.signal })
      document.addEventListener(
        'pointerdown',
        (event) => {
          if (!node.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) close()
        },
        { signal: controller.signal }
      )
      document.addEventListener(
        'keydown',
        (event) => {
          if (event.key !== 'Escape' || triggerRef.current?.getAttribute('aria-expanded') !== 'true') return
          if (node.contains(document.activeElement)) triggerRef.current?.focus()
          close()
          event.preventDefault()
        },
        { signal: controller.signal }
      )
      return () => {
        controller.abort()
        observer.disconnect()
        cancelClose()
        panelRef.current = null
      }
    },
    [cancelClose, close, measureAndPlace]
  )

  return (
    <>
      <button
        ref={setTriggerRef}
        type="button"
        aria-label={trigger ? undefined : label}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'cursor-pointer font-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          trigger
            ? 'inline rounded-sm text-inherit hover:text-primary aria-expanded:text-primary'
            : 'inline-flex shrink-0 items-center justify-center rounded-full text-primary hover:bg-primary hover:text-background aria-expanded:bg-primary aria-expanded:text-background',
          !trigger && triggerSizeClasses[size],
          !trigger && variant === 'outline' && 'border border-border',
          className
        )}
        onPointerEnter={(event) => {
          if (openOnHover && event.pointerType === 'mouse') show()
        }}
        onPointerLeave={(event) => {
          if (openOnHover && event.pointerType === 'mouse') scheduleClose()
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) show()
        }}
        onBlur={scheduleClose}
        onClick={() => {
          cancelClose()
          setOpen((current) => !current)
        }}
        onKeyDown={(event) => {
          if (open && (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey))) {
            event.preventDefault()
            panelRef.current?.querySelector('button')?.focus()
          }
        }}
      >
        {trigger}
        <span
          className={cn(trigger && 'ml-0.5 align-super text-xs leading-none font-semibold text-primary')}
          aria-hidden="true"
        >
          ?
        </span>
      </button>
      {portalHost &&
        createPortal(
          <div
            ref={setPanelRef}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-hidden={!open}
            inert={!open}
            data-panel
            data-open={open}
            className="group/info pointer-events-none invisible fixed z-9999 flex max-h-72 w-76 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-border bg-background font-body text-sm/relaxed text-foreground shadow-lg [clip-path:inset(0_100%_100%_0)] [transition:clip-path_180ms_ease-out,visibility_0s_linear_180ms] data-[align=right]:[clip-path:inset(0_0_100%_100%)] data-[open=true]:pointer-events-auto data-[open=true]:visible data-[open=true]:[clip-path:inset(0)]! data-[open=true]:[transition:clip-path_180ms_ease-out,visibility_0s_linear_0s] data-[align=left]:data-[side=above]:[clip-path:inset(100%_100%_0_0)] data-[align=right]:data-[side=above]:[clip-path:inset(100%_0_0_100%)] motion-reduce:transition-none"
            onPointerEnter={cancelClose}
            onPointerLeave={(event) => {
              if (openOnHover && event.pointerType === 'mouse') scheduleClose()
            }}
            onFocus={cancelClose}
            onBlur={scheduleClose}
          >
            <div data-popover-heading className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 pb-3">
              <h2 id={titleId} className="text-sm/normal font-semibold">
                {label}
              </h2>
              <button
                type="button"
                aria-label="Cerrar explicación"
                className="-mt-1 -mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-xl/none text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => {
                  triggerRef.current?.focus()
                  close()
                }}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div
              data-popover-body
              role="region"
              aria-labelledby={titleId}
              tabIndex={0}
              className="min-h-0 translate-y-1 scrollbar-thin [scrollbar-color:var(--color-primary)_var(--color-background)] overflow-y-auto overscroll-contain px-4 pb-4 wrap-break-word text-text opacity-0 [transition:opacity_120ms_ease-out,transform_120ms_ease-out] group-data-[open=true]/info:translate-y-0 group-data-[open=true]/info:opacity-100 group-data-[open=true]/info:[transition:opacity_120ms_ease-out_60ms,transform_120ms_ease-out_60ms] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none [&_p+p]:mt-4"
            >
              {children}
            </div>
          </div>,
          portalHost
        )}
    </>
  )
}
