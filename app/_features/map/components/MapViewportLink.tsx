import Link from 'next/link'

export function MapViewportLink({ fullscreen }: { fullscreen: boolean }) {
  const label = fullscreen ? 'Volver al mapa del inicio' : 'Ampliar mapa a pantalla completa'

  return (
    <Link
      href={fullscreen ? '/#explorar' : '/explorar'}
      transitionTypes={['map-expand']}
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-primary hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          d={fullscreen ? 'M3 9h6V3m6 0v6h6M3 15h6v6m6 0v-6h6' : 'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  )
}
