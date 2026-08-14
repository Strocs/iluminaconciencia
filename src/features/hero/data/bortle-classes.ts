const BORTLE_TEXT_TONES = {
  DARK: 'dark',
  LIGHT: 'light'
} as const

export type BortleTextTone = (typeof BORTLE_TEXT_TONES)[keyof typeof BORTLE_TEXT_TONES]

export interface BortleClass {
  level: number
  label: string
  name: string
  color: string
  textTone: BortleTextTone
}

export const bortleClasses = [
  {
    level: 9,
    label: '8/9',
    name: 'Urbano / ciudad',
    color: '#FFFFFF',
    textTone: BORTLE_TEXT_TONES.DARK
  },
  {
    level: 7,
    label: '7',
    name: 'Periurbano y urbano',
    color: '#FF0000',
    textTone: BORTLE_TEXT_TONES.LIGHT
  },
  {
    level: 6,
    label: '6',
    name: 'Periurbano brillante',
    color: '#FF9900',
    textTone: BORTLE_TEXT_TONES.LIGHT
  },
  { level: 5, label: '5', name: 'Periurbano', color: '#FFFF00', textTone: BORTLE_TEXT_TONES.DARK },
  {
    level: 4,
    label: '4',
    name: 'Rural a cielo urbano',
    color: '#00FF00',
    textTone: BORTLE_TEXT_TONES.DARK
  },
  { level: 3, label: '3', name: 'Rural', color: '#0000FF', textTone: BORTLE_TEXT_TONES.LIGHT },
  { level: 2, label: '2', name: 'Oscuro', color: '#808080', textTone: BORTLE_TEXT_TONES.LIGHT },
  {
    level: 1,
    label: '1',
    name: 'Oscuro excelente',
    color: '#0B0F19',
    textTone: BORTLE_TEXT_TONES.LIGHT
  }
] as const satisfies readonly BortleClass[]
