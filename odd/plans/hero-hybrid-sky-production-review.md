# T7 — Triaje del candidato completo del cielo

**Veredicto:** el proceso produjo un candidato técnicamente íntegro, pero no un asset listo para aprobación humana. No integrar ni avanzar a C: quedan 4.094 filas sin resolver y se ven contrapartes fotográficas sin retirar en los previews. La aprobación del usuario sigue pendiente; `appEditAllowed=false`.

## Decisión rápida

- Se completó la generación v2 y la validación posterior: salida estructuralmente consistente, geometría preservada y derivada nativa sin diferencias fuera de la unión editada.
- Esto no equivale a limpieza completa: **445 grupos fuente tratados**, 65 filas fusionadas y 62 no observables; no son 510 estrellas independientes retiradas.
- **4.094 filas siguen unresolved**, no observables no significa borradas, y `footprintVisible` es una cota conservadora de inventario, no prueba fotográfica de visibilidad.
- La inspección visual confirma excelente continuidad global del fondo y desplazamiento, pero también muestra numerosos puntos fotográficos y una población de estrellas del canvas superpuesta. No se concede aprobación de calidad al conjunto completo.
- Recomendación: una siguiente unidad estrecha de triaje/detección, sin tocar código de aplicación, no ampliar automáticamente las máscaras ni bajar salvaguardas.

## Alcance y procedencia

Entrada inspeccionada: `output/hero-sky-prototype/production/v2/` (manifest SHA-256: `9ce97da58901d63b741ec36ed99a8666df8197c433a81ec58a79fdbc680a5107`).

- La fuente ESO/S. Brunier es `eso0932a.jpg`, 6000×3000; SHA-256 `60400c92c54b7c1bd12299c69e83b16e5b6256e7dabacc478c021758ecd28179`.
- El manifest fija el snapshot de catálogo y módulos, receta, entorno, encoder, mapping FK5 J2000 → Galactic, rotación Orion guardada, proyección STG espejada y X periódico/Y no periódico.
- Receta `local-connected-context-texture-v1`; grupo máximo 64 px, detector local 6 px, sigma 0,8, exceso mínimo 3 y umbral 4× ruido MAD. Son decisiones del prototipo, no criterios de producto.
- El manifest sigue marcando `pending-complete-asset-review`. No he editado ni regenerado v2, v1 ni código.

## Conciliación de filas, grupos y píxeles

| Unidad medida | Resultado | Lectura correcta |
|---|---:|---|
| Filas del catálogo | 4.666 | Incluye componentes mezclados y casos no distinguibles. |
| Tratadas | 445 | 445 grupos/fuentes con reconstrucción aplicada. |
| Fusionadas | 65 | Componentes adicionales que comparten un grupo tratado; no son 65 ediciones independientes. |
| No observables | 62 | No excedieron el ruido local sin pico ni saturación; no cuentan como remoción. |
| No resueltas | 4.094 | Pendientes por ambigüedad, vecinos, PSF/halo, saturación/polo o revisión. |
| Grupos tratados | 445 | Lista `groups.json`; los 510 renglones tratados+fusionados pertenecen a estos grupos. |
| Unión nativa / píxeles cambiados | 131.005 / 119.748 | 0 píxeles diferentes fuera de la unión, tras comprobar PNG decodificado. |
| Geometría | 4.602 centros dentro; 4.613 quads con intersección | 64 halo-only y 53 fuera del quad máximo; ninguno se excluyó automáticamente por centro. |

Todos los 4.666 renglones llevan `footprintVisible=true` en el inventario; esa propiedad se conserva conservadoramente y no significa que se haya encontrado un objeto fotográfico identificable. Los 4.094 unresolved incluyen 4.043 con quad visible y 62 halo-only (más los casos fuera de quad); la lista exacta se documenta en el JSON. No se interpreta el conteo geométrico como visibilidad fotográfica real.

## Por qué quedan 4.094

