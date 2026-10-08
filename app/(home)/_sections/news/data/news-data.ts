export interface NewsItem {
  date: string
  description: string
  href: string
  image: string
  imageAlt: string
  title: string
}

export interface ArticleItem {
  category: string
  date: string
  description: string
  href: string
  image?: string
  imageAlt?: string
  title: string
}

export const newsItems: NewsItem[] = [
  {
    date: '7 OCT 2025',
    description:
      'En el 9 capítulo, Jennifer Boltd viaja al norte del país para conocer a astrónomos, profesoras y estudiantes que luchan contra la contaminación lumínica.',
    href: 'https://iluminaconciencia.userena.digital/news_item/31/',
    image: '/images/news/chile-circular.jpg',
    imageAlt: 'Jennifer Boltd durante una entrevista para Chile Circular de NTV',
    title: 'Chile Circular de NTV: Región de Coquimbo'
  },
  {
    date: '25 AGO 2025',
    description:
      'Científicos chilenos desarrollan un software que permitirá evaluar los niveles de luz artificial, con el objetivo de contrarrestar. Científicos chilenos desarrollan un software que permitirá evaluar los niveles de luz artificial, con el objetivo de contrarrestar Científicos chilenos desarrollan un software que permitirá evaluar los niveles de luz artificial, con el objetivo de contrarrestar  Científicos chilenos desarrollan un software que permitirá evaluar los niveles de luz artificial, con el objetivo de contrarrestar',
    href: 'https://iluminaconciencia.userena.digital/news_item/30/',
    image: '/images/news/contaminacion-luminica.jpg',
    imageAlt: 'Vista nocturna de una ciudad de la Región de Coquimbo iluminada',
    title: 'Contaminación lumínica amenaza a los cielos chilenos: Chile Circular de NTV: Región de Coquimbo'
  },
  {
    date: '24 JUL 2025',
    description:
      'El pasado martes 23 de julio, se llevó a cabo el Seminario de Medición de Contaminación Lumínica en Chile 2024, en el Centro...',
    href: 'https://iluminaconciencia.userena.digital/news_item/34/',
    image: '/images/news/seminario-medicion.jpg',
    imageAlt: 'Panel de especialistas en el Seminario de Medición de Contaminación Lumínica',
    title: '¿Por qué se necesitan datos para proteger los cielos oscuros...'
  }
]

export const articleItems: ArticleItem[] = [
  {
    category: 'Boletín Científico',
    date: 'OCTUBRE 2023',
    description: 'Proyecto de Difusión - Universidad de La Serena',
    href: 'https://vipuls.userena.digital/divulgacion/boletin/4/',
    image: '/images/news/boletin-contaminacion-luminica.jpg',
    imageAlt: 'Portada del boletín Contaminación Lumínica, una realidad sobre nuestros cielos',
    title: 'Contaminación Lumínica, una realidad sobre nuestros cielos'
  },
  {
    category: 'Investigación',
    date: 'ENERO 2024',
    description:
      'Publicación científica - Revista de Astronomía. Publicación científica - Revista de Astronomía.Publicación científica - Revista de AstronomíaPublicación científica - Revista de AstronomíaPublicación científica - Revista de AstronomíaPublicación científica - Revista de AstronomíaPublicación científica - Revista de Astronomía',
    href: 'https://iopscience.iop.org/article/10.3847/1538-3881/ad165c',
    title:
      'Toward a Spectrophotometric Characterization of the Chilean Night Sky. A First Quantitative Assessment of ALAN across the Coquimbo Region'
  },
  {
    category: 'Publicación',
    date: '2025',
    description: 'Revista de Astronomía - Universidad de Antofagasta',
    href: 'https://www.astroscu.unam.mx/rmaa/RMxAA..61-1/PDF/RMxAA..61-1_juchima-X.pdf',
    title: 'A First Quantitative Characterization of Colombian Night Sky Through All-Sky Photometry'
  }
]
