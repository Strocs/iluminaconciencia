# Cielo híbrido del hero: diseño y viabilidad

**Estado actual: doce muestras aprobadas por el usuario (S11); hero intacto.** La [hoja de ruta de implementación real](./hero-hybrid-sky-implementation.md) define el siguiente trabajo propuesto: completar y aprobar el asset antes de integrar. La autorización actual es sólo terminar ese plan; no se ha tratado el catálogo completo ni aprobado el runtime. Este documento conserva la historia y sus estados de aprobación originales; consultar la hoja de ruta para el estado vigente.

Este documento analiza el cielo **al 100 % de opacidad**. No propone corregir su densidad aumentando la opacidad ni alterando la transición de scroll existente.

## 1. Alcance y lectura rápida

1. Revisar las comprobaciones ejecutadas en §3 y la evidencia numérica adjunta.
2. Resolver fuente, licencia y separación estelar mediante un prototipo offline (§6).
3. Integrar únicamente después de cerrar las puertas de viabilidad de §8.

| Incluido ahora | Fuera del alcance autorizado ahora |
| --- | --- |
| Documentación, inspección y sondas numéricas/HTTP sin modificar la aplicación | Editar componentes, shaders, configuración o catálogo |
| Prototipo offline con herramientas aisladas e imágenes comparativas para aprobación | Comprar/publicar recursos o incorporar dependencias al frontend |
| Identificar límites y pruebas que faltan | Escribir tests, abrir navegador/Playwright o desplegar |

Requisitos del usuario que gobiernan este análisis:

> «Una imágen fallback detrás con el fondo y  estrellas superpuestas.»
>
> «Sólo aceptaré solucionaes de alta calidad y no parches ni soluciones pobres.»
>
> «lo de la opacidad es parte de la funcionalidad, hablo máß bien cuaando esta a100% de opacidad»
>
> «Genera un documento ordenado para tener todo claro, tecnologías a utiliar, mecanismos, etc. Antes de editar código generar comprobaciones para definir viabilidad»

El fondo persistente y el fallback son responsabilidades diferentes: el primero forma parte de la escena normal; el segundo reemplaza las estrellas dinámicas cuando no se ejecutan. La composición de respaldo también debe verse completa.

## 2. Base actual comprobada

Todos los módulos del cielo pertenecen a `app/(home)/_sections/hero/capabilities/night-sky/`.

| Responsabilidad | Fuente actual | Contrato que conservar |
| --- | --- | --- |
| Datos | `star-catalog.ts`, `star-catalog.ts.bak` | 4.666 registros actuales; 5.530 en respaldo; RA/Dec J2000, Vmag y B−V |
| Procedencia | Cabecera de `star-catalog.ts.bak` | Yale BSC5/CDS V/50; RA 2–18 h, Dec −85…+70°, Vmag ≤6,5; extracción original no reproducible en el repositorio |
| Geometría | `sky-reference.ts`, `sky-crop.ts` | Estereográfica, RA 9,75 h / Dec −7,5°, espejo X; referencia fija 16:9 |
| Datos GPU | `star-mapper.ts` | `origins`: pares X/Y; `stars`: fase/tamaño/alpha/velocidad; `colors`: RGBA |
| Dibujo | `webgl-star-renderer.ts` | Quads instanciados, núcleo/halo y tamaño en píxeles CSS; DPR máximo 2 |
| Ciclo de vida | `night-sky.ts`, `index.tsx` | Estados initializing/active/fallback y limpieza de recursos |
| Encuadre | `../framing/index.tsx` | `max-w-480`: ancho del artwork limitado a 1.920 píxeles CSS |
| Narrativa | `night-sky.ts`, `../light-pollution/`, `../bortle-scale/` | Mantener progresión de opacidad y semántica de contaminación lumínica |

El recorte responde al tamaño real del canvas, no necesariamente al viewport de pantalla. Una pantalla ultrawide no garantiza un recorte 21:9, porque el artwork tiene límite de ancho. No se midió la altura efectiva en navegador.

El SVG de `public/images/hero/hero-sky-fallback.svg` es un campo de puntos alternativo; no hay una fotografía persistente bajo el canvas activo. Actualmente la imagen empieza oculta en SSR y el runtime activa el fallback: no debe asumirse que ya existe un respaldo visible sin JavaScript.

## 3. Comprobaciones ejecutadas antes de editar aplicación

[Evidencia numérica y parámetros reproducibles](./evidence/hero-hybrid-sky-feasibility.json). Snapshot: `2026-10-18T19:36:57Z`, HEAD `0a08845820d40b027264116ab3a5b9cbec382cfc`; los hashes identifican los módulos efectivamente comprobados sobre el árbol de trabajo.

### C1. Proyección e inversión — pasa como consistencia matemática

Se ejecutó `projectStar` del módulo real y una inversa analítica independiente de su implementación directa sobre las 4.666 entradas. Error máximo de ida/vuelta: **4,8035 × 10⁻¹² píxeles** en un máster de 3.840 × 2.160.

