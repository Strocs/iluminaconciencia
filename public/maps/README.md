# OpenFreeMap dark style

`openfreemap-dark.json` is a local copy of the OpenFreeMap dark style with the four narrowly scoped compatibility fixes listed below. The style continues to use OpenFreeMap's hosted tiles, fonts, and sprite resources.

## Upstream provenance

- Retrieved: 2026-10-07 (UTC)
- Source style: <https://tiles.openfreemap.org/styles/dark>
- SHA-256 of the retrieved upstream response bytes (before formatting or modification): `4ba4a1990dc5e1b72b38483dfbb92ffdd945bcc13e9f1235466dae900bc51631`
- Official style repository: <https://github.com/hyperknot/openfreemap-styles>
- Official repository license: <https://github.com/hyperknot/openfreemap-styles/blob/main/LICENSE.md>
- The official OpenFreeMap style repository identifies Dark as a fork of <https://github.com/openmaptiles/dark-matter-gl-style>. Its license identifies the style code as BSD 3-Clause and its visual design as CC BY 4.0.

## Modifications

Only these four semantic locations differ from the retrieved style:

1. `layers[id=place_town].layout.icon-image`: `circle-11` → `circle_11`.
2. `layers[id=place_city].layout.icon-image`: `circle-11` → `circle_11`.
3. `layers[id=place_city_large].layout.icon-image`: `circle-11` → `circle_11`.
4. Removed `layers[id=landcover_wood].paint.fill-pattern` (`wood-pattern`), retaining the layer's fill paint.

No other style fields, colors, data sources, resource URLs, or metadata were intentionally changed.

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
