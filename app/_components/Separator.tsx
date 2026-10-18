import { BrandStarIcon } from './BrandStarIcon'

export function Separator() {
  return (
    <div aria-hidden="true" className="container mx-auto flex items-center justify-center gap-4 px-4">
      <span className="h-px flex-1 bg-linear-to-l from-border/40 to-transparent"></span>
      <BrandStarIcon size={24} className="shrink-0 text-primary/40" />
      <span className="h-px flex-1 bg-linear-to-r from-border/40 to-transparent"></span>
    </div>
  )
}