El paso del plano por píxel es `0,001417453703703703` en ambos ejes: la referencia 16:9 es isotrópica. La normalización intermedia mediante `REGION_BBOX` tiene escalas distintas, pero eso no implica distorsión en la composición final.

**Límite:** esta comprobación no registra una fotografía ni demuestra equivalencia independiente con WCSLIB/Astropy.

### C2. Recorte responsive y centros GPU — pasa numéricamente

Se ejecutaron los exports actuales `computeSkyCrop` y `mapStarCatalog`, recuperando el rectángulo del plano que corresponde a cada frame. Todos quedaron dentro de `SKY_REFERENCE`.

| Frame CSS de la sonda | Centros dentro | Quads que pueden intersectar a tamaño máximo | Registros omitidos del respaldo que podrían intersectar |
| --- | ---: | ---: | ---: |
| 1.920 × 1.080 | 4.602 | 4.613 | 0 |
| 1.440 × 1.080 | 4.261 | 4.275 | 0 |
| 1.920 × 823 | 3.784 | 3.816 | 0 |
| 390 × 844 | 1.950 | 1.985 | 0 |
| 360 × 800 | 1.903 | 1.932 | 0 |
| 1.920 × 1.440 | 4.261 | 4.272 | 0 |
| 1.920 × 2.160 | 3.374 | 3.385 | 0 |

El shader aplica `twinkle = (1−a) + sin(…)·a`; con `a=0,06`, el tamaño oscila entre **0,88 y 1**, no entre 0,94 y 1,06. El semitamaño máximo del quad es 9 píxeles CSS. Se comparó contra ese límite conservador, antes de terreno, alpha y perfil del fragment shader.

El error entre centros analíticos del raster y `origins` GPU Float32 fue menor que **0,000174 píxeles CSS**, incluyendo una sonda matemática hipotética de 3.840 × 2.160 CSS sin el límite de ancho. No es una medida de registro fotográfico, antialiasing o rendimiento. Tampoco garantiza cobertura para tamaños arbitrarios.

**Consecuencia:** recuperar las 864 estrellas descartadas no aporta nuevos quads visibles en estos frames; no es la solución a la densidad percibida.

### C3. Servicio externo con el encuadre completo — pasa como transporte/formato

Se envió a CDS HiPS2FITS un WCS STG derivado del encuadre, con `hips=CDS/P/DSS2/color`, tamaño 64 × 36 y salida FITS:

- HTTP **200**, `application/fits`, **14.400 bytes**; encabezado `SIMPLE=T`.
- Tamaño servido **64 × 36 × 4**, datos de 8 bits: producto de color RGBA, no un FITS científico lineal por el solo hecho de usar ese contenedor.
- 9.216 muestras finitas, 9.006 distintas de cero, rango 0–255.
- Conservó proyección, centro, escalas y referencia de píxel enviados; la respuesta declara ICRS.

**No demuestra:** posición de estrellas dentro de la imagen, cobertura útil de cada canal, calidad a 4K, separación estelar o derechos de reutilización. El campo `CPYRIGHT` llegó vacío: no constituye una licencia. DSS2/color es una fuente de diagnóstico geométrico, no el fondo visual elegido.

### C4. Herramientas y formatos — disponibilidad parcial

| Herramienta | Resultado local | Uso propuesto |
| --- | --- | --- |
| Node 26.12.0 + TypeScript del proyecto | Ejecutó módulos puros mediante transpilación en memoria | Extraer contratos, calcular puntos de control y manifiesto |
| ImageMagick 7.1.2-34 | Anuncia FITS y WebP; codificó/decodificó WebP 1.920 × 1.080 | Inspección, variantes y compresión offline |
| AVIF en ImageMagick | No aparece como formato anunciado; no se probó encoder | No adoptarlo como requisito todavía |
| Python 3.15.0 | Disponible | Sólo candidato para pipeline offline |
| NumPy, Astropy, reproject, Pillow, Photutils, SciPy | No instalados | Registro/reproyección y separación estelar aún no ejecutables localmente |

La codificación usó `docs/evidence/fondo-estrellado-1920.png` únicamente como entrada técnica. Ese PNG mide 1.920 × 1.080 y 298.683 bytes, pero no tiene procedencia/WCS acreditados en esta investigación: **no queda aprobado como fondo**. Tampoco representa el peso del recurso futuro.

### C5. Memoria — calculada, no medida

Un bitmap RGBA ocupa aproximadamente **7,91 MiB a 1.920 × 1.080** y **31,64 MiB a 3.840 × 2.160**, sin contar copias, composición ni buffers del navegador. Una textura 4K con cadena completa de mipmaps rondaría 42,19 MiB; sólo aplica si se usa esa estrategia.

Estos tamaños no son presupuesto aprobado ni benchmark. Un archivo WebP pequeño puede decodificar a un bitmap grande. Las variantes móviles deben elegirse por el recorte y la resolución efectiva, no descargando siempre un máster 4K.

### Incidencias y comprobaciones no realizadas

