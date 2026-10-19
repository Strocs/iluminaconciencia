# Cielo híbrido: hoja de ruta para implementación real

**Decisión:** fondo fotográfico limpio local + canvas WebGL actual + estrellas estáticas transparentes del catálogo como respaldo.
Se conserva el encuadre responsive, la narrativa y la opacidad intencional; la fotografía aporta densidad sin ampliar el catálogo.
Este documento cierra **T4**, sólo planificación: no ejecuta ni autoriza herramientas, assets o cambios de aplicación.

## 1. Aprobado y pendiente

El usuario aprobó el acabado de las **doce muestras**: «Está perfecto, creo que en general las pruebas han sido un éxito. Puedes terminar de definir el plan de acción para la implementación real?».
La siguiente acción propuesta es preparar el fondo completo para aprobación; **no escribir todavía el hero**.

| Evidencia existente | Lo que no demuestra |
| --- | --- |
| Una rotación esférica sembrada con Orión y cinco anclas reservadas | Identidad/centro de cada contraparte de las 4.666 filas |
| Doce reconstrucciones aprobadas; 4.266 píxeles cambiados, cero fuera de máscara nativa | Limpieza completa del campo ni aprobación del asset final |
| Recortes existentes y muestras nativas de nitidez | Composición final con terreno/texto/contaminación ni rendimiento real |
| WebP95 recomendado provisionalmente | Presupuesto de descarga o calidad definitiva del fondo limpio |

Prioridad: nitidez y continuidad perceptible; **0,5 píxeles CSS no es una puerta de aceptación**.
No se exige certeza del polvo oculto: sí ausencia de manchas, huecos, fantasmas, costuras y textura destruida perceptibles.
Los JSON y documentos del prototipo registran estados históricos; sus `not-granted` no se reescriben retrospectivamente.
La aprobación actual queda aquí y en [S11 y Log L51](../tasks/hero-sky-offline-prototype.md).

## 2. Ruta única y puertas de avance

Las fases siguientes son **propuestas dependientes**, no tareas activas/completadas de esta intervención documental.

| Orden | Trabajo futuro | Salida exigida antes de avanzar |
| --- | --- | --- |
| A | Autorizar producción offline; consolidar generador e inventario de contrapartes | Procedencia, geometría y clasificación reproducibles; alcance acordado |
| B, depende de A | Reconstruir el campo necesario, generar variantes y revisar | Preview completo, contadores conciliados y casos visibles pendientes resueltos/revisados |
| C, depende de B | Presentar fondo solo, composición y desplazamientos estáticos | Aprobación humana explícita del asset completo, nitidez y coste; permiso para integrar |
| D, depende de C | Integrar capas/recorte/readiness en `night-sky` | Fallback SSR y transición sin duplicación, preservando narrativa |
| E, depende de D | Validar código y comportamiento real | Comprobaciones funcionales/manuales, evidencia de carga y aprobación del hero final |

Si B revela una contraparte visible no resuelta, se muestra el caso y se corrige/revisa antes de C; no se disimula con el canvas.
Ninguna fase concede permiso para ramas, commits, push, PR o despliegue. La autorización actual termina en este plan.

## 3. Mapa de código comprobado y cambios propuestos

Base de rutas: `app/(home)/_sections/hero/`; los nombres siguientes son relativos a esa base.

