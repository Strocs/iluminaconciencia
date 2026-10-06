export default function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,#3b1f45_0%,#170d2f_40%,#010005_100%)]" />
      <svg
        className="absolute inset-0 size-full opacity-40 mix-blend-multiply"
        viewBox="0 0 600 600"
        preserveAspectRatio="none"
        focusable="false"
      >
        <filter id="home-background-noise-filter">
          <feTurbulence baseFrequency="2.5" />
        </filter>
        <rect width="100%" height="100%" filter="url(#home-background-noise-filter)" />
      </svg>
    </div>
  )
}