- Primera sonda local: exit 1 porque el cargador exploratorio añadió `.ts` a un import que ya tenía extensión. Se corrigió sólo el cargador en memoria; la ejecución válida terminó en exit 0.
- Primera comparación raster/GPU: leyó posiciones desde `stars` en vez de `origins`. Sus deltas se descartaron; la sonda corregida anterior terminó en exit 0.
- El lector web recibió HTTP 200 para FITS pero no soportó su contenido binario. La sonda directa posterior sí analizó encabezado y datos; exit 0.
- No se ejecutaron Astropy/WCSLIB, separación PSF, visuales, benchmarks, build o suite de aplicación. No se escribieron tests ni se modificó aplicación/dependencias.

## 4. Arquitectura y tecnologías propuestas

**Recomendación provisional: imagen DOM persistente + canvas WebGL existente.** La cámara es fija: no se justifica añadir Three.js, otro motor de animación, un planetario WASM ni streaming HiPS en producción.

| Tecnología | Decisión propuesta | Razón / condición |
| --- | --- | --- |
| Next.js 16.3.8 / React 19.2.8 actuales | Conservar composición local y salida de imagen SSR | Imagen visible sin esperar la inicialización de WebGL |
| TypeScript + funciones geométricas actuales | Fuente única del contrato espacial | No duplicar manualmente proyección o recortes en CSS/scripts |
| WebGL2 actual | Conservar estrellas puntuales | No hay un cuello de botella medido que justifique sustituirlo |
| GSAP 3.15.0 actual | Conservar curvas y duración de estrellas | La opacidad intencional no es el defecto a resolver |
| Imagen WebP local | Candidato inicial de entrega | Encoder comprobado; medir después calidad y tamaño reales |
| FITS/WCS + Astropy/reproject | Candidato offline, fuera de dependencias del frontend | Reproject presupone un WCS correcto: **no resuelve** una imagen sin calibrar |
| Photutils/ajuste PSF | Candidato offline, no solución ya validada | Puede ajustar/sustraer fuentes; saturación, halos y crowding requieren prueba |
| Manifiesto JSON de assets | Propuesto para el recurso final | Fuente/licencia, hash, WCS, límites, dimensiones, espacio de color, herramientas y separación aplicada |

La imagen DOM evita un nuevo pase de textura propio, aunque el navegador igualmente debe decodificarla y componerla. No se afirma que sea más rápida sin medición. La alternativa de textura en el renderer queda reservada a una necesidad medida de composición/color que el DOM no resuelva.

### Contrato geométrico que compartir

Sean `R = REGION_BBOX` y `c = computeSkyCrop(width/height)`. Recuperar el recorte del plano:

```text
left   = R.xMin + c.offsetX / c.scaleX × (R.xMax − R.xMin)
top    = R.yMax − c.offsetY / c.scaleY × (R.yMax − R.yMin)
width  = (R.xMax − R.xMin) / c.scaleX
height = (R.yMax − R.yMin) / c.scaleY
```

Con `S = SKY_REFERENCE`, las UV del raster son `(left−S.x0)/S.width`, `(S.y0+S.height−top)/S.height` y spans `width/S.width`, `height/S.height`. El dibujo de la imagen debe usar esas UV. **No aplicar directamente `scaleX/offsetX` a una imagen máster**: esos valores operan sobre la región de normalización, no sobre el bitmap de referencia.

WCS candidato del máster 3.840 × 2.160: `RA---STG / DEC--STG`, `CRVAL=(146,25; −7,5)`, `CRPIX=(1877,1907273736817; 1028,0467877323056)`, `CDELT=(−0,0812141148774093; +0,08121411487740933)` grados del plano/píxel. No interpretar esa escala como FoV angular uniforme sobre toda la esfera.

Para un tamaño `W×H`, `dx=S.width/W`, `dy=S.height/H`, `CRPIX=(0,5−S.x0/dx; 0,5−S.y0/dy)` y `CDELT=(−dx; +dy)×180/π`. FITS usa referencia de píxel basada en 1 y eje Y hacia arriba; el raster de pantalla usa Y hacia abajo. Hay que validar la conversión de origen y orientación antes de aprobar una imagen. El centro del bitmap no es exactamente el punto tangente. No equiparar automáticamente J2000 con ICRS: verificar marco y época de la fuente al cerrar G3.

### Capas y estados

Orden propuesto: color base → fondo astronómico → estrellas puntuales → contaminación lumínica/terreno → contenido. Conservar la oclusión existente y no mover responsabilidades fuera de la capability local.

| Estado | Resultado requerido para el diseño posterior |
| --- | --- |
| SSR / inicialización | Fondo y representación estática de estrellas disponibles; no esperar JS para toda la escena |
| WebGL listo | Sustitución de estrellas estáticas por dinámicas, sin superposición doble ni salto de exposición |
| Reduced motion / sin WebGL / contexto perdido | Fondo + estrellas estáticas coherentes; sin rAF de centelleo |
| Error del fondo | Conservar estrellas y color base; no romper el hero |
| Resize / orientación | Imagen y estrellas consumen el mismo frame y recorte |
| Destroy | Limpiar observadores/listeners/recursos; no crear loops paralelos |

La implementación actual no tiene recuperación explícita de contexto restaurado; mantener fallback estable es suficiente para esta propuesta. No se incorpora una nueva política de reintentos.

