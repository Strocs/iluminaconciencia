export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_100%,#3b1f45_0%,#170d2f_40%,#010005_100%)]" />
      <svg className="absolute inset-0 size-full opacity-40" focusable="false">
        <defs>
          <filter id="noise">
            <feTurbulence baseFrequency="0.6" stitchTiles="stitch" numOctaves="3" type="fractalNoise" />
          </filter>
          <pattern id="noisePattern" width="256" height="256" patternUnits="userSpaceOnUse">
            <rect width="256" height="256" filter="url(#noise)" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#noisePattern)" />
      </svg>
    </div>
  )
}
