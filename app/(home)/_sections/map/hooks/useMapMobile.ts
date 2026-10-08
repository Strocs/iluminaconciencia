'use client'

import { useCallback, useSyncExternalStore } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

function getServerSnapshot() {
  return false
}

export function useMapMobile(onDesktop: () => void) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const query = window.matchMedia(MOBILE_QUERY)
      const onBreakpointChange = () => {
        if (!query.matches) onDesktop()
        onChange()
      }
      query.addEventListener('change', onBreakpointChange)
      return () => query.removeEventListener('change', onBreakpointChange)
    },
    [onDesktop]
  )

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