La visibilidad de estrellas debe conservar `0,12 → 1` hasta progreso `0,7`. El fondo difuso tendrá una respuesta propia coherente con la narrativa; no usarlo para aumentar artificialmente la opacidad de los puntos. Si fondo y estrellas tienen controles diferentes, un fallback aplanado no puede recibir indiscriminadamente la opacidad del canvas: podría cambiar el aspecto. Evaluar fondo compartido + reemplazo estático de puntos; rasterizar puntos a distintas escalas también cambia su tamaño CSS y debe verificarse.

## 5. Fuente de imagen: decisión todavía abierta

| Candidato | Fortaleza | Bloqueo antes de elegir |
| --- | --- | --- |
| ESO/S. Brunier, `eso0932a` | Panorama publicado 6.000 × 3.000; política CC BY 4.0 salvo excepciones | Acreditar proyección/WCS, resolución útil y separación; crédito visible y modificaciones declaradas |
| Axel Mellinger | Panorama con calibración astrométrica/fotométrica documentada | Obtener licencia y formato/proyección concretos; no asumir uso educativo gratuito |
| Survey óptico HiPS con metadatos | Reproyección automatizable; vía de transporte comprobada | Licencia del survey, costuras, color y adecuación estética; HiPS no es una licencia |

**Prioridad:** inspeccionar una fuente óptica calibrada y con permiso claro. ESO es candidato, no elección definitiva: una imagen 2:1 no demuestra proyección equirectangular ni WCS válido. La licencia del motor Stellarium no autoriza automáticamente sus imágenes.

No insertar una foto genérica del núcleo galáctico si no corresponde al fragmento actual. No usar imágenes generativas para inventar posiciones o corregir el registro.

## 6. Pipeline offline y prueba decisiva de calidad

```text
Fuente original + licencia + calibración
  → identificar las estrellas que reemplazará el catálogo
  → ajustar/sustraer esas fuentes en la imagen nativa cuando sea posible
  → reproyectar el residual al contrato del hero
  → tratamiento de color/exposición documentado
  → variantes de resolución + respaldo estático + manifiesto
```

1. **Registro:** distribuir puntos de control por centro, bordes y esquinas, no sólo estrellas centrales. El umbral propuesto de 0,5 píxel CSS pertenecía al primer ensayo y el usuario lo descartó como criterio bloqueante. En la fase actual se priorizan identidades reconocibles, coherencia visual a tamaño real y nitidez; los desvíos se informan sin convertirlos automáticamente en un rechazo. Separar el error de proyección del error de recorte DOM.
2. **Separación:** usar las estrellas realmente superpuestas, no borrar toda la población tenue. Conservar el grano no resuelto, las nubes y las bandas de polvo. Evaluar estrellas saturadas, halos extensos, pares y regiones densas; rechazar agujeros, anillos negativos o dobles brillos.
3. **Color:** el contenedor FITS no garantiza linealidad. Un JPEG/HiPS de color con tone mapping desconocido puede requerir ajuste empírico y no permite prometer una sustracción fotométrica física. No sumar/sustraer valores sRGB como si fueran flujo lineal.
4. **Resultado:** comparar fuente, residual y composición reconstruida al tamaño final. No sustituir esta prueba por blur general, ruido, un generador de puntos uniformes o mayor brillo de las estrellas existentes.

No ampliar inicialmente el BSC5: conserva posiciones y jerarquía actuales mientras se comprueba el fondo. Si aún falta densidad puntual después, evaluar una selección Tycho-2 por separado, con deduplicación y transformación fotométrica; no mezclar V, VT y G sin tratamiento.

## 7. Superficies futuras y límites de integración

| Superficie candidata | Cambio que se evaluaría después, no ejecutado ahora |
| --- | --- |
| `night-sky/sky-reference.ts`, `sky-crop.ts` | Exponer/adaptar el contrato compartido sin cambiar el encuadre |
| `night-sky/index.tsx`, `night-sky.ts`, `config.ts` | Montaje de imagen, readiness, recorte y sustitución del fallback |
| `public/images/hero/` | Recursos finales versionados y atribución asociada |
| Herramienta offline dedicada, ubicación a definir | Generación reproducible; no procesamiento astronómico en el navegador |

No tocar catálogo, fotometría, shaders, curvas GSAP, layout general ni capabilities vecinas salvo que una prueba concreta lo justifique. Antes de cualquier edición Next.js, leer la guía relevante de la versión instalada, como exige `AGENTS.md`.

## 8. Puertas de avance y decisión necesaria