| Razón registrada en filas unresolved | Filas | Evidencia y significado |
|---|---:|---|
| Picos vecinos ambiguos dentro de incertidumbre | 2.673 | Se encontraron 2–8 máximos locales; sin identificación independiente, el detector se abstuvo. |
| Vecino brillante no identificado dentro de máscara | 1.096 | Hay contraparte y perfil, pero borrar el footprint podría borrar otra fuente; revisión de colateral requerida. |
| PSF/halo ausente o truncado | 262 | La huella conectada excede o no define límite fotográfico seguro. |
| Exceso amplio/saturado sin máximo distinguible | 45 | No hay centro local fiable; especialmente arriesgado inferir máscara o destino. |
| Predicción sin contexto Y no periódico | 18 | Contexto cruza polo; el código correctamente rechaza wrap vertical. |
| **Total** | **4.094** | Los 510 casos con contexto inferido aún no aprobados no se incluyen en unresolved: están tratados/fusionados y requieren juicio visual. |

### Diagnóstico de causa

La causa dominante demostrada es **una política de abstención demasiado gruesa para el campo denso**, no prueba de que 2.673 filas sean fuentes indistinguibles. `production_inventory.py:61–83` detecta máximos en un radio de 6 px y rechaza cualquier fila con más de un candidato; no compara separación/altura relativa contra error de registro ni clasifica candidato coincidente frente a vecino incidental. Ejemplos inspectables: `catalog-00001` (2 candidatos), `catalog-00003` (3) y `catalog-00019` (2). Sus recortes nativos muestran campos estelares congestionados, pero no justifican escoger automáticamente uno.

El defecto verificable es agrupar todo multi-pico como «ambiguo» sin cuantificar si el pico relevante coincide con la predicción; no está probado que cada uno sea una falsa ambigüedad o un error de centro. Los **1.096** vecinos dentro de footprint y **262** perfiles faltantes/truncados sí son limitaciones de soporte/seguridad reales, no se deben resolver debilitando guardas. Los 45 halos amplios/saturados y 18 polos también quedan genuinamente inciertos sin evidencia adicional. `reconstruct_background.py:113–149` construye perfil conectado/halo limitado a radio 32 px; `production_inventory.py:94–103` frena truncamientos y vecinos, y `:220` limita extent a 64 px. Hay saturación incluso en 506 de los 510 renglones tratados/fusionados; por tanto su continuidad no prueba recuperación del núcleo saturado.

### Multiplicidad observada, no identidad

La distribución de máximos en las 2.673 filas clasificadas ambiguas es: 1.697 con dos candidatos, 742 con tres, 191 con cuatro, 29 con cinco, nueve con seis, dos con siete y tres con ocho.

La inspección directa de `catalog-00019-native.png` confirma un campo de puntos congestionado, no una atribución del pico correcto.

El panel muestra original e inferido a escala nativa 1:1; no incluye el centro predicho ni marcas sobre los máximos locales.

Por eso la imagen sirve para explicar la incertidumbre, pero no resuelve cuál de los candidatos corresponde al registro del catálogo.

`catalog-00000-native.png` corresponde al bucket de vecino dentro de footprint: el perfil de fuente local incluye otras componentes luminosas, con estadística de 3 vecinos.

`catalog-00880-native.png` ejemplifica una zona estelar densa; su visual congestionada hace especialmente importante mantener visibles las guardas.

`catalog-00014-native.png` no presenta un pico local detectado pese al bucket de exceso amplio/saturado; sin nueva anotación de máscara, no se puede inferir qué área borrar.

Las estadísticas no nombran estrellas ni distinguen identidad física; no se han atribuido nombres astronómicos a estos IDs.

El detector emplea el exceso suavizado frente a `max(minimumExcessEncoded8bit, noiseMultiplier × noiseMAD)`; esa prueba detecta estructura, no correspondencia astrométrica.

En los buckets de 1.096 vecinos, cada caso sí tiene máximo provisional y máscara calculada, pero el inventario retiene el grupo completo para que un donante no borre otra fuente real.

El motivo de los 262 incluye perfiles ausentes o recortados por la ventana de soporte; no debe equipararse a una detección negativa.

