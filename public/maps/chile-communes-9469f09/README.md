# Límites interiores de comunas de Chile

Fuente: [geoBoundaries gbOpen CHL ADM3 simplificado, revisión `9469f09`](https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/CHL/ADM3/geoBoundaries-CHL-ADM3_simplified.geojson), 345 entidades, Biblioteca del Congreso Nacional de Chile (BCN) y OCHA ROLAC, distribuido por geoBoundaries bajo [CC BY 3.0 IGO](https://creativecommons.org/licenses/by/3.0/igo/). SHA-256: `f6852723bc6d44d4813086fe9df750e7228e1925a72284e3d2b65ed44e2aa99a`. Los archivos son una adaptación cartográfica, no una delimitación oficial. El mapa mantiene el crédito en la atribución de límites.

## Derivación

ADM3 no incluye la región de pertenencia. Para cada comuna, se selecciona la región cuyos polígonos contienen la mayor proporción de sus vértices exteriores, teniendo en cuenta huecos. Se utilizan los archivos locales de ADM1 de la misma revisión generados por `scripts/split-chile-regions.mjs`. Como ADM1 y ADM3 fueron simplificados por separado, no se requiere coincidencia exacta en sus costas y límites: en las 343 comunas fuera de la selección insular, el mínimo observado es 41,5 % de vértices contenidos y la menor ventaja sobre la segunda opción es 28,2 puntos porcentuales. En el caso de Juan Fernández e Isla de Pascua se verifica que todos los vértices están al oeste de 78° O y que hay coincidencia con la selección insular de ADM1, que no incluye todas las islas de ADM3.

Se conservan exclusivamente segmentos de ADM3 con extremos idénticos compartidos por dos comunas de la misma selección. Se excluyen 4 851 segmentos entre regiones y todos los segmentos pertenecientes a una sola comuna, incluidas las costas. No se interpolan coordenadas ni se rellenan discontinuidades de la fuente. De los 722 pares vecinos incluidos, 711 producen una sola línea continua. Juan Fernández e Isla de Pascua no comparten segmentos con otras comunas; la opción insular no tiene archivo. Puqueldón y Guaitecas tampoco tienen segmentos compartidos en la fuente.

Cada una de las otras 16 opciones tiene un `Feature` GeoJSON con geometría `MultiLineString`, comprimido como `.geojson.gz` (3 608–43 193 bytes por archivo). El cliente descomprime estos archivos independientemente de la compresión HTTP.

## Reproducción

Con los archivos regionales ya generados conforme a [`scripts/split-chile-regions.mjs`](../../../scripts/split-chile-regions.mjs), descargar ADM3 a un directorio temporal y ejecutar desde la raíz del proyecto:

```sh
scratch=$(mktemp -d)
curl -fL 'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/CHL/ADM3/geoBoundaries-CHL-ADM3_simplified.geojson' -o "$scratch/communes.geojson"
node scripts/build-chile-commune-boundaries.mjs "$scratch/communes.geojson"
```

El generador verifica el digest antes de leer la geometría y escribe los archivos en este directorio. Con `--check` como último argumento, comprueba los nombres y el contenido descomprimido sin escribir archivos.