| Puerta | Estado | Evidencia que falta para cerrarla |
| --- | --- | --- |
| G1. Geometría y recorte numéricos | Comprobado, C1–C2 y Astropy/WCSLIB independiente | No equivale a registrar la fotografía |
| G2. Herramienta de transporte/formatos | Entorno offline instalado y comprobado | Dependencias aisladas, sin cambios al frontend |
| G3. Correspondencias de la fuente | Fase 2: coherencia visual respaldada por Orión y cinco anclas reservadas | Identidades inspeccionables/provisionales, no plate solve externo; aprobación visual pendiente |
| G4. Eliminación selectiva y reconstrucción | Doce muestras generadas y revisadas por el padre | Comparativas nativas listas para aprobación del acabado; catálogo completo pendiente, sin afirmar todos los casos resueltos |
| G5. Peso/resolución | PNG y WebP90/95 nativos medidos | Referencias 3840×2160/780×1688; decisión de calidad/peso pendiente del usuario |
| G6. Composición y rendimiento runtime | No ejecutado | Navegador autorizado, desktop/móvil, DPR 1/2, orientación, carga/error/fallback y scroll |
| G7. Aprobación visual humana | No otorgada | Obligatoria antes de cualquier implementación en el hero |

**Integración pendiente de aprobación visual explícita.** Se reemplazó el criterio subpíxel por nitidez/coherencia, pero la aclaración S9 sí requiere reconstruir el fondo bajo las estrellas que puedan moverse: no basta una foto intacta con el canvas superpuesto ni una resta que deje huecos. PSF puede ayudar a delimitar la fuente; la reconstrucción y su calidad deben comprobarse. G6 sigue siendo posterior: no hay runtime verificado y usar Playwright requiere autorización explícita.

**Autorización posterior recibida:** el usuario respondió «Lo autorizo» a la propuesta de prototipo exclusivamente offline, con herramientas aisladas dentro del proyecto. Luego agregó: «Genéra imágenes con los resultados para comprobar, debo aprobar el resultado antes de cualqueir impleemntación».

La ejecución está registrada en [la tarea del prototipo](../tasks/hero-sky-offline-prototype.md). Debe producir imágenes comparativas reales de fuente, residual y composición al 100 % de opacidad, incluyendo escritorio, móvil y detalles de artefactos. No usar imágenes generativas ni confundir una composición offline con una captura de la aplicación. El prototipo debe comprobar G3–G5 sin editar el hero; si la separación falla, mostrar el defecto y emitir NO-GO. **La aprobación visual humana es una puerta adicional obligatoria antes de cualquier integración**, incluso si los números pasan. Compras y uso de Playwright siguen fuera del permiso.

## 9. Resultado del primer prototipo offline

**El proceso terminó, pero la hipótesis fotográfica no pasó.** La corrida real finalizó con exit 0 en 49,019 segundos y produjo imágenes de diagnóstico. Exit 0 significa que el experimento se ejecutó, no que su resultado sea viable.

[Evidencia resumida del prototipo](./evidence/hero-hybrid-sky-prototype.json). Las imágenes grandes permanecen locales y fuera de Git, en `output/hero-sky-prototype/results/`; no se copiaron a `public/` ni a la aplicación.

| Comprobación | Resultado observado |
| --- | --- |
| WCS STG independiente vs contrato actual | Error máximo del máster ≈1,90 × 10⁻¹² píxeles; discrepancia Float32 GPU <0,000174 píxeles CSS |
| Panorama ESO | JPEG RGB 6.000 × 3.000, crédito ESO/S. Brunier y páginas de licencia preservados; WCS exacto no suministrado |
| Registro fotográfico, escritorio | Sólo 7 de 55 controles reservados aceptados; mediana 4,84 y máximo 5,72 píxeles CSS |
| Registro fotográfico, móvil | Sólo 3 de 23 controles reservados aceptados; máximo 3,79 píxeles CSS |
| Cobertura espacial de controles | 5 de 12 celdas de escritorio; insuficiente |
| Sustracción estelar | No intentada: 0 fuentes retiradas; residual idéntico a fuente |
| Tamaños WebP experimentales | Escritorio 478.178/730.720 bytes y móvil 285.042/442.144 bytes, calidad 80/90 |

Las identidades de los controles son aproximaciones por pico cercano, no identificaciones astronómicas independientes. Un ajuste errado puede encontrar coincidencias casuales; los pocos controles aceptados no justifican una calibración. La hipótesis CAR evaluada no invalida por sí sola todas las proyecciones ni demuestra que la fuente ESO sea imposible de calibrar.

### Imágenes para inspección, no para implementación

- [Comparativa completa: fuente → residual → estrellas actuales → composición](../../output/hero-sky-prototype/results/contact-sheet.png).
- [Composición candidata de escritorio](../../output/hero-sky-prototype/results/1920x1080@1x-composite.png).
- [Composición candidata de móvil](../../output/hero-sky-prototype/results/390x844@2x-composite.png).
- [Detalle ampliado de estrella brillante](../../output/hero-sky-prototype/results/detail-bright-isolation-candidate.png).
- [Anclas predichas sobre el panorama original](../../output/hero-sky-prototype/results/source-anchors.png).

Los paneles mantienen exposición idéntica y añaden 62 píxeles de pie fuera del cielo para el crédito y el estado UNVALIDATED/NO-GO. La composición usa una aproximación CPU de nuestras estrellas al 100 % de opacidad, no una captura de WebGL ni del hero con sus cerros/textos. El panel denominado residual no ha sido separado: mostrarlo distinto habría falseado la evidencia.

