import type { ReactNode } from 'react'
import { ResponsiveSidebar } from './ResponsiveSidebar'

export function SiteSidebar({ children }: { children: ReactNode }) {
  return <ResponsiveSidebar>{children}</ResponsiveSidebar>
}
