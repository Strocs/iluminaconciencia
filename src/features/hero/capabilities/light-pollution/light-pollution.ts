import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { lightPollutionConfig } from './config'

type LightPollutionConfig = typeof lightPollutionConfig

const sourceSelector = '[data-hero-light-pollution-source]'
const haloSelector = '[data-hero-light-pollution-halo]'

export function createLightPollutionCapability({
  root,
  config
}: {
  root: HTMLElement
  config: LightPollutionConfig
}): HeroCapability {
  const source = root.querySelector<HTMLElement>(sourceSelector)
  const halo = root.querySelector<HTMLElement>(haloSelector)
  const timeline = gsap.timeline({ paused: true })

  if (source) {
    timeline.fromTo(
      source,
      { '--source-opacity': config.source.initialOpacity },
      {
        '--source-opacity': 0,
        duration: config.source.endProgress - config.source.startProgress,
        ease: 'none',
        immediateRender: false
      },
      config.source.startProgress
    )
  }

  if (halo) {
    const [referenceStopOne, referenceStopTwo, referenceStopThree] = config.halo.reference.stops
    const [referenceAlphaOne, referenceAlphaTwo, referenceAlphaThree] = config.halo.reference.alphas
    const [residualStopOne, residualStopTwo, residualStopThree] = config.halo.residual.stops
    const [residualAlphaOne, residualAlphaTwo, residualAlphaThree] = config.halo.residual.alphas
    const [finalStopOne, finalStopTwo, finalStopThree] = config.halo.final.stops
    const [finalAlphaOne, finalAlphaTwo, finalAlphaThree] = config.halo.final.alphas

    timeline.fromTo(
      halo,
      {
        '--halo-stop-one': `${referenceStopOne}%`,
        '--halo-stop-two': `${referenceStopTwo}%`,
        '--halo-stop-three': `${referenceStopThree}%`,
        '--halo-alpha-one': referenceAlphaOne,
        '--halo-alpha-two': referenceAlphaTwo,
        '--halo-alpha-three': referenceAlphaThree
      },
      {
        '--halo-stop-one': `${residualStopOne}%`,
        '--halo-stop-two': `${residualStopTwo}%`,
        '--halo-stop-three': `${residualStopThree}%`,
        '--halo-alpha-one': residualAlphaOne,
        '--halo-alpha-two': residualAlphaTwo,
        '--halo-alpha-three': residualAlphaThree,
        duration: config.halo.residualProgress - config.halo.startProgress,
        ease: 'none',
        immediateRender: false
      },
      config.halo.startProgress
    )
    timeline.to(
      halo,
      {
        '--halo-stop-one': `${finalStopOne}%`,
        '--halo-stop-two': `${finalStopTwo}%`,
        '--halo-stop-three': `${finalStopThree}%`,
        '--halo-alpha-one': finalAlphaOne,
        '--halo-alpha-two': finalAlphaTwo,
        '--halo-alpha-three': finalAlphaThree,
        duration: config.halo.endProgress - config.halo.residualProgress,
        ease: 'none'
      },
      config.halo.residualProgress
    )
  }

  // Keep timeline.progress(p) aligned with the shared normalized 0..1 hero progress.
  timeline.add(() => undefined, 1)

  return {
    onProgress: (progress) => timeline.progress(progress),
    destroy: () => timeline.kill()
  }
}