La inspección del padre encontró el registro sin respaldo suficiente, abundantes anclas rechazadas y zonas de falta de cobertura visibles. No se recomienda aprobar esta versión. Tampoco se debe interpretar la máscara negativa vacía como prueba de una buena separación: no hubo sustracción.

### Límites operativos y siguiente decisión

El entorno funciona con Python 3.14.8, NumPy 2.5.4, SciPy 1.18.1, Astropy 8.0.2, Pillow 13.0.0, Photutils 3.1.1 y reproject 0.21.0 dentro de `output/hero-sky-prototype/`. El código del experimento y su uso están en `tools/hero-sky-prototype/`. No se ejecutaron tests, navegador ni build de aplicación; no aplican como aprobación de este experimento offline. No hay cambios en `app/`, `public/`, `package.json` ni lockfile.

La primera envoltura de ejecución falló antes de iniciar Python porque `/usr/bin/time` no existe; se registró exit 127 y la corrida real usó timing de Bash. La evaluación nativa no estuvo disponible y la lectura de su modo falló con exit 127 por ausencia de `gentle-ai`; no se reclama revisión nativa ni aprobación de entrega. La verificación independiente confirmó aislamiento, hashes contra el baseline, 15 PNGs válidos y cuatro WebP con tamaños correctos. Comparó los píxeles y confirmó que fuente y residual son idénticos en ambos formatos de frame. No encontró bloqueos del tooling; el NO-GO fotográfico y la falta de aprobación humana se mantienen. El aviso de cambios concurrentes quedó resuelto: eran las actualizaciones intencionales del padre a este documento y a su resumen JSON. La tarea del prototipo conserva esa evidencia.

**Decisión histórica del primer ensayo:** ese material quedó como diagnóstico del método fallido, no como fondo aprobado. El usuario resolvió después priorizar nitidez y reconocer constelaciones, autorizando el ensayo alternativo de §10. Los datos negativos anteriores se preservan, pero no se extrapolan como prohibición de usar la fotografía ni se reintroduce el umbral subpíxel.

## 10. Segundo ensayo: constelaciones y nitidez

El usuario aclaró que la composición se ve bien y prefiere priorizar nitidez. También confirmó que el canvas ya funciona en responsive y sugirió reconocer relaciones estrella–constelación, especialmente Orión. Autorizó proceder con ese ensayo offline; no autorizó integrar en la aplicación.

- Usar el mismo `SKY_REFERENCE` y `computeSkyCrop`; un único mapeo de fuente a cielo sirve a todos los tamaños. El recorte móvil puede ocultar Orión sin que eso sea un fallo de alineación.
- Identificar el patrón de Orión —cinturón, Betelgeuse y Rigel— en vez de asumir identidades por el punto luminoso más cercano. Comprobar además estrellas de otras regiones para evitar un ajuste sólo local.
- Preservar detalle fotográfico y no exigir sustracción PSF ni coincidencia subpíxel si no aportan calidad perceptible. Sí exponer duplicaciones molestas, huecos, costuras o correspondencias inciertas; no inventar anclas ni ocultar artefactos.
- Generar escritorio 3.840 × 2.160 para 1.920 × 1.080 CSS a DPR 2 y móvil 780 × 1.688 para 390 × 844 CSS a DPR 2. Usar PNG como referencia y WebP 90/95 con encuadre/exposición idénticos.
- Entregar detalles nativos 1:1 sin ampliaciones por vecino más cercano, medidas de peso y costo de decodificación. Un archivo 4K no crea detalle que la fuente no tenga después de reproyectarla.

El primer conjunto de resultados permanece en `output/hero-sky-prototype/results/`. Los nuevos ya están en `output/hero-sky-prototype/sharpness-review/`, separados y rotulados como candidatos visuales pendientes de aprobación, no como capturas del hero ni como astrometría certificada. No se cambian dependencias, aplicación, catálogo, shaders ni curvas de opacidad.

## 11. Entrega del candidato de Orión y nitidez

La ejecución completa terminó con exit 0 en **55,995 segundos**. Se generaron 18 variantes codificadas, siete láminas de detalle nativo y paneles de identidades/revisión. [Resumen reproducible de la fase 2](./evidence/hero-hybrid-sky-sharpness.json).

### Qué cambió respecto del primer ensayo

Se identificaron en la fotografía las siete estrellas principales de Orión y se asociaron a filas reales del BSC5. En vez de buscar coincidencias globales por brillo, esas correspondencias ajustaron **una sola rotación 3D**, sin deformación local ni ajuste por dispositivo. Sirius, Canopus, Aldebaran, Regulus y Spica quedaron reservadas para comprobar el ajuste y no participaron del cálculo.

En el encuadre de escritorio, los desvíos de Orión están entre **0,052 y 0,710 píxeles CSS**; las cinco comprobaciones externas, entre **0,273 y 1,120**. Se informan como respaldo de coherencia visual respecto de centros inspeccionados, con incertidumbre de identificación/centrado: no certifican astrometría ni se convierten en una puerta automática de medio píxel.

Ambas muestras tienen **100 % de cobertura**, sin píxeles inválidos, y los recortes son exactamente los existentes. Orión queda fuera del recorte móvil original: no se movió el fondo para forzarlo a entrar. El padre revisó las identidades anotadas, las anclas reservadas, la composición móvil y detalles 1:1; verificó hashes, dimensiones y decodificación de las 18 variantes y que no hubiera cambios protegidos de aplicación.

