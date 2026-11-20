# OpenFreeMap dark style

`openfreemap-dark.json` es una copia local del estilo oscuro de OpenFreeMap. Incluye ajustes de compatibilidad, orden de capas, idioma y jerarquía de rótulos. Las teselas, las fuentes y el sprite siguen alojados en OpenFreeMap.

## Upstream provenance

- Retrieved: 2026-10-07 (UTC)
- Source style: <https://tiles.openfreemap.org/styles/dark>
- SHA-256 of the retrieved upstream response bytes (before formatting or modification): `4ba4a1990dc5e1b72b38483dfbb92ffdd945bcc13e9f1235466dae900bc51631`
- Official style repository: <https://github.com/hyperknot/openfreemap-styles>
- Official repository license: <https://github.com/hyperknot/openfreemap-styles/blob/main/LICENSE.md>
- The official OpenFreeMap style repository identifies Dark as a fork of <https://github.com/openmaptiles/dark-matter-gl-style>. Its license identifies the style code as BSD 3-Clause and its visual design as CC BY 4.0.

## Modifications

Cambios respecto al estilo original:

1. `layers[id=place_town].layout.icon-image`: `circle-11` → `circle_11`.
2. `layers[id=place_city].layout.icon-image`: `circle-11` → `circle_11`.
3. `layers[id=place_city_large].layout.icon-image`: `circle-11` → `circle_11`.
4. Eliminación de `layers[id=landcover_wood].paint.fill-pattern` (`wood-pattern`), sin cambiar el relleno de la capa.
5. Las capas de texto `water_name`, `highway_name_other` y `highway_name_motorway` se sitúan después de la geometría del mapa base y antes de `place_other`. Los contornos regionales se insertan justo antes de `water_name`, para que no cubran los rótulos ni queden debajo de los rellenos o las líneas del mapa base.
6. Los nombres del mapa base se leen exclusivamente de `name:es`. En Chile y en el resto del mundo, si la tesela no contiene un nombre en español o este está vacío, no se muestra el rótulo. Las referencias de ruta (`ref`) de las autopistas se conservan porque son identificadores, no nombres. La geometría del mapa base se mantiene en todo el mundo.
7. El tamaño de los rótulos aumenta de 10 a 12 en `place_state` y `place_city`, y de 14 a 16 en `place_city_large`. El tamaño de las demás categorías no cambia.

Las autopistas y las vías de clase `primary` y `trunk`, con sus etiquetas, se habilitan en el zoom 10. Las vías `secondary` y `tertiary`, las calles menores, los senderos y sus etiquetas se habilitan en el zoom 12. Los umbrales del estilo no añaden vías que la tesela no incluya. Los muelles y las áreas de aeropuerto se habilitan en el zoom 10, y el trazado detallado de carreteras, en el zoom 12.

## Required license notices

The OpenFreeMap style repository's MIT license requires its copyright and permission notice to accompany substantial copies. The source style's BSD 3-Clause notice and conditions are also reproduced here. The style's visual design is CC BY 4.0; attribution is provided here and by the map's attribution control. Map data is from OpenStreetMap. OpenFreeMap states that MapLibre automatically adds its required map attribution.

### OpenFreeMap styles — MIT License

Copyright (c) 2023 Zsolt Ero

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Dark Matter style — BSD 3-Clause License

Copyright (c) 2024, MapTiler.com & OpenMapTiles contributors.
Copyright (c) 2015, CartoDB Inc.
All rights reserved.

Derived from "CartoDB Basemaps" (<https://github.com/CartoDB/CartoDB-basemaps>)
designed by Stamen and Paul Norman for CartoDB Inc., licensed under CC-BY 3.0.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

- Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

### Style design attribution — CC BY 4.0

The visual design features of the Dark Matter style are licensed under the
Creative Commons Attribution 4.0 International license:
<https://creativecommons.org/licenses/by/4.0/>. Attribution: Dark Matter style,
derived from CartoDB Basemaps, designed by Stamen and Paul Norman for CartoDB
Inc.; source style by MapTiler.com and OpenMapTiles contributors.

OpenMapTiles and OpenStreetMap attribution is required for maps based on this
style and data: <https://openmaptiles.org/> and
<https://www.openstreetmap.org/copyright>. OpenFreeMap's recommended attribution
is <https://openfreemap.org> © OpenMapTiles, Data from OpenStreetMap.

## Límites regionales de Chile

`chile-regions-9469f09/` contiene 17 archivos `.geojson.gz` para las 16 regiones (ADM1), con un archivo para Valparaíso continental y otro para Rapa Nui y el archipiélago Juan Fernández. Procede de la Biblioteca del Congreso Nacional de Chile (BCN) y OCHA ROLAC, distribuida por [geoBoundaries](https://www.geoboundaries.org/) (Chile, 2020, `CHL-ADM1-47653553`). Licencia de origen: [CC BY 3.0 IGO](https://creativecommons.org/licenses/by/3.0/igo/). La atribución también se muestra en el mapa.

- [Archivo de origen simplificado de geoBoundaries, revisión `9469f09`](https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/CHL/ADM1/geoBoundaries-CHL-ADM1_simplified.geojson). SHA-256: `64ca160bd88f899ab5b2134733e1e191059fe20cdc9329dc189b40c1a9d194fa`.
- Regeneración: `node scripts/split-chile-regions.mjs <archivo.geojson>`. El comando valida el SHA-256, separa las geometrías y las comprime con gzip sin simplificar ni redondear las coordenadas de origen. El catálogo `app/_features/map/chile-regions.ts` conserva únicamente los códigos, los nombres y las cajas de encuadre. Si cambia el origen o el contenido de los archivos publicados, debe cambiarse también la ruta versionada utilizada por el mapa.
- `CL-VS` contiene solo el polígono continental. `CL-VS-RN-JF` es el identificador interno de «Rapa Nui e Islas Juan Fernández». Contiene los ocho polígonos del GeoJSON de Valparaíso que pertenecen a esos dos grupos. No incluye Salas y Gómez, las islas Desventuradas ni los islotes costeros de Valparaíso. Ambos archivos conservan el mismo `shapeID`; no representan regiones administrativas distintas.
- El mapa solicita únicamente el archivo de la región seleccionada y descomprime su contenido en el navegador. Los archivos contienen bytes gzip; no se requiere configurar `Content-Encoding` en el servidor.
- Los contornos corresponden a la edición simplificada de geoBoundaries, que no incluye la Antártica. No se deben usar como referencia oficial ni para análisis de precisión.