| Archivo / función o selector actual | Edición futura concreta |
| --- | --- |
| `capabilities/night-sky/index.tsx`: `HeroSky`, `[data-hero-sky-host]`, `[data-hero-stars]`, `[data-hero-sky-fallback]` | SSR de fondo real y estrellas de catálogo visibles; canvas inicialmente oculto; grupo artístico con opacidad inicial |
| `capabilities/night-sky/night-sky.ts`: `createNightSkyCapability`, `getViewport`, `applyViewport` | Medir una vez, derivar frame común y actualizar las tres capas incluso en fallback |
| Mismo archivo: `showFallback`, `hideFallback`, `setLifecycleState`, `renderFrame` | Sustituir borrado/asignación de `src` por intercambio de visibilidad sólo de estrellas tras primer dibujo válido |
| Mismo archivo: `fadeTimeline`, `onProgress`, `startLoop`, `stopLoop`, `destroy` | Mover fade al grupo; conservar reloj/cleanup; no añadir otro loop |
| `capabilities/night-sky/sky-crop.ts`: `computeSkyCrop` | Reutilizar función y extraer derivación de rectángulo visible, sin cambiar su política |
| `capabilities/night-sky/sky-reference.ts`: `SKY_REFERENCE`, `REGION_BBOX`, `projectStar` | Mantener calibración; exportar metadatos desde esta fuente, no copiarlos a mano |
| `capabilities/night-sky/webgl-star-renderer.ts`: `resize`, `draw` | Consumir el crop calculado por el owner; señal mínima de dibujo válido, sin tocar perfiles ni colores |
| `capabilities/night-sky/config.ts` | Rutas locales del manifiesto aprobado; conservar DPR, twinkle y curva |
| `components/HeroRuntime.tsx`: `useGSAP`; `runtime/initialize-hero.ts`: `composeHero` | Mantener montaje/desmontaje y contrato `HeroSkyCapability`; sin nuevo wrapper ni `useEffect` directo |
| `core/scroll-timeline.ts`: `broadcast`, `syncFrameFixedState` | Sin cambio previsto; verificar que su progreso compartido continúa gobernando el cielo |
| `index.tsx`: `Hero`; `capabilities/framing/index.tsx`: `HeroFrame` | Sin rediseño: cielo z-0, contaminación z-1, terreno y contenido conservan orden/máscara |
| `capabilities/light-pollution/light-pollution.ts`: `createLightPollutionCapability` | No editar su timeline ni `[data-hero-light-pollution-horizon]`; comprobar composición completa |

La capability `night-sky` conserva toda la propiedad funcional. Sin DAL, store global, fetching astronómico ni capa genérica adicional.
Nuevos módulos locales propuestos: `capabilities/night-sky/sky-assets.ts` y `capabilities/night-sky/sky-artwork.css`.
El primero será el contrato mínimo de assets; el segundo contendrá layout declarativo SSR, no otra lógica de cámara.
Exports propios nombrados; clases condicionales con `cn()`. No cambiar catálogo, fotometría ni shaders para esconder duplicación.

## 4. Producción offline reproducible

Consolidar el método exitoso en **un punto de entrada documentado**, no llevar la colección exploratoria de CLI a producción.
Propuesta: `tools/hero-sky-prototype/generate-production.py`, con modos `--validate-only` y generación por versión.
Su README describirá un comando de generación y uno de validación, entradas, salidas y condiciones de rechazo.
Reutilizar `export-inputs.mjs` como dueño de la exportación de módulos reales; hacerlo apuntar a una nueva versión, nunca sobrescribir el snapshot histórico.
Reutilizar validaciones de `constellation_review.validate` y `reconstruct_background.validate`, parametrizando destinos sin ejecutar sus escritores históricos.
Reutilizar `source_xy`, `source_world`, `sample`, geometría de `probe.py` y las funciones de reconstrucción antes de extraer/refactorizar lo necesario.
No retomar la calibración ciega fallida ni multiplicar ajustes por dispositivo.

