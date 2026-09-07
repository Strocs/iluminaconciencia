import type { BortleClass } from '@shared/features/bortle'

export interface BortleFilter {
  destroy(): void
}

interface BortleFilterOptions {
  root: HTMLElement
  classes: readonly BortleClass[]
  onToggle: (selected: ReadonlySet<number>) => void
}

interface ManagedElement {
  element: HTMLElement
  level: number
  onClick: () => void
  onKeyDown: (event: KeyboardEvent) => void
  role: string | null
  tabIndex: string | null
  ariaPressed: string | null
  active: string | null
}

export function createBortleFilter({ root, classes, onToggle }: BortleFilterOptions): BortleFilter {
  const selected = new Set(classes.map((bortleClass) => bortleClass.level))
  const managedElements: ManagedElement[] = []

  const setActive = (element: HTMLElement, active: boolean): void => {
    element.setAttribute('aria-pressed', String(active))
    element.toggleAttribute('data-active', active)
  }

  const applyFilterSemantics = (managed: ManagedElement): void => {
    managed.element.setAttribute('role', 'button')
    managed.element.setAttribute('tabindex', '0')
    setActive(managed.element, selected.has(managed.level))
  }

  const restoreOriginalAttributes = (managed: ManagedElement): void => {
    const { element, role, tabIndex, ariaPressed, active } = managed
    if (role === null) element.removeAttribute('role')
    else element.setAttribute('role', role)
    if (tabIndex === null) element.removeAttribute('tabindex')
    else element.setAttribute('tabindex', tabIndex)
    if (ariaPressed === null) element.removeAttribute('aria-pressed')
    else element.setAttribute('aria-pressed', ariaPressed)
    if (active === null) element.removeAttribute('data-active')
    else element.setAttribute('data-active', active)
  }

  const toggle = (managed: ManagedElement): void => {
    if (selected.has(managed.level)) {
      selected.delete(managed.level)
    } else {
      selected.add(managed.level)
    }

    managedElements.forEach(({ element, level }) => setActive(element, selected.has(level)))
    onToggle(new Set(selected))
  }

  root.querySelectorAll<HTMLElement>('[data-map-bortle-class]').forEach((element) => {
    const level = Number(element.dataset.mapBortleClass)
    if (!Number.isFinite(level)) return

    const managed: ManagedElement = {
      element,
      level,
      onClick: () => toggle(managed),
      onKeyDown: (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        toggle(managed)
      },
      role: element.getAttribute('role'),
      tabIndex: element.getAttribute('tabindex'),
      ariaPressed: element.getAttribute('aria-pressed'),
      active: element.getAttribute('data-active')
    }

    applyFilterSemantics(managed)
    element.addEventListener('click', managed.onClick)
    element.addEventListener('keydown', managed.onKeyDown)
    managedElements.push(managed)
  })

  return {
    destroy() {
      managedElements.forEach((managed) => {
        const { element, onClick, onKeyDown } = managed
        element.removeEventListener('click', onClick)
        element.removeEventListener('keydown', onKeyDown)
        restoreOriginalAttributes(managed)
      })
    }
  }
}
