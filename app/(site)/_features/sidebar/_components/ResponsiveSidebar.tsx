'use client'

import { useCallback, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'

const controlClass =
  'flex size-12 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-primary shadow-lg transition-colors hover:bg-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none'

export function ResponsiveSidebar({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef(true)
  const [open, setOpen] = useState(false)
  const id = useId()

  const attachDialog = useCallback((node: HTMLDialogElement | null) => {
    dialog.current = node
    if (!node) return
    const desktop = window.matchMedia('(min-width: 96rem)')
    const closeOnDesktop = () => {
      if (desktop.matches && node.open) node.close()
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  function close() {
    dialog.current?.close()
  }

  function handlePanelClick(event: MouseEvent<HTMLDialogElement>) {
    const target = event.target as HTMLElement
    if (target.closest('a[href], button[data-project-target]')) {
      restoreFocus.current = false
      close()
    }
    if (target === event.currentTarget) {
      const bounds = event.currentTarget.getBoundingClientRect()
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        close()
    }
  }

  return (
    <>
      <aside
        aria-label="Explora otras secciones"
        className="hidden min-w-0 space-y-10 border-l border-border/40 pl-6 2xl:sticky 2xl:top-24 2xl:col-start-2 2xl:block 2xl:self-start"
      >
        {children}
      </aside>
      <div className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col gap-3 2xl:hidden">
        <button
          ref={trigger}
          type="button"
          aria-label="Abrir panel lateral"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={id}
          className={controlClass}
          onClick={() => {
            restoreFocus.current = true
            const panel = dialog.current
            if (!panel) return
            panel.showModal()
            setOpen(true)
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M15 4v16M6 9h6M6 13h6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Volver al inicio de la página"
          className={controlClass}
          onClick={() => {
            const heading = document.querySelector('h1')
            if (heading) {
              heading.setAttribute('tabindex', '-1')
              heading.focus({ preventScroll: true })
            }
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
            })
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m5 11 7-7 7 7M12 4v16" />
          </svg>
        </button>
      </div>
      <dialog
        ref={attachDialog}
        id={id}
        aria-labelledby={`${id}-title`}
        onClick={handlePanelClick}
        onClose={() => {
          setOpen(false)
          if (restoreFocus.current && !window.matchMedia('(min-width: 96rem)').matches) {
            trigger.current?.focus({ preventScroll: true })
          }
        }}
        className="fixed inset-y-4 right-0 left-auto m-0 h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-[calc(100%-1rem)] max-w-sm translate-x-full flex-col overflow-hidden rounded-l-lg border-y border-l border-border bg-background p-6 text-text transition-[translate,display,overlay] transition-discrete duration-200 ease-in-out backdrop:bg-transparent open:flex open:translate-x-0 motion-reduce:transition-none motion-reduce:duration-0 starting:open:translate-x-full"
      >
        <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
          <h2 id={`${id}-title`} className="font-heading text-2xl text-foreground">
            Explorar esta página
          </h2>
          <button type="button" autoFocus aria-label="Cerrar panel lateral" onClick={close} className={controlClass}>
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 pr-3">
          <div className="space-y-10">{children}</div>
        </div>
      </dialog>
    </>
  )
}
