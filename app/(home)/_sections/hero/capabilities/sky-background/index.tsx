import { getImageProps } from 'next/image'

export function SkyBackground() {
  const { props: desktop } = getImageProps({
    src: '/hero/sky-desktop.webp',
    width: 1920,
    height: 1080,
    alt: '',
    unoptimized: true
  })
  const { props: mobile } = getImageProps({
    src: '/hero/sky-mobile.webp',
    width: 780,
    height: 1688,
    alt: '',
    unoptimized: true,
    loading: 'eager',
    fetchPriority: 'high'
  })

  return (
    <div className="@container-size pointer-events-none absolute inset-0 isolate overflow-hidden">
      <div
        data-hero-sky-background
        className="absolute inset-0 overflow-hidden"
        style={{ opacity: 0.05 }}
        aria-hidden="true"
      >
        <picture>
          <source
            media="(min-width: 1024px) and (orientation: landscape)"
            srcSet={desktop.src}
            width={desktop.width}
            height={desktop.height}
          />
          <img
            {...mobile}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-center"
          />
        </picture>
      </div>
    </div>
  )
}
