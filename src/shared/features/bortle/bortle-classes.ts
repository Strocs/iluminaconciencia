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
}

export const bortleClasses = [
  {
    level: 9,
    label: '9',
    name: 'Centro urbano',
    shortName: 'Urbano',
    color: 'var(--color-bortle-9)',
    textTone: BORTLE_TEXT_TONES.DARK
  },
  {
    level: 8,
    label: '8',
    name: 'Ciudad',
    shortName: 'Ciudad',
    color: 'var(--color-bortle-8)',
    textTone: BORTLE_TEXT_TONES.DARK
  },
  {
    level: 7,
    label: '7',
    name: 'Transición urbana',
    shortName: 'Transición',
    color: 'var(--color-bortle-7)',
    textTone: BORTLE_TEXT_TONES.DARK
  },
  {
    level: 6,
    label: '6',
    name: 'Suburbano brillante',
    shortName: 'Suburb. brillante',
    color: 'var(--color-bortle-6)',
    textTone: BORTLE_TEXT_TONES.DARK
  },
  {
    level: 5,
    label: '5',
    name: 'Suburbano',
    shortName: 'Suburbano',
    color: 'var(--color-bortle-5)',
    textTone: BORTLE_TEXT_TONES.DARK
  },
  {
    level: 4,
    label: '4',
    name: 'Transición rural-suburbana',
    shortName: 'Rural-suburb.',
    color: 'var(--color-bortle-4)',
    textTone: BORTLE_TEXT_TONES.DARK
  },
  {
    level: 3,
    label: '3',
    name: 'Rural',
    shortName: 'Rural',
    color: 'var(--color-bortle-3)',
    textTone: BORTLE_TEXT_TONES.LIGHT
  },
  {
    level: 2,
    label: '2',
    name: 'Cielo oscuro',
    shortName: 'Cielo oscuro',
    color: 'var(--color-bortle-2)',
    textTone: BORTLE_TEXT_TONES.LIGHT
  },
  {
    level: 1,
    label: '1',
    name: 'Cielo excepcionalmente oscuro',
    shortName: 'Excepcional',
    color: 'var(--color-bortle-1)',
    textTone: BORTLE_TEXT_TONES.LIGHT
  }
] as const satisfies readonly BortleClass[]
