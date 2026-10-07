import { Fragment, type CSSProperties } from 'react'
import { bortleClasses } from '@/_shared/bortle/bortle-classes'
import { bortleConfig } from './config'

const { focusX, nodeSpacing } = bortleConfig.visual
const trackWidth = nodeSpacing * (bortleClasses.length - 1) + 18

export function BortleScale() {
  return (
    <section
      data-hero-bortle-scale
      aria-label="Escala de Bortle"
      className="z-20 mx-auto grid w-[calc(100%-3rem)] max-w-lg grid-cols-[208px_208px] items-center gap-18 px-0 font-body text-white max-sm:w-full max-sm:grid-cols-1 max-sm:gap-4 max-sm:px-6 max-sm:text-center [@media(max-height:38rem)]:gap-2 [@media(max-height:38rem)_and_(min-width:40rem)]:w-60 [@media(max-height:38rem)_and_(min-width:40rem)]:flex-[0_0_15rem] [@media(max-height:38rem)_and_(min-width:40rem)]:grid-cols-[minmax(0,1fr)] [@media(max-height:38rem)_and_(min-width:40rem)]:gap-2 [@media(max-height:38rem)_and_(min-width:40rem)]:px-0 [@media(max-width:639px)_and_(max-height:38rem)]:gap-y-1"
    >
      <div className="relative min-h-24 text-right max-sm:min-h-22 max-sm:text-center [@media(max-height:38rem)_and_(min-width:40rem)]:min-h-18 [@media(max-height:38rem)_and_(min-width:40rem)]:text-center [@media(max-width:639px)_and_(max-height:38rem)]:min-h-15">
        {bortleClasses.map((bortleClass, index) => (
          <div
            key={bortleClass.level}
            data-hero-bortle-panel={bortleClass.level}
            aria-current={index === 0 ? 'true' : undefined}
            hidden={index !== 0}
            className="absolute inset-0 flex flex-col justify-center"
          >
            <p className="text-[1.45rem] leading-none font-medium tracking-[0.01em] text-primary">
              BORTLE {bortleClass.level}
            </p>
            <p className="mt-2 text-sm leading-tight font-normal text-white/90">{bortleClass.name}</p>
            <p className="mt-2 text-xs leading-none font-light text-white/65">{bortleClass.sqmRange} Mag. arc/seg²</p>
          </div>
        ))}
      </div>

      <div
        className="relative h-16 w-52 max-sm:mx-auto [@media(max-height:38rem)_and_(min-width:40rem)]:mx-auto [@media(max-height:38rem)_and_(min-width:40rem)]:h-12 [@media(max-width:639px)_and_(max-height:38rem)]:h-12"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 inset-y-[-30px] overflow-hidden">
          <div
            data-hero-bortle-track
            className="absolute top-[38px] left-0 h-12 transform-[translateX(var(--bortle-focus-x))] will-change-transform"
            style={{ '--bortle-focus-x': `${focusX}px`, width: `${trackWidth}px` } as CSSProperties}
          >
            {bortleClasses.slice(0, -1).map((bortleClass, index) => (
              <Fragment key={bortleClass.level}>
                <span
                  data-hero-bortle-base-connector
                  className="absolute top-2 h-px origin-left bg-[#616268] opacity-40"
                  style={{ left: `${index * nodeSpacing}px`, width: `${nodeSpacing}px` }}
                />
                <span
                  data-hero-bortle-connector={bortleClass.level}
                  className="absolute top-2 h-px origin-left scale-x-0 bg-primary opacity-0 shadow-[0_0_8px_#f4bd63] will-change-transform"
                  style={{ left: `${index * nodeSpacing}px`, width: `${nodeSpacing}px` }}
                />
              </Fragment>
            ))}
            {bortleClasses.map((bortleClass, index) => (
              <div
                key={bortleClass.level}
                data-hero-bortle-node={bortleClass.level}
                data-active={index === 0 ? '' : undefined}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center opacity-20 nth-of-type-1:opacity-100 nth-of-type-2:opacity-70 nth-of-type-3:opacity-50 nth-of-type-4:opacity-33 [&[data-active]_[data-hero-bortle-dot]]:scale-100 [&[data-active]_[data-hero-bortle-dot]]:bg-primary [&[data-active]_[data-hero-bortle-dot]]:shadow-[0_0_7px_#f4bd63,0_0_22px_rgb(244_189_99/55%)] [&[data-active]_span:last-child]:text-primary"
                style={{ left: `${index * nodeSpacing}px` }}
              >
                <span
                  data-hero-bortle-dot
                  className="block size-[18px] scale-(--scale-bortle-dot) rounded-full bg-[#616268] will-change-transform"
                />
                <span className="mt-2 text-xs leading-none text-[#87888d]">{bortleClass.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
