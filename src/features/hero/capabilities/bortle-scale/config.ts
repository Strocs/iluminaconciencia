const nodeRadius = 10
const nodeSpacing = 36

export const bortleConfig = {
  /** Fraction of the hero scroll journey (0..1 = 0..100%) at which the scale
   *  reaches its final level. Pure choreography control: independent of hero
   *  height, viewport size, or trigger positions. */
  endProgress: 0.8,
  visual: {
    nodeSpacing,
    focusX: nodeRadius + nodeSpacing
  }
} as const
