'use client'

import type { ReactNode } from 'react'
import { useHeaderBehavior } from '../hooks/useHeaderBehavior'

type Props = {
  children: ReactNode
  mode: 'solid' | 'hero'
}

export function HeaderRuntime({ children, mode }: Props) {
  const headerRef = useHeaderBehavior(mode)

  return (
    <header
      ref={headerRef}
      data-site-header
      data-region={mode === 'hero' ? 'hero' : 'post-hero'}
      data-hidden="false"
      className="group fixed inset-x-0 top-0 z-100 flex h-24 flex-col overflow-hidden bg-transparent px-6 transition-[height,translate] duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] has-checked:h-dvh! has-checked:translate-y-0! data-[hidden=true]:-translate-y-full data-[region=post-hero]:h-20 motion-reduce:transition-none lg:h-32 lg:px-8 lg:data-[region=post-hero]:h-20"
    >
      {children}
    </header>
  )
}
