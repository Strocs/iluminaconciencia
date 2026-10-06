const BORTLE_TEXT_TONES = {
  DARK: 'dark',
  LIGHT: 'light'
} as const

export type BortleTextTone = (typeof BORTLE_TEXT_TONES)[keyof typeof BORTLE_TEXT_TONES]

export interface BortleClass {
  level: number
  label: string
  name: string
  shortName: string
  color: string
  textTone: BortleTextTone
  sqmRange: string
}

export const bortleClasses = [
  {
    level: 9,
    label: '9',
    name: 'Cielo de centro de ciudad',
    shortName: 'Urbano',
    color: 'var(--color-bortle-9)',
    textTone: BORTLE_TEXT_TONES.DARK,
    sqmRange: '< 18,00'
  },
  {
    level: 8,
    label: '8',
    name: 'Cielo de ciudad',
    shortName: 'Ciudad',
    color: 'var(--color-bortle-8)',
    textTone: BORTLE_TEXT_TONES.DARK,
    sqmRange: '< 18,00'
  },
  {
    level: 7,
    label: '7',
    name: 'Transición de cielo suburbano a urbano',
    shortName: 'Transición',
    color: 'var(--color-bortle-7)',
    textTone: BORTLE_TEXT_TONES.DARK,
    sqmRange: '18,00 - 18,49'
  },
  {
    level: 6,
    label: '6',
    name: 'Cielo suburbano brillante',
    shortName: 'Suburb. brillante',
    color: 'var(--color-bortle-6)',
    textTone: BORTLE_TEXT_TONES.DARK,
    sqmRange: '18,50 - 19,09'
  },
  {
    level: 5,
    label: '5',
    name: 'Cielo suburbano',
    shortName: 'Suburbano',
    color: 'var(--color-bortle-5)',
    textTone: BORTLE_TEXT_TONES.DARK,
    sqmRange: '19,10 - 20,39'
  },
  {
    level: 4,
    label: '4',
    name: 'Transición de cielo rural a suburbano',
    shortName: 'Rural-suburb.',
    color: 'var(--color-bortle-4)',
    textTone: BORTLE_TEXT_TONES.DARK,
    sqmRange: '20,40 - 21,29'
  },
  {
    level: 3,
    label: '3',
    name: 'Cielo rural',
    shortName: 'Rural',
    color: 'var(--color-bortle-3)',
    textTone: BORTLE_TEXT_TONES.LIGHT,
    sqmRange: '21,30 - 21,59'
  },
  {
    level: 2,
    label: '2',
    name: 'Cielo oscuro típico',
    shortName: 'Cielo oscuro',
    color: 'var(--color-bortle-2)',
    textTone: BORTLE_TEXT_TONES.LIGHT,
    sqmRange: '21,60 - 21,75'
  },
  {
    level: 1,
    label: '1',
    name: 'Cielo excepcionalmente oscuro',
    shortName: 'Excepcional',
    color: 'var(--color-bortle-1)',
    textTone: BORTLE_TEXT_TONES.LIGHT,
    sqmRange: '21,76 - 22,0+'
  }
] as const satisfies readonly BortleClass[]
