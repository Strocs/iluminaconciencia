export interface HeroScene {
  id: string;
  eyebrow: string | null;
  title: string;
  copy: string | null;
}

export const heroScenes = [
  {
    id: 'introduction',
    eyebrow: null,
    title: 'Medimos la contaminación lumínica para proteger los cielos de la Región de Coquimbo',
    copy: 'IluminaConCiencia genera información territorial para comprender el problema y apoyar mejores decisiones',
  },
  {
    id: 'night-value',
    eyebrow: 'El valor de la noche',
    title: 'Coquimbo posee uno de los cielos más valiosos del mundo.',
    copy: 'La luz artificial está alterando progresivamente la oscuridad natural que hace único este territorio.',
  },
  {
    id: 'shared-concern',
    eyebrow: 'Una preocupación compartida',
    title: 'No es solamente un problema astronómico',
    copy: 'La contaminación lumínica afecta a las personas, la biodiversidad y el uso eficiente de la energía.',
  },
  {
    id: 'territorial-decisions',
    eyebrow: 'Del territorio a las decisiones',
    title: 'Comprender el problema es el primer paso para disminuirlo',
    copy: 'Nuestra red de medición transforma observaciones del territorio en información que puede orientar decisiones.',
  },
  {
    id: 'shared-right',
    eyebrow: 'Un derecho compartido',
    title: 'Contemplar el firmamento es un derecho de todas y todos.',
    copy: null,
  },
] as const satisfies readonly HeroScene[];
