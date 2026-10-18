export function PublicationCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative min-h-0 animate-pulse py-5 opacity-50 motion-reduce:animate-none sm:h-42 sm:min-h-auto sm:py-4"
    >
      <div className="relative flex h-fit flex-col gap-4 sm:h-full sm:flex-row md:min-h-0">
        <div className="aspect-video w-full shrink-0 rounded bg-border/40 sm:aspect-square sm:h-full sm:w-auto" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="h-4 w-24 rounded bg-border/40" />
          <div className="space-y-1">
            <div className="h-6 w-full rounded bg-border/40" />
            <div className="h-6 w-3/4 rounded bg-border/40" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-full rounded bg-border/40" />
            <div className="h-4 w-5/6 rounded bg-border/40" />
          </div>
        </div>
        <div className="my-auto hidden size-6 shrink-0 rounded bg-border/40 sm:block" />
      </div>
    </div>
  )
}