Los 45 casos amplios/saturados no aportan un pico aislado al detector, así que no tienen centro de máscara confiable en el inventario.

Los 18 casos de polo proceden del rechazo explícito del contexto vertical no periódico; envolver Y crearía datos falsos en el borde de la fotografía.

La prioridad para la siguiente revisión es la incertidumbre del centro, no maximizar el número tratado.

## Inspección visual real

Imágenes revisadas directamente (archivos con crédito ESO/S. Brunier / CC BY 4.0; vistas panorámicas son reescaladas y no prueba de nitidez nativa):

- [Mosaico global de 1920×1080 y móvil](../../output/hero-sky-prototype/production/v2/contact-sheet.png): composición continua, polvo y banda galáctica sobreviven; el patrón estelar fotográfico sigue siendo evidente. El preview es de resumen, no aprobación.
- [Fondo 1920×1080, opacidad 1](../../output/hero-sky-prototype/production/v2/1920x1080@1-background-opacity1.png) y [desplazamiento estático](../../output/hero-sky-prototype/production/v2/1920x1080@1-shifted-opacity1.png): no se aprecia una mancha global ni hueco grande en estas vistas; aparecen muchas contrapartes sin resolver. Shift +8/−6 CSS es diagnóstico, no especificación de parallax.
- [Composición con catálogo actual](../../output/hero-sky-prototype/production/v2/1920x1080@1-composite-opacity1.png): conserva densidad; evidencia visual clara de duplicación entre estrellas del catálogo y foto aún no limpiada.
- [Fondo a opacidad 0,12](../../output/hero-sky-prototype/production/v2/1920x1080@1-background-opacity0.12.png): textura y banda muy atenuadas; sólo referencia al estado artístico propuesto, no evaluación del hero con terreno/texto.
- [Móvil 390×844 DPR2](../../output/hero-sky-prototype/production/v2/390x844@2-background-opacity1.png): encuadre coherente y sin vacío evidente en el recorte inspeccionado; no generaliza a todos los tamaños.
- Casos aprobados en la prueba de 12: [Sirius](../../output/hero-sky-prototype/production/v2/Sirius-native.png) y [Betelgeuse](../../output/hero-sky-prototype/production/v2/Betelgeuse-native.png) muestran textura continua; [Alnitak](../../output/hero-sky-prototype/production/v2/Alnitak-native.png) conserva contexto complejo/nebulosidad. La aprobación anterior cubre sólo esas muestras, no las 4.666 filas.
- Ejemplos unresolved 1:1: [multi-pico catalog-00019](../../output/hero-sky-prototype/production/v2/catalog-00019-native.png), [máscara con vecinos catalog-00000](../../output/hero-sky-prototype/production/v2/catalog-00000-native.png), [campo denso catalog-00880](../../output/hero-sky-prototype/production/v2/catalog-00880-native.png) y [exceso sin pico catalog-00014](../../output/hero-sky-prototype/production/v2/catalog-00014-native.png). En los paneles paired original/inferred se reconoce población no retirada; sin anotación de identidad no atribuyo nombres astronómicos a IDs.
- [Detalle nativo denso DPR2](../../output/hero-sky-prototype/production/v2/1920x1080@2-dense-candidate-native.png) muestra textura de nebulosa preservada con puntos visibles; [detalle borde DPR2](../../output/hero-sky-prototype/production/v2/1920x1080@2-edge-native.png) conserva textura y no muestra salto de seam evidente en ese fragmento.

**Veredicto perceptual:** buena continuidad de panorama, no se prueba un fallo visible general del método en vistas abiertas ni se concluye que ESO sea inutilizable. Sí hay un fallo de calidad del entregable respecto del objetivo de borrar contrapartes: la propia composición deja repetición fotográfica aparente y los mosaicos muestran muchos puntos remanentes. Separadamente, 510 filas inferidas carecen de inspección humana exhaustiva; eso es incertidumbre, no prueba de mancha. Sin lectura del hero integrado ni aprobación del usuario, el asset completo no está listo para C.

