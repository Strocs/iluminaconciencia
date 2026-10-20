'use client'

import { useCallback, type ReactNode, type MouseEvent } from 'react'

function focusSection(root: HTMLElement, name: string) {
  const section = root.querySelector<HTMLElement>(`[data-project-section="${name}"]`)
  if (!section) return
  section.focus({ preventScroll: true })
  section.scrollIntoView({ block: 'start', behavior: 'instant' })
}

export function ProjectNavigation({ children, teamEntry = false }: { children: ReactNode; teamEntry?: boolean }) {
  const attach = useCallback(
    (root: HTMLDivElement | null) => {
      if (!root) return
      // Wait until the router has applied its own navigation scroll handling.
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (teamEntry) {
            window.history.replaceState(null, '', '/proyecto')
            focusSection(root, 'equipo')
          } else if (
            performance
              .getEntriesByType('navigation')
              .some((entry) => (entry as PerformanceNavigationTiming).type === 'reload')
          ) {
            window.scrollTo({ top: 0, behavior: 'instant' })
          }
        })
      })
      return () => cancelAnimationFrame(frame)
    },
    [teamEntry]
  )

  function navigate(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-project-target]')
    if (button?.dataset.projectTarget) focusSection(event.currentTarget, button.dataset.projectTarget)
  }

  return (
    <div
      ref={attach}
      onClick={navigate}
      className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]"
    >
      {children}
    </div>
  )
}