| Propiedad propuesta | Ruta / contenido |
| --- | --- |
| Receta versionada | `tools/hero-sky-prototype/production-recipe.json`: hashes, rotación, parámetros, grupos y decisiones de revisión |
| Entrada conservada | `output/hero-sky-prototype/source/eso0932a.jpg`, snapshots de licencia y `metadata/source.json` existentes |
| Nueva salida offline | `output/hero-sky-prototype/production/<version>/`: export, inventario, máscaras, donantes, PNG nativo, previews y reporte |
| Entrega pública aprobada | `public/images/hero/sky/<version>/`: `background-1x.webp`, `background-2x.webp`, `catalog-stars.svg`, `manifest.json`, `CREDITS.txt`; fondo y SVG referenciados como imágenes desde SSR |
| Contrato runtime | `sky-assets.ts` local: URL/version y sólo bounds/dimensiones necesarios; no importar reportes o herramientas Python |

Los paths nuevos son propuestas, no archivos creados ni superficies de edición autorizadas en T4.
Usar el entorno existente Python 3.14.8: **numpy 2.5.4, scipy 1.18.1, astropy 8.0.2, Pillow 13.0.0**.
Son los cuatro imports directos de `requirements.txt`; Photutils/reproject instalados no son necesarios para este método.
Sin instalaciones, nuevos paquetes frontend, Three.js, planetario, modelos/servicios AI ni llamadas CDS/astronomía desde producción.

