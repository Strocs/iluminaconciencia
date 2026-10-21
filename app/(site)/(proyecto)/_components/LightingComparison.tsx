'use client'

import { useState } from 'react'
import { cn } from '@/_utils/cn'

export function LightingComparison() {
  const [directed, setDirected] = useState(false)

  return (
    <div className="space-y-5 rounded-sm border border-border/40 p-5 sm:p-8">
      <div role="group" aria-label="Comparar la dirección de la luz" className="flex flex-wrap gap-3">
        {[
          { label: 'Luz dispersa', value: false },
          { label: 'Luz dirigida', value: true }
        ].map(({ label, value }) => (
          <button
            key={label}
            type="button"
            aria-pressed={directed === value}
            onClick={() => setDirected(value)}
            className={cn(
              'cursor-pointer rounded-sm border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none',
              directed === value
                ? 'border-primary bg-primary text-background'
                : 'border-border/40 text-text hover:border-primary hover:text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <figure className="space-y-4">
        <svg viewBox="0 0 320 180" className="mx-auto h-48 w-full max-w-md text-primary" aria-hidden="true">
          <path d="M20 160h280M130 160V65h65" fill="none" stroke="currentColor" strokeWidth="4" />
          {directed ? (
            <g>
              <path d="m195 65-20 12h40z" fill="currentColor" />
              <path d="m180 84-28 65m43-65v65m15-65 28 65" fill="none" stroke="currentColor" strokeWidth="2" />
            </g>
          ) : (
            <g>
              <circle cx="195" cy="65" r="9" fill="currentColor" />
              <path
                d="m195 44V15m15 35 32-29m-62 29-32-29m69 44h52m-96 0h-32m53 23v60m18-66 41 42m-76-42-25 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
        <figcaption aria-live="polite" className="font-extralight">
          {directed
            ? 'La luz se concentra hacia abajo, sobre la superficie donde resulta útil.'
            : 'Parte de la luz se dirige al cielo o fuera de la superficie que se quiere iluminar.'}
        </figcaption>
      </figure>
      <p className="text-sm font-extralight text-text">
        Selecciona una opción para observar cómo cambia la dirección de la luz. Ilustración conceptual, no una
        simulación de mediciones.
      </p>
    </div>
  )
}