### Imágenes para tu aprobación

- [Composición de escritorio — cielo 3840×2160 más pie de crédito](../../output/hero-sky-prototype/sharpness-review/1920x1080@2x-composite-panel.png).
- [Composición móvil — cielo 780×1688 más pie de crédito](../../output/hero-sky-prototype/sharpness-review/390x844@2x-composite-panel.png).
- [Orión identificado sobre la fotografía original](../../output/hero-sky-prototype/sharpness-review/orion-original-annotated.png) y [cinco comprobaciones externas](../../output/hero-sky-prototype/sharpness-review/distributed-checks.png).
- [Comparación 1:1 del cinturón: PNG / WebP90 / WebP95](../../output/hero-sky-prototype/sharpness-review/1920x1080@2x-native-Orion-belt.png).
- [Detalle tenue 1:1](../../output/hero-sky-prototype/sharpness-review/1920x1080@2x-native-faint-dust-candidate.png) y [borde 1:1](../../output/hero-sky-prototype/sharpness-review/1920x1080@2x-native-edge.png).
- [Vista general de foto / estrellas actuales / composición](../../output/hero-sky-prototype/sharpness-review/contact-sheet.png). Sus miniaturas sirven para composición, no para juzgar nitidez.

### Calidad y peso del fondo fotográfico

| Variante | PNG de referencia | WebP 90 | WebP 95 | RGBA decodificado |
| --- | ---: | ---: | ---: | ---: |
| Escritorio 3840×2160 | 12.278.392 B | 2.210.494 B | 3.116.438 B | 31,64 MiB |
| Móvil 780×1688 | 2.222.190 B | 456.832 B | 593.120 B | 5,02 MiB |

**Recomendación provisional: WebP 95 si se prioriza conservar detalle fino.** El 90 es una alternativa más liviana; ambos usan el mismo recorte y exposición. Los tamaños de la tabla corresponden a la foto que podría ir detrás del canvas, no a una imagen con las estrellas dinámicas aplanadas dentro.

Las imágenes conservan las estrellas originales y superponen una aproximación CPU de las actuales al 100 % de opacidad: no se ejecutó sustracción, sharpening ni reescalado con IA. Algunos bordes muestran suavidad/elongación en el PNG también, por la fuente finita y la reproyección; aumentar la calidad del codec no recupera detalle ausente. Inspeccionar a tamaño real, especialmente antes de decidir que hace falta una fuente mayor. No se declara apariencia pixel-idéntica a WebGL.

**Pendiente:** la prueba de reconstrucción de §12 y tu aprobación de composición, nitidez y fondo sin restos, antes de cualquier implementación/verificación de runtime que autorices. El hero, su catálogo, responsive, shaders, dependencias y transición de opacidad siguen intactos. Native ASSESS ofreció autoverificación de riesgo medio pero no pudo calcular riesgo nativo por archivos sin declaración de intención; no se reclama revisión nativa aprobada.

## 12. Reconstrucción del fondo para estrellas independientes

El usuario aclaró que la estrella debe desaparecer de la fotografía como si no hubiera estado allí, con continuidad del polvo/fondo, porque una futura interacción o parallax podría desplazar el canvas. **No se pide dejar un espacio vacío ni taparlo con un círculo.**

**Criterio de aceptación S10:** «No necesita certeza, sólo que no se vea una mancha evidente». La prueba se juzga por continuidad visual a tamaño real y con estrellas desplazadas: sin manchas, huecos, fantasmas, costuras ni cambios evidentes de textura. La incertidumbre sobre el fondo original se declara, pero no es una causa automática de rechazo.

La separación se evaluará como inpainting selectivo en la fuente nativa: identificar el centro fotográfico real, delimitar núcleo/halo, reconstruir estructura de fondo y textura fina a partir de contexto compatible y conservar intacto lo ajeno al área editada. En zonas oscuras se reproduce el fondo local; no se inventa polvo donde no lo hay. Los píxeles ocultos/saturados de una JPEG no pueden recuperarse como observación exacta: la reconstrucción es inferida y se debe declarar.

La prueba se limita inicialmente a las doce anclas ya inspeccionadas o un subconjunto fiable declarado: estrellas aisladas, halos brillantes, Alnitak cerca de nebulosidad y casos hacia los extremos. No equivale a retirar las 4.666 estrellas ni a un fondo final listo para animación. Las estrellas tenues que no pertenecen a la capa móvil deben seguir aportando densidad.

Se mostrarán original, máscara, **fondo reconstruido solo**, composición con estrellas tratadas y una variante con esas estrellas desplazadas de forma estática. Eso expone halos, manchas, costuras, textura repetida o huecos que un punto encima podría esconder. No se implementa parallax real ni se escoge su amplitud de producto.

Los nuevos resultados están en `output/hero-sky-prototype/reconstruction-review/`. Fuente, entorno, alineación, catálogo, responsive, opacidad y todos los resultados anteriores quedan preservados. No se agregaron dependencias, modelos/servicios externos ni imágenes generativas. El tratamiento completo queda pendiente de la evaluación del acabado y la aprobación del usuario.

