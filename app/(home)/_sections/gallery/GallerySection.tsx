import { SectionHeading } from '@/_components/SectionHeading'
import { GalleryCarousel, type GalleryImage } from './GalleryCarousel'

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const images: readonly GalleryImage[] = [
  {
    src: '/images/gallery/equipo.jpg',
    width: 900,
    height: 555,
    alt: 'Equipo de Iluminaconciencia',
    caption: loremIpsum
  },
  {
    src: '/images/gallery/boletin-contaminacion-luminica.jpg',
    width: 900,
    height: 1101,
    alt: 'Boletín sobre contaminación lumínica'
  },
  { src: '/images/gallery/chile-circular.jpg', width: 370, height: 240, alt: 'Chile Circular', caption: loremIpsum },
  { src: '/images/gallery/contaminacion-luminica.jpg', width: 370, height: 240, alt: 'Contaminación lumínica' },
  {
    src: '/images/gallery/seminario-medicion.jpg',
    width: 370,
    height: 240,
    alt: 'Seminario de medición de contaminación lumínica',
    caption: loremIpsum
  },
  { src: '/images/gallery/sky-desktop.webp', width: 1920, height: 1080, alt: 'Cielo nocturno estrellado' },
  {
    src: '/images/gallery/sky-mobile.webp',
    width: 780,
    height: 1688,
    alt: 'Cielo nocturno en formato vertical',
    caption: loremIpsum
  },
  { src: '/images/gallery/tess4c.png', width: 1749, height: 1779, alt: 'Fotómetro TESS 4C' },
  { src: '/images/gallery/tessw.png', width: 1749, height: 1779, alt: 'Fotómetro TESS-W', caption: loremIpsum },
  { src: '/images/gallery/bortle.png', width: 8335, height: 1251, alt: 'Escala de Bortle' },
  { src: '/images/gallery/abel_aracena.jpg', width: 700, height: 700, alt: 'Abel Aracena', caption: loremIpsum },
  { src: '/images/gallery/daniel.jpg', width: 700, height: 700, alt: 'Daniel' },
  { src: '/images/gallery/emilio_castro.jpg', width: 700, height: 700, alt: 'Emilio Castro', caption: loremIpsum },
  { src: '/images/gallery/fabian_vasquez.jpg', width: 700, height: 700, alt: 'Fabián Vásquez' },
  { src: '/images/gallery/felipe_ramos.jpg', width: 700, height: 700, alt: 'Felipe Ramos', caption: loremIpsum },
  { src: '/images/gallery/guillermo_damke.jpg', width: 700, height: 700, alt: 'Guillermo Damke' },
  { src: '/images/gallery/juan_pablo.jpg', width: 700, height: 700, alt: 'Juan Pablo', caption: loremIpsum },
  { src: '/images/gallery/karina_nunez.jpg', width: 700, height: 700, alt: 'Karina Núñez' },
  { src: '/images/gallery/marcelo_jaque.jpg', width: 700, height: 700, alt: 'Marcelo Jaque', caption: loremIpsum },
  { src: '/images/gallery/rodolfo_angeloni.jpg', width: 700, height: 700, alt: 'Rodolfo Angeloni' },
  { src: '/images/gallery/sergio.jpg', width: 700, height: 700, alt: 'Sergio', caption: loremIpsum }
]

export function GallerySection() {
  return (
    <section id="galeria" aria-labelledby="galeria-title" className="scroll-mt-20 px-4 sm:px-5">
      <div className="mx-auto w-full max-w-360">
        <SectionHeading titleId="galeria-title" eyebrow="05 / GALERÍA" title="Galería" />
        <GalleryCarousel images={images} />
      </div>
    </section>
  )
}
