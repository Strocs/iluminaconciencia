'use client'

import { useCallback, useId, useRef, useState } from 'react'
import type { MapMark } from '../data/types'
import { useMapMobile } from './useMapMobile'

export function useMapOverlays() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerMark, setDrawerMark] = useState<MapMark | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const filterOpenRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const filterTitleId = useId()
  const filterPanelId = useId()
  const closeFiltersForDesktop = useCallback(() => {
    setFiltersOpen(false)
    returnFocusRef.current = null
  }, [])
  const mobile = useMapMobile(closeFiltersForDesktop)

  const drawerOpen = selectedId !== null
  const mobileOverlayOpen = mobile && (filtersOpen || drawerOpen)

  const onFiltersChanged = useCallback(
    (nextMarks: MapMark[]) => {
      if (selectedId && !nextMarks.some(({ id }) => id === selectedId)) {
        setSelectedId(null)
        returnFocusRef.current = null
      }
    },
    [selectedId]
  )

  const closeDrawer = useCallback((restoreFocus = true) => {
    setSelectedId(null)
    const focusTarget = returnFocusRef.current
    if (restoreFocus && focusTarget?.isConnected) {
      requestAnimationFrame(() => {
        if (focusTarget.isConnected) focusTarget.focus()
      })
    }
    returnFocusRef.current = null
  }, [])

  const openDrawer = useCallback(
    (mark: MapMark, trigger: HTMLElement) => {
      if (filtersOpen) return
      returnFocusRef.current = trigger
      setSelectedId(mark.id)
      setDrawerMark(mark)
      requestAnimationFrame(() => drawerCloseRef.current?.focus({ preventScroll: true }))
    },
    [filtersOpen]
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
    if (restoreFocus && focusTarget?.isConnected) {
      requestAnimationFrame(() => {
        if (focusTarget.isConnected) focusTarget.focus()
      })
    }
    returnFocusRef.current = null
  }, [])

  return {
    selectedId,
    drawerMark,
    drawerOpen,
    filtersOpen,
    mobile,
    mobileOverlayOpen,
    panelRef,
    drawerCloseRef,
    filterOpenRef,
    filterTitleId,
    filterPanelId,
    onFiltersChanged,
    openDrawer,
    openFilters,
    closeDrawer,
    closeFilters
  }
}