## 13. Muestras de reconstrucción para revisar

La primera ejecución terminó sin editar estrellas porque excluía casi todo el contexto disponible. Ese intento no se consideró éxito y quedó archivado en `reconstruction-review/attempt-1/`. Se hizo una corrección acotada: excluir fuentes fuertes sin descartar toda la textura tenue, ponderar el soporte y completar las zonas contaminadas del material de relleno.

La corrida corregida terminó con exit 0 en **63,935 segundos** y trató las doce anclas: Betelgeuse, Rigel, Bellatrix, Saiph, Mintaka, Alnilam, Alnitak, Sirius, Canopus, Aldebaran, Regulus y Spica. [Resumen verificable](./evidence/hero-hybrid-sky-reconstruction.json).

| Evidencia | Resultado |
| --- | --- |
| Zonas tratadas | Doce muestras, no las 4.666 estrellas del catálogo |
| Cambios en la fuente nativa | 4.266 píxeles modificados dentro de una unión de edición de 4.623 píxeles |
| Resto de la fuente | Cero píxeles distintos fuera de la máscara, también tras decodificar el PNG |
| Preservación | Trece archivos de referencia —fuente, código anterior, reportes, entorno y manifiestos— mantienen sus hashes |
| Archivos de revisión | 42 PNG decodificados y comprobados; procedencia de donantes consistente |
| Encuadres | Mismos recortes de escritorio/móvil y misma rotación; sin huecos de cobertura |
| Movimiento de prueba | Desplazamiento estático de +8/−6 píxeles CSS sólo en el subconjunto tratado; no es animación ni amplitud de producto |

El padre inspeccionó muestras nativas de estrellas aisladas, halos brillantes, borde y nebulosidad, más detalles con el subconjunto desplazado. **A escala nativa, el relleno de los casos revisados se integra sin un círculo vacío ni una mancha fuerte evidente.** Es una evaluación preliminar para que el usuario juzgue el acabado; las etiquetas heurísticas de vecinos/estructura no equivalen por sí solas a un rechazo.

### Comparativas principales

En cada lámina de frame: **original → máscara → fondo reconstruido solo → estrellas tratadas en su lugar → mismas estrellas desplazadas**. Los recortes son 1:1, no ampliaciones artificiales.

- [Estrella aislada: Betelgeuse](../../output/hero-sky-prototype/reconstruction-review/1920x1080@2x-Betelgeuse-detail.png).
- [Halo brillante: Sirius](../../output/hero-sky-prototype/reconstruction-review/1920x1080@2x-Sirius-detail.png).
- [Cinturón y nebulosidad: Alnitak](../../output/hero-sky-prototype/reconstruction-review/1920x1080@2x-Alnitak-detail.png).
- [Extremo del campo: Spica](../../output/hero-sky-prototype/reconstruction-review/1920x1080@2x-Spica-detail.png).
- [Muestra móvil: Regulus](../../output/hero-sky-prototype/reconstruction-review/390x844@2x-Regulus-detail.png).
- [Fuente nativa: original/máscara/fondo/diferencia de Sirius](../../output/hero-sky-prototype/reconstruction-review/Sirius-native.png).

El resto de las estrellas fotográficas permanece. Estas imágenes no demuestran todavía una limpieza completa del campo para mover todo el canvas; muestran el acabado del método en las doce contrapartes tratadas. Las máscaras y las diferencias se incluyen para que el proceso sea inspeccionable, no forman parte del fondo final.

**Siguiente decisión:** aprobar o ajustar el acabado visual de estas muestras. Si resulta aceptable, se extenderá el tratamiento al resto de las contrapartes necesarias, revisando regiones densas y halos, antes de presentar un fondo completo para aprobación. No se ha integrado nada al hero ni se ha implementado interactividad/parallax.

## Referencias

- [BSC5: esquema y alcance](https://cdsarc.cds.unistra.fr/ftp/cats/V/50/ReadMe).
- [Stellarium Web: módulo de Vía Láctea](https://github.com/Stellarium/stellarium-web-engine/blob/master/src/modules/milkyway.c) y [estrellas](https://github.com/Stellarium/stellarium-web-engine/blob/master/src/modules/stars.c).
- [HiPS2FITS: parámetros WCS, STG y formatos](https://alasky.cds.unistra.fr/hips-image-services/hips2fits).
- [Astropy: convenciones WCS/píxeles](https://docs.astropy.org/en/stable/wcs/index.html) y [reproject: no hace registro](https://reproject.readthedocs.io/en/stable/).
- [Photutils: ajuste y sustracción PSF](https://photutils.readthedocs.io/en/stable/user_guide/psf.html).
- [Panorama ESO/S. Brunier](https://www.hq.eso.org/public/images/eso0932a/) y [condiciones de uso](https://www.hq.eso.org/public/outreach/copyright/).
- [Panorama Mellinger](https://www.milkywaysky.com/) y [licencias](https://www.milkywaysky.com/licenses.html).
