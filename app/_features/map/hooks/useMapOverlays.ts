'use client'

import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { MapGroup, MapMark } from '../types'
import { useMapMobile } from './useMapMobile'
import { useMapFilters } from './useMapFilters'

export function useMapOverlays() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const groups = useMapFilters((state) => state.filteredGroups)
  const drawerGroup = groups.find(({ id }) => id === selectedGroupId) ?? null
  const explorerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const drawerListRef = useRef<HTMLDivElement>(null)
  const filterOpenRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const filterTitleId = useId()
  const filterPanelId = useId()
  const closeFiltersForDesktop = useCallback(() => {
    setFiltersOpen(false)
  }, [])
  const mobile = useMapMobile(closeFiltersForDesktop)
  const drawerOpen = drawerGroup !== null

  const closeDrawer = useCallback(
    (restoreFocus = true) => {
      setSelectedGroupId(null)
      setSelectedId(null)
      const focusTarget = returnFocusRef.current
      const groupId = selectedGroupId
      if (restoreFocus)
        requestAnimationFrame(() => {
          // Filtering may replace a composite with a single button or remove it altogether.
          const replacement = Array.from(
            explorerRef.current?.querySelectorAll<HTMLElement>('[data-map-group]') ?? []
          ).find((node) => node.dataset.mapGroup === groupId)
          const target =
            focusTarget?.isConnected && !focusTarget.closest('[inert]') && focusTarget.getClientRects().length
              ? focusTarget
              : replacement?.getClientRects().length
                ? replacement
                : explorerRef.current
          target?.focus({ preventScroll: true })
        })
      returnFocusRef.current = null
    },
    [selectedGroupId]
  )

  const onFiltersChanged = useCallback(
    (nextMarks: MapMark[]) => {
      if (!drawerGroup) return
      const visibleIds = new Set(nextMarks.map(({ id }) => id))
      const remaining = drawerGroup.members.filter(({ id }) => visibleIds.has(id))
      if (!remaining.length) {
        const focusInsideDrawer = Boolean(
          explorerRef.current?.querySelector('#mark-drawer')?.contains(document.activeElement)
        )
        closeDrawer(focusInsideDrawer)
      } else if (selectedId && !visibleIds.has(selectedId)) setSelectedId(null)
    },
    [drawerGroup, selectedId, closeDrawer]
  )

  const openDrawer = useCallback(
    (group: MapGroup, trigger: HTMLElement, memberId?: string) => {
      if (filtersOpen) return
      if (selectedGroupId !== group.id) returnFocusRef.current = trigger
      setSelectedGroupId(group.id)
      setSelectedId(memberId ?? null)
      requestAnimationFrame(() => {
        if (!memberId) {
          drawerCloseRef.current?.focus({ preventScroll: true })
          return
        }
        const list = drawerListRef.current
        const article = Array.from(list?.querySelectorAll<HTMLElement>('[data-map-member]') ?? []).find(
          (node) => node.dataset.mapMember === memberId
        )
        if (!list || !article) return
        article.focus({ preventScroll: true })

        // Only the list scrolls; ancestor scrolling can shift the map during the slide-in.
        const listRect = list.getBoundingClientRect()
        const articleRect = article.getBoundingClientRect()
        const top = articleRect.top - (listRect.top + list.clientTop)
        const bottom = articleRect.bottom - (listRect.top + list.clientTop + list.clientHeight)
        // An article spanning the entire viewport is already as visible as possible.
        if (top < 0 && bottom > 0) return
        if (top < 0) list.scrollTop += Math.max(top, bottom)
        else if (bottom > 0) list.scrollTop += Math.min(top, bottom)
      })
    },
    [filtersOpen, selectedGroupId]
  )

  const openFilters = useCallback(() => {
    closeDrawer(false)
    returnFocusRef.current = filterOpenRef.current
    setFiltersOpen(true)
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLButtonElement>('[data-filter-close]')?.focus())
  }, [closeDrawer])

  const closeFilters = useCallback((restoreFocus = true) => {
    setFiltersOpen(false)
    const focusTarget = returnFocusRef.current
    if (restoreFocus)
      requestAnimationFrame(() => {
        if (focusTarget?.isConnected) focusTarget.focus()
        else explorerRef.current?.focus()
      })
    returnFocusRef.current = null
  }, [])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      if (filtersOpen) closeFilters()
      else if (drawerOpen) closeDrawer()
      else return
      event.preventDefault()
      event.stopPropagation()
    }
    if (event.key !== 'Tab' || !mobile || (!filtersOpen && !drawerOpen)) return
    const overlay = filtersOpen ? panelRef.current : explorerRef.current?.querySelector('#mark-drawer')
    const targets = Array.from(
      overlay?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]') ?? []
    ).filter((node) => !node.closest('[inert]') && node.getClientRects().length)
    const first = targets[0]
    const last = targets.at(-1)
    if (
      event.shiftKey &&
      (document.activeElement === first || !targets.includes(document.activeElement as HTMLElement))
    ) {
      event.preventDefault()
      last?.focus()
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || !targets.includes(document.activeElement as HTMLElement))
    ) {
      event.preventDefault()
      first?.focus()
    }
  }

  return {
    selectedId,
    selectedGroupId,
    drawerGroup,
    drawerOpen,
    filtersOpen,
    mobile,
    explorerRef,
    panelRef,
    drawerCloseRef,
    drawerListRef,
    filterOpenRef,
    filterTitleId,
    filterPanelId,
    onFiltersChanged,
    openDrawer,
    openFilters,
    closeDrawer,
    closeFilters,
    onKeyDown
  }
}