Fuente original: `https://cdn.eso.org/images/large/eso0932a.jpg`, RGB 6000×3000, 8.228.817 B.
SHA-256: `60400c92c54b7c1bd12299c69e83b16e5b6256e7dabacc478c021758ecd28179`.
Conservar [página ESO](https://www.hq.eso.org/public/images/eso0932a/), [política](https://www.hq.eso.org/public/outreach/copyright/) y [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Incluir **crédito visible ESO/S. Brunier / CC BY 4.0**, fuera del grupo `aria-hidden`, con enlaces y declaración de adaptaciones.
Declarar reconstrucción inferida selectiva, rotación/reproyección, recortes y codificación; no basta ocultarlo en el manifiesto.

El manifiesto registrará schema/versión, hashes de fuente/código/catálogo/landmarks/receta, versiones de herramientas y encoder.
También matriz/vector de rotación, handedness, época/marco asumido, interpolación, dominio RGB, bounds de referencia y de cada asset.
Añadir dimensiones, bytes, SHA por archivo, escala nominal, contadores, revisión/approval y relación con previews exactos.
Registrar semillas y cualquier desempate; no usar azar implícito. Mismas entradas/parámetros deben reproducir píxeles/hashes en el entorno fijado.
Si cambia fuente, catálogo, geometría o receta: nueva versión y nuevas comparativas; nunca reemplazar evidencia aprobada silenciosamente.
Rollback futuro: seleccionar la versión anterior completa y sus metadatos juntos; conservar originales y resultados, no borrarlos/regenerarlos encima.

## 5. Extender doce casos al campo necesario

1. Inventariar **las 4.666 filas actuales**, con índice estable y fila completa; separar entrada de catálogo de fuente fotográfica única.
2. Proyectar con la rotación única almacenada de fase 2; mantener Orión como semilla y las cinco anclas reservadas como controles, sin refit automático.
3. Verificar centros reales en parches locales del JPEG: predicción no equivale a identificación. Registrar desplazamientos, confianza y candidatos ambiguos.
4. Agrupar blends y componentes idénticos, en particular las coordenadas duplicadas de Alnitak; vincular todas las filas a una sola intervención fotográfica.
5. Unir máscaras solapadas y resolver por grupo/contexto compatible antes de mezclar una vez; no borrar secuencialmente la misma región.
6. Reconstruir estructura y textura contextual como en las muestras, preservando población tenue, polvo/grano y píxeles fuera de las máscaras.
7. Revisar casos densos, saturados, halos extensos, nebulosidad y límites/costura del panorama; los visibles no resueltos requieren revisión explícita.

Inventario exhaustivo con estados excluyentes por fila: **tratada**, **fusionada** (referencia al grupo tratado), **no observable** o **no resuelta**.
La suma debe dar 4.666; publicar además fuentes únicas/grupos, regiones fuera de entrega y casos visibles pendientes, sin confundirlos con estrellas borradas.
Una no observable necesita motivo/evidencia (sin contribución visible en el dominio entregado o sin contraparte distinguible); no es una eliminación exitosa. Considerar la huella completa de núcleo/halo y los márgenes actuales, no sólo el centro: las 64 filas halo-only del sample no se descartan por estar fuera del rectángulo.
Fusionada sólo cuenta como resuelta si el grupo lo está; si no, sus filas permanecen no resueltas.
No omitir contrapartes visibles por saturación/crowding ni describir todas como eliminadas porque el proceso terminó con exit 0.

Conservar PNG nativo y unión explícita; comprobar igualdad exacta fuera de máscaras tras decodificar la derivada lossless.
Esa igualdad no se promete para WebP con pérdida ni tras reproyección, donde la interpolación propaga diferencias.
Entregar mosaicos nativos 1:1 de fondo solo y estrellas desplazadas, cubriendo zonas densas, bordes, nebulosas y estrellas brillantes.
Las métricas de continuidad son diagnóstico; salida: sin manchas/fantasmas perceptibles y con nitidez aceptada, no recuperar polvo físicamente cierto.
Escalar 12→4.666 exige perfilar tiempo/memoria y refactorizar por parches/grupos: no repetir solves costosos de frame completo por estrella.
`reconstruct` ya mezcla una unión, pero usa acumuladores globales y contextos repetidos; conservar invariantes, no copiar su coste ciegamente.
Guardar donantes/parámetros y los casos pendientes; un cambio de algoritmo requiere volver a mostrar muestras aprobadas para comparación.

## 6. Un encuadre para imagen, respaldo y renderer

`HeroFrame` limita el artwork a **1920 CSS px** (`max-w-480`), con altura real `h-full`/`h-dvh` según estado.
`getViewport` mide `canvas.getBoundingClientRect()` y limita DPR a 2; no usar ancho/alto de viewport como sustituto.
Conservar `SKY_REFERENCE`, el espejo X y `computeSkyCrop(width/height)`, incluido centro portrait y clamp existentes.
El owner derivará una sola vez por resize el crop y el rectángulo visible del plano; el renderer consumirá ese mismo crop.
Sean R=`REGION_BBOX`, c=`computeSkyCrop(W/H)`, y ancho/alto de R `rw`, `rh`:

```text
left   = R.xMin + c.offsetX / c.scaleX * rw
top    = R.yMax - c.offsetY / c.scaleY * rh
width  = rw / c.scaleX
height = rh / c.scaleY
```

Para un asset de bounds B=(x0,y0,width,height), con Y del plano hacia arriba:
`u=(left-B.x0)/B.width`, `v=(B.y0+B.height-top)/B.height`; spans=`width/B.width`, `height/B.height`.
Dibujar su rectángulo completo a `W/spanU` por `H/spanV`, desplazado `-u*W/spanU`, `-v*H/spanV`, con clip del host.
**No aplicar directamente uniforms normalizados en REGION al bitmap**, ni usar `object-fit:center/cover` con un encuadre independiente.
Los bounds del máster canónico serán exactamente `SKY_REFERENCE`; el manifiesto debe declararlos, no inferirlos de la relación de píxeles.

SSR/no-JS también necesita este layout: CSS local generado de los mismos constantes y ramas de crop, con unidades/consultas del contenedor de tamaño definido.
Así ancho/alto pertenecen al host real incluso cuando cambia a fixed; no depender sólo de media queries del viewport.
Verificar equivalencia de CSS declarativo y función al cruzar aspect 1 y 16:9/clamps; no aceptar un fallback SSR con otra cámara.
La medición runtime actualizará esas mismas variables/transformación para todas las capas, sin un salto de hidratación.
No fijar 390×844 para cualquier portrait ni mantener Orión artificialmente visible en teléfono.

Default: máster canónico y variantes acotadas 1x/2x, una transformación por frame, sin fits por dispositivo.
Sólo si el coste lo exige, añadir un envelope portrait que **contenga** una familia de recortes y declare sus propios bounds.
Elegirlo únicamente si contiene el crop actual completo; si no, usar el canónico. Un resize puede exigir otro asset, no otro alineamiento.
Esa optimización necesita preview/cobertura propios antes de entregarse; la muestra 780×1688 no es un envelope universal.

## 7. Entrega estática y calidad de raster

Se leyeron completas las guías instaladas Next **16.3.8** `12-images.md` e `image.md` antes de esta elección.
Elegir **`<picture>`/`<img>` nativos para los assets ya generados**, con `alt=""`, dimensiones intrínsecas y layout reservado en `HeroSky` SSR.
Permiten selección explícita de archivos locales sin una segunda codificación del optimizador; no añadir loader/config global.
Default sencillo: una fuente canónica 1x para DPR≤1 y 2x para el resto, seleccionada por `<source media>` antes de descargar; sólo un `img` fotográfico.
Inicialmente `loading="eager"`, `decoding="async"`; no precargar ambas variantes ni crear dos imágenes ocultas con URLs pesadas.
El crédito será contenido accesible separado. No hace falta convertir `HeroSky` en Client Component para escuchar eventos desde el owner existente.

No usar `sizes="100vw"`: el bitmap transformado puede ser más ancho que la pantalla por la altura del canvas.
Evaluar densidad por tamaño **dibujado completo** (W/spanU, H/spanV) × DPR efectivo y dimensiones del archivo, no por su ancho visible.
Las variantes nominales 1920×1080 y 3840×2160 son límites iniciales del canónico, no garantía de densidad para cualquier altura.
Si una relación/altura exige más detalle que el disponible, informar y revisar calidad/envelope; no inventar resolución mediante upscale.
Mantener máster nativo lossless; codificar cada variante directamente desde él/reproyección de referencia, nunca desde otro WebP.
WebP95 es la elección provisional; PNG conserva referencia de nitidez y WebP90 sólo sería un refinamiento tras comparación/aprobación.

Next documenta calidad por defecto 75 y allowlist `[75]`: `quality={95}` puede ajustarse al permitido; no usarlo esperando preservar el candidato.
`unoptimized` sirve bytes originales si se necesitara `Image`; no genera por sí solo el conjunto responsive offline.
`priority` está deprecado; las guías prefieren normalmente eager o fetchPriority a preload, y `onLoadingComplete` está deprecado frente a `onLoad`.
La ruta nativa elegida evita esa reducción silenciosa/doble pérdida y no requiere modificar `next.config`.

Referencias **sólo de fotos experimentales**, no pesos prometidos del fondo limpio completo: 3.116.438 B desktop4K y 593.120 B móvil2x.
RGBA teórico: 31,64 MiB y 5,02 MiB respectivamente; sumar respaldo, canvas/buffers, imágenes durante reemplazo y superficies de composición del navegador.
Medir red, decode, primer frame y memoria real; DOM no significa composición gratis ni benchmark de ventaja frente a texturas.
La fuente all-sky es finita, 6000×3000: un fichero 4K no inventa detalle en bordes/reproyección.
No descargar poster fotográfico completo además del fondo, ni pedir varias variantes pesadas anticipadamente.

## 8. Respaldo y ciclo de vida

Respaldo elegido: **SVG transparente externo generado del catálogo y geometría reales, declarado como imagen desde SSR**, no el campo genérico actual ni otro poster fotográfico.
Así se conserva un solo nodo de imagen en el documento, en vez de serializar miles de glifos en HTML/RSC. El generador no emitirá un módulo de markup inline.
Formato vectorial lossless con alpha, sin scripts/fuentes/remotos; núcleo/halo aproximan el perfil actual a tiempo 0.
Asignar a la imagen el ancho/alto de artwork calculado y sólo trasladarla/recortarla; no aplicar una escala CSS posterior al recurso rasterizado.
Los centros viven en el viewBox canónico; construir núcleo/halo con trazos no escalables para mantener su tamaño CSS al variar el viewport del SVG.
Comprobar en navegador ese comportamiento SVG-as-image, alpha y sizing a DPR 1/2 y distintos altos antes de aprobarlo; no prometer identidad del antialiasing.
Medir peso del recurso, decodificación/rasterización y memoria: externalizarlo evita el DOM principal grande, no vuelve gratis su render.
Las URLs seguirán siendo locales root-relative y se conservarán las guardas existentes; no habilitar SVG arbitrarios, scripts ni carga remota.
Sin render React por frame ni otra librería de render.

| Estado futuro | Composición / transición |
| --- | --- |
| SSR, sin JS e initializing | Color existente + foto limpia + estrellas estáticas declaradas y visibles al cargar desde HTML/CSS; canvas con `visibility:hidden`, conservando su caja |
| Primer draw válido | Medir/resize/dibujar canvas con dimensiones reales y aún no visible; sólo después readiness intercambia estáticas→canvas en la misma actualización |
| Activo | Foto persistente + canvas; estáticas ocultas pero disponibles; no dos poblaciones superpuestas |
| Reduced motion / no WebGL2 / context loss | Foto + mismas estrellas estáticas, sin rAF de twinkle; no nueva política de context restore/reintentos |
| Error de foto | Conservar color de cielo y estrellas actuales, dinámicas o estáticas; no vaciar el host ni bloquear narrativa |
| Error de inicialización/draw | Mantener o volver a estáticas, sin ocultarlas primero ni producir flash vacío |
| Destroy | Cancelar rAF, kill timeline, desconectar observer, eventos y cualquier finalización asíncrona pendiente |

Hoy `setLifecycleState('active')` oculta el fallback **antes** de `renderFrame`; invertir esa dependencia es parte de D.
Como `getViewport` mide el canvas, no usar `hidden`/`display:none` en él durante inicialización: daría 0×0 y el clamp produciría un primer dibujo 1×1. Ocultar visibilidad, no su geometría.
No usar descarga de foto como señal de WebGL listo; readiness pertenece al dibujo de estrellas y debe manejar fallo/contexto perdido.
Conservar `ResizeObserver`, generación de resize/microtask y guardas `destroyed`; actualizar foto/respaldo también fuera de active.
No retirar `src` del respaldo al activarse ni reiniciar su descarga tras context loss; visibilidad no es propiedad de red.
Si se espera `decode()`/load, invalidar callbacks al destruir/cambiar versión, retirar listeners y no aplicar resultados obsoletos.
`start` sólo inicia loop en active; `stop` conserva dibujo determinista a tiempo 0; resize no crea un rAF para la imagen.
Reutilizar `HeroRuntime/useGSAP` y `composeHero` para limpieza y entradas/salidas de scroll, sin estado React redundante.

## 9. Opacidad y narrativa, sin doble atenuación

Elegir **una envolvente de visibilidad del grupo artístico** (foto + estáticas + canvas), con opacidad SSR inicial 0,12.
Mover `fadeTimeline` del canvas al grupo: `0,12 → 1` al progreso 0,7 y luego 1; canvas local a **1**.
Eliminar el fade anterior del canvas al moverlo: conservar ambos produciría 0,0144 inicial, una regresión.
El cambio de estrellas no reinicia progreso ni curva; foto y respaldo permanecen bajo la misma envolvente al activar/fallar.
En reduced motion, `composeHero` ya envía progreso 0: mantener esa semántica; sin JS queda el mismo estado inicial. El fallback actual no participa del timeline del canvas: la nueva exposición compartida del respaldo es un cambio deliberado de composición que se comprobará/aprobará en esos modos, no una apariencia anterior que pueda darse por conservada automáticamente.
No tocar datos, colores, tamaños CSS ni twinkle. No ocultar/mover estrellas del canvas para resolver duplicación fotográfica.
Contaminación, fases Bortle, paisaje y textos siguen sus timelines/oclusiones actuales; evaluar el conjunto, no sólo cielo a opacidad 1.

## 10. Criterios de salida y verificación futura

Antes de editar hero: inventario conciliado, nativo fuera de máscara exacto, assets/manifest reproducibles y previews completos aprobados (C).
Revisar previews a opacidad 1 y 0,12, fondo solo, composición y desplazamiento estático; muestras 1:1 además de thumbnails.
Requerir nitidez percibida, sin duplicación visible ni manchas/halos, con pendientes explícitos y revisión de casos difíciles.
La aprobación del prototipo no sustituye aprobación del asset completo ni del runtime final.

Después de D, ejecutar scripts existentes: `pnpm lint`, `pnpm typecheck`, `pnpm build`; registrar resultados y fallos ambientales sin encubrirlos.
No escribir tests nuevos por política del repositorio. Tipos/build no sustituyen verificación funcional/manual de navegador.
Playwright sólo con autorización explícita del usuario; esta planificación no ejecuta navegador ni esos comandos.

| Verificación funcional/manual futura | Evidencia requerida |
| --- | --- |
| 1920×1080, 1440×1080, 1920×823; viewport ultrawide con cap | Medidas reales del host/canvas, mismo crop entre capas, DPR 1/2 |
| 390×844, 360×800, portrait más ancho/alto y rotación a landscape | Sin recorte universal móvil; revisar aspect 1 y 16:9, clamp, alto dinámico y DPR>2 limitado |
| SSR/noJS, carga lenta y caché caliente | Fondo/respaldo disponibles sin hydration; sin salto de cámara, espacio vacío ni descarga doble |
| Primer frame WebGL, progreso 0/0,35/0,7/1 y entrada/salida inversa | Readiness tras draw, exposición continua, fade único, start/stop correctos |
| Reduced motion inicial y cambio en vivo; noGL; context loss | Estáticas coherentes y sin loop; fallback estable sin nuevos reintentos |
| Error de foto, inicialización fallida, resize y destroy durante carga | Color/estrellas conservados; sin callbacks tardíos, observers/eventos/rAF huérfanos |
| Hero final con cerros, textos, Bortle y contaminación | Legibilidad, máscara/z-order, narrativa y nitidez aceptadas por usuario |
| Red/decode/composición en móvil y escritorio | Archivo elegido, bytes reales, tiempo al primer dibujo y memoria; no sólo estimación RGBA |

Salida de E: evidencias de esos casos y aprobación humana del **hero final** antes de cualquier entrega separadamente autorizada.

## 11. Límites y referencias

No ampliar catálogo/profundidad, etiquetas de constelaciones, interacción, parallax real ni cambios mayores de GSAP, paisaje o mapa.
Parallax futuro necesitará amplitud definida y revisar halo/overscan actual de catálogo (~10 CSS px; quad máximo 9), si se desplazan estrellas/fondo.
El desplazamiento offline +8/−6 fue diagnóstico: no promete cobertura de movimiento arbitrario ni una amplitud de producto.

Cobertura de este plan: S1–S3, S5–S7 y S9–S11; sus resultados de producción siguen propuestos, no completados.
Evidencia: [viabilidad e historia](./hero-hybrid-sky-feasibility.md), [geometría](./evidence/hero-hybrid-sky-feasibility.json), [primer ensayo](./evidence/hero-hybrid-sky-prototype.json), [nitidez](./evidence/hero-hybrid-sky-sharpness.json), [reconstrucción](./evidence/hero-hybrid-sky-reconstruction.json).
Método y límites existentes: [README del prototipo](../../tools/hero-sky-prototype/README.md).