## Paso siguiente recomendado (sólo propuesta)

Una unidad acotada de análisis de detector sobre una muestra estratificada de los 2.673 multi-pico: revisar centro predicho, distancias/excesos de cada candidato, relación con el error de alineación, imagen original y máscara vecina, con originales/v2 inmutables. Objetivo: separar «vecino incidental» de «identidad no distinguible» y cuantificar cuántas filas pueden resolverse con evidencia reproducible. Sin selección automática del pico, sin ampliar radio, sin bajar guardas de donante/máscara, sin remover estrellas tenues, sin cambios de receta hasta entregar evidencia comparable. Incluir también pequeña muestra de las 1.096 máscaras vecinas, 262 halos truncados, 45 saturadas y 18 de polo; reabrir por grupo fuente, no por fila duplicada.

Si esa revisión confirma un defecto acotado del criterio multi-pico, proponer luego una corrección mínima al detector más una nueva versión aislada y paneles A/B; preservar mapping, población tenue, contexto nativo, opacidad original 0,12 y validación de pixeles fuera de máscara. Si no se puede establecer identidad de forma robusta, mantener abstención y solicitar decisión sobre un asset con pendientes explícitos, no declarar limpieza total. No hay umbral de 0,5 CSS px ni porcentaje mínimo de limpieza.

## Estado por especificación

| S | Veredicto T7 |
|---|---|
| S1 | Parcialmente satisfecho: más densidad y foto/catálogo híbridos evaluados; duplicación por contrapartes residuales impide aceptación completa. |
| S2 | Respetado en previews de opacidad 1 y 0,12; no se cambió opacidad del canvas. |
| S3 | Análisis antes de edición; no se tocó aplicación. |
| S5 | Imágenes generadas e inspeccionadas; aprobación humana del asset completo sigue pendiente. |
| S6 | Evaluación perceptual/nitidez, sin imponer exactitud subpixel o porcentaje arbitrario. |
| S7 | Un mapping compartido, mobile y crop-edge revisados; no se afirma validación responsive universal. |
| S9 | Parcial: se reconstruyeron contextos, pero la limpieza necesaria para movimiento independiente sigue pendiente por las contrapartes sin resolver. |
| S10 | Criterio de ausencia de mancha evidente aplicado; muestras aprobadas previas no se extrapolan a toda la salida. |
| S11 | Aprobación anterior limitada a las doce muestras; no equivale a aprobar este asset completo. |
| S12 | Autorización de implementación no supera la puerta S5/C; ningún cambio de app hecho. |
| S14 | Reanudación explícita respetada: v2 nueva, v1 preservada; no implica aprobación del asset ni integración. |

## Límites y archivos de evidencia

- Validación standalone job-2 ya completada por el parent: `completed-artifact-validation`, passed=true, writes=false; mismos conteos y preservación. 131 hashes históricos y todos los 4.584 archivos parciales v1 permanecen; `app/layout.tsx` preexistente intacto. No se repitió.
- La exportación SVG/catálogo y las imágenes v2 no se inspeccionaron en navegador; no hay benchmark real de carga, revisión del hero con textos/terreno ni prueba de interacción/parallax.
- No se inspeccionaron visualmente los 4.094 tiles individualmente. Las observaciones visuales arriba se limitan a las imágenes enlazadas.
- Informe cuantitativo compacto, decisiones y evidencia exacta: [JSON de triaje](./evidence/hero-hybrid-sky-production.json). Fuente y módulos v2 permanecen inmutables.

**Siguiente acción autorizada:** diagnóstico acotado y anotado del detector antes de pedir aprobación final. Los puntos fotográficos tenues son parte del fondo deseado: su mera presencia no prueba duplicación de una estrella concreta del catálogo. La siguiente unidad debe localizar esos pares y distinguir límites de identidad de defectos de detección; no se borra población tenue para mejorar un contador. `appEditAllowed=false`; la aprobación del asset completo continúa pendiente.
