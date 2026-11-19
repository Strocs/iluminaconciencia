import type { ReactNode } from 'react'
import { UserenaLayout } from '@/_features/userena'
import { HeaderLayout } from '@/_features/header'
import { ProjectFooter } from '@/_features/footer/ProjectFooter'

export function StandardLayout({ children }: { children: ReactNode }) {
  return (
    <UserenaLayout>
      <HeaderLayout>
        {children}
        <footer className="border-t border-border bg-background">
          <ProjectFooter />
        </footer>
      </HeaderLayout>
    </UserenaLayout>
  )
}
