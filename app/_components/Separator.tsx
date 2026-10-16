import { BrandStarIcon } from './BrandStarIcon'

export function Separator() {
  return (
    <div aria-hidden="true" className="container mx-auto flex items-center justify-center gap-6 px-4">
      <span className="flex-1 border-t border-border"></span>
      <BrandStarIcon size={42} className="shrink-0 text-primary" />
      <span className="flex-1 border-t border-border"></span>
    </div>
  )
}
