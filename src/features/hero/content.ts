export interface HeroMessage {
  eyebrow: string;
  title: string;
  copy: string;
}

export const heroMessages: ReadonlyArray<HeroMessage> = [
  {
    eyebrow: 'El valor de la noche',
    title: 'Coquimbo posee uno de los cielos más valiosos del mundo.',
    copy: 'La luz artificial está alterando progresivamente la oscuridad natural que hace único este territorio.',
  },
  {
    eyebrow: 'Una preocupación compartida',
    title: 'No es solamente un problema astronómico.',
    copy: 'La contaminación lumínica afecta a las personas, la biodiversidad y el uso eficiente de la energía.',
  },
  {
    eyebrow: 'Del territorio a las decisiones',
    title: 'Comprender el problema es el primer paso para disminuirlo.',
    copy: 'Nuestra red de medición transforma observaciones del territorio en información que puede orientar decisiones.',
  },
];
