export type HighlightedTitleFragment = 'proteger los cielos' | 'impacto negativo' | 'primer paso'

export interface HeroScene {
  id: string
  title: {
    before: string
    highlight: HighlightedTitleFragment
    after: string
  }
  copy: string
  cta: {
    label: string
    href: string
  }
}

export const heroScenes = [
  {
    id: 'introduction',
    title: {
      before: 'Medimos la contaminación lumínica para ',
      highlight: 'proteger los cielos',
      after: ' de la Región de Coquimbo'
    },
    copy: 'Generamos una red que mide la contaminación lumínica en tiempo real para apoyar la toma de decisiones.',
    cta: {
      label: 'Quiénes somos',
      href: '#'
    }
  },
  {
    id: 'negative-impact',
    title: {
      before: 'La iluminación excesiva genera un ',
      highlight: 'impacto negativo',
      after: ' en la calidad de vida'
    },
    copy: 'La contaminación lumínica altera progresivamente la oscuridad natural del territorio y afecta a las personas, la biodiversidad y el uso eficiente de la energía.',
    cta: {
      label: 'Qué hacemos',
      href: '#'
    }
  },
  {
    id: 'territorial-decisions',
    title: {
      before: 'Comprender el problema es el ',
      highlight: 'primer paso',
      after: ' para disminuirlo'
    },
    copy: 'Nuestra red de medición transforma observaciones del territorio en información para orientar decisiones.',
    cta: {
      label: 'Saber más',
      href: '#'
    }
  }
] as const satisfies readonly HeroScene[]
