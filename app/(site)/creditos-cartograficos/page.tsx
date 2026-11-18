import type { Metadata } from 'next'
import { SectionHeading } from '@/_components/SectionHeading'
import { Breadcrumbs } from '../_components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Créditos cartográficos | IluminAconciencia',
  description: 'Fuentes, atribuciones y licencias de los datos cartográficos y de elevación utilizados en el mapa.',
  alternates: { canonical: '/creditos-cartograficos' }
}

export default function CartographicCreditsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Créditos cartográficos' }]} />
      <SectionHeading as="h1" eyebrow="CARTOGRAFÍA" title="Créditos cartográficos" />
      <article className="mx-auto max-w-prose space-y-10 font-body text-base leading-relaxed text-text [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-accent [&_p]:font-extralight">
        <p>
          Esta página reúne las atribuciones de los datos cartográficos y de elevación utilizados en el mapa. Los
          créditos corresponden a sus proveedores y titulares, no a la autoría ni a la propiedad de la aplicación
          IluminAconciencia. Cada fuente conserva sus condiciones de uso y licencia.
        </p>
        <section aria-labelledby="mapa-base" className="space-y-4">
          <h2 id="mapa-base" className="font-heading text-2xl text-foreground">
            Mapa base
          </h2>
          <p>
            El mapa base utiliza OpenFreeMap y OpenMapTiles, con datos de OpenStreetMap. Sus atribuciones permanecen
            visibles en el control de créditos del mapa.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <a href="https://openfreemap.org/">OpenFreeMap</a>
            </li>
            <li>
              <a href="https://openmaptiles.org/">OpenMapTiles</a>
            </li>
            <li>
              <a href="https://www.openstreetmap.org/copyright">OpenStreetMap: derechos y licencia de los datos</a>
            </li>
          </ul>
        </section>
        <section aria-labelledby="relieve" className="space-y-4">
          <h2 id="relieve" className="font-heading text-2xl text-foreground">
            Relieve y datos de elevación
          </h2>
          <p>
            El sombreado del relieve utiliza Mapzen Terrain Tiles. A continuación se conserva íntegramente la atribución
            original de esta fuente, en su idioma de origen, incluidos los avisos de derechos y licencias. El mapa
            muestra un crédito abreviado con un enlace a este detalle completo.
          </p>
          <p lang="en">
            <a href="https://registry.opendata.aws/terrain-tiles/">Mapzen Terrain Tiles</a> · SRTM, GMTED2010 and 3DEP
            data courtesy of the U.S. Geological Survey; ETOPO1: DOC/NOAA/NESDIS/NCEI, U.S. Department of Commerce (U.S.
            Government material, not subject to copyright protection within the United States). ArcticDEM DEM(s) were
            created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards 1043681,
            1559691, and 1542736; Australia © Commonwealth of Australia (Geoscience Australia) 2017; Austria © offene
            Daten Österreichs – Digitales Geländemodell (DGM) Österreich; Canada contains information licensed under the
            Open Government Licence – Canada; Europe produced using Copernicus data and information funded by the
            European Union - EU-DEM layers; Mexico source: INEGI, Continental relief, 2016; New Zealand Copyright 2011
            Crown copyright (c) Land Information New Zealand and the New Zealand Government (All rights reserved);
            Norway © Kartverket; United Kingdom © Environment Agency copyright and/or database right 2015. All rights
            reserved.{' '}
            <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md">
              Terrain source credits and licenses
            </a>
          </p>
          <p>
            El registro de AWS enlazado identifica el conjunto de elevación. La documentación de atribución de Tilezen,
            enlazada al final del texto original, detalla las fuentes y sus licencias. Estos avisos se mantienen
            accesibles como parte de los créditos cartográficos del mapa.
          </p>
        </section>
      </article>
    </div>
  )
}
