# Agrupación de instrumentos del mapa

El mapa representa con un marcador compuesto los instrumentos separados por un máximo de 5 metros entre cada par. La agrupación es geográfica, no depende del zoom y no modifica la fuente compartida con tabla y detalles. El encabezado muestra únicamente «N puntos de medición», con el total de fotómetros y cámaras SQC, no la cantidad de grupos.

## Vistas y navegación

El módulo se comparte entre la sección del home y `/explorar`. Los enlaces «Explorar» del navbar y del footer y el botón de la tercera escena del hero apuntan a la ruta dedicada; el enlace para reducir el mapa regresa a la sección del mapa y deja la URL en `/`. El enlace de ampliación y los dos botones de zoom comparten un único contenedor nativo vertical, con controles de 36 px y separación de 6 px; el enlace se ubica primero . Ambas vistas usan el mismo `ViewTransition` con nombre `instrument-map` para ampliar o reducir el contenedor, sin persistir cámara, filtros ni selección entre rutas. La carga del canvas comienza inmediatamente en `/explorar`, mientras el home conserva la activación diferida por proximidad.

`/explorar` ocupa el viewport dinámico bajo el navbar, sin barra institucional ni pies. En escritorio los filtros flotan a la izquierda y los créditos quedan a su derecha con separación, conservando el control desplegable y sus enlaces. El panel de información se superpone a la derecha sin reducir el canvas; su contenedor recorta completamente el panel cerrado. Al abrir el panel derecho, el grupo de navegación se desplaza para permanecer disponible, sin modificar la cámara ni el tamaño del mapa. En móvil se conserva la navegación modal y la restauración de foco existentes.

Los gestos cooperativos siguen activos en el home para proteger el scroll. En `/explorar` se desactivan: la rueda aplica zoom sin Ctrl/⌘ y un dedo desplaza el mapa. Las restricciones de inclinación y giro se mantienen en ambas vistas. La transición respeta movimiento reducido y los navegadores sin soporte navegan sin animación. Las capturas de View Transitions no conservan una instancia viva del motor ni garantizan que las teselas estén listas al terminar la ampliación.

## Flujo de datos

| Módulo                         | Responsabilidad                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `_dal/getMapData.ts`           | Obtener `getPoints()` y los fixtures locales; cachear instrumentos y grupos completos. Solo servidor.        |
| `store/MapFilterStore.ts`      | Aplicar el filtro existente de tipo y Bortle; derivar integrantes visibles sin reagrupar. SQC ignora Bortle. |
| `components/MapCanvas.tsx`     | Crear un `Marker` geográfico por grupo visible; conservar la restauración por `mapGeneration`.               |
| `components/GroupFigure.tsx`   | Ampliar y separar los mismos botones del grupo cerrado hasta posiciones individuales.                        |
| `components/MapMarkButton.tsx` | Compartir forma, contenido, borde y estados visuales entre marcadores individuales e integrantes de grupos.  |
| `hooks/useMapOverlays.ts`      | Coordinar selección única, cierre, teclado y restauración de foco.                                           |
| `components/MarkDrawer.tsx`    | Mostrar todas las fichas visibles en una región con scroll y un solo control de cierre.                      |

El DAL ordena por ID sin alterar los registros y asigna cada instrumento al primer grupo compatible con todos sus integrantes. La distancia usa Haversine y el límite es inclusivo. Una cadena A–B–C no forma un grupo si A–C supera 5 metros. El anclaje es la posición del primer integrante estable; al quedar uno visible, se usa su posición original.

No hay truncamiento: una coincidencia de cuatro instrumentos mutuamente cercanos genera un error explícito con sus IDs antes de preparar marcadores. Ese caso requiere una decisión de producto, no una expansión automática de la interfaz. Los tipos repetidos conservan una pieza por registro.

## Estados e interacción

El apilamiento se aplica al contenedor de cada `Marker`: grupos completos (`z-index: 2`) por encima de fotómetros independientes (`1`), y estos por encima de cámaras SQC independientes (`0`). La prioridad del grupo incluye todo su contenido, tanto cerrado como abierto, sin modificar su orden interno. Al filtrar hasta un solo integrante, el marcador adopta la prioridad de su tipo de instrumento.

- **Cerrado:** miniaturas al 75 % de su tamaño habitual cuando hay dos integrantes visibles y al 60 % cuando hay tres, próximas y con posibilidad de solapamiento leve, sin fusión, borde común ni ícono de agrupación. No muestran Bortle ni cámara. Cada figura conserva su borde individual y color: discontinuo para fotómetros y continuo para SQC. El borde CSS de 1 px se escala junto con la figura. Los botones individuales permanecen inertes y fuera de la navegación por teclado; un botón independiente permite abrir todo el grupo, sin botones anidados.
- **Abierto:** el primer clic o activación con teclado separa los mismos botones horizontalmente para dos integrantes o en triángulo para tres y abre todas las fichas. Cada integrante reutiliza `MapMarkButton`, también usado por los marcadores individuales: lados de 26 px para fotómetros, círculo SQC de 32 px, Bortle de 18 px, cámara SVG, sombras, colores y estados de hover, foco y selección. El borde mantiene 1 px; la selección aplica el relleno y los anillos existentes, sin engrosarlo. No se crean figuras duplicadas ni nuevos marcadores geográficos.
- **Selección:** activar una pieza resalta su artículo y lo lleva a la vista sin ocultar los otros. El foco usa `preventScroll` y el ajuste vertical modifica únicamente el `scrollTop` del listado interno, sin desplazar ancestros, el mapa ni el viewport. En móvil, todas las fichas y sus enlaces siguen disponibles en el panel mientras el mapa permanece inerte. La cámara conserva su contenido de demostración y no recibe un valor Bortle ni un enlace ficticio de detalle.
- **Filtrado:** con dos o tres integrantes visibles cambia la composición; con uno vuelve el marcador individual; con cero desaparece y se cierra el panel. La selección de un integrante oculto se descarta. El contador conserva unidades de instrumentos.
- **Cierre:** control único, Escape o clic en el mapa. El foco vuelve al disparador conectado, al marcador que lo reemplaza o al explorador si el grupo desapareció. El diálogo móvil mantiene la navegación Tab dentro del panel. El movimiento reducido desactiva las transiciones.

El mapa mantiene una vista plana y el norte fijo: `maxPitch={0}`, `dragRotate={false}` y `touchPitch={false}` bloquean la inclinación y el giro con mouse. Al cargar cada instancia se desactiva también la rotación táctil y por teclado, sin deshabilitar el desplazamiento, el zoom por teclado ni el gesto de pinza. La carga diferida, los controles de zoom y la conservación del mapa colapsado mantienen sus mecanismos existentes. La política e identidad de caché se detallan en la [guía de datos](../../../docs/guides/data-and-revalidation.md#mapa-agrupaciones-procesadas-en-servidor).

## Fixture temporal de tres instrumentos

`group-preview.ts` contiene tres registros exclusivos del mapa en latitud `-30.29`, longitud `-70.39`, al sureste del par Nómade y fuera de su tolerancia de 5 m. Comparten coordenadas para formar un grupo independiente de TESS-4C, TESS-W y SQC. Sus IDs estables son `map-preview-tess-4c`, `map-preview-tess-w` y `map-preview-sqc`. La cámara conserva Bortle y magnitud nulos.

`getMapData()` incorpora estos registros antes de `prepareMapData()`: la fuente completa continúa formando parte de la clave del resultado cacheado. No cambian el snapshot compartido, las rutas de detalle ni el fixture anterior `sqc-demo.ts`. Con la fuente actual, los 37 fotómetros y 10 cámaras previos pasan a 39 fotómetros y 11 cámaras, 50 instrumentos en total; `pointCount` y `demoCount` se derivan de los tipos presentes y el contador filtrado sigue contando instrumentos.

El campo local opcional `detailHref` conserva el enlace `/medicion/<id>` cuando está ausente. Un valor `null` omite el botón sin mostrar mensajes alternativos; los tres registros temporales lo declaran porque no tienen una ruta real de detalle. Las etiquetas de demostración heredadas de las cámaras con `demoLocation` no se añaden a la nueva SQC.

Para retirar el caso temporal, eliminar su importación e incorporación en `getMapData()` y retirar `group-preview.ts`; los contadores derivados se ajustan sin modificar el algoritmo. La interfaz no añade banners, leyendas ni avisos para este fixture.

## Límites de verificación

Solo están autorizados `pnpm lint`, `pnpm typecheck` y `pnpm build`, sin tests ni navegador. La separación de las miniaturas, la expansión de las figuras, el comportamiento responsive, el teclado y la restauración de foco requieren comprobación visual y de interacción por parte del usuario; la compilación no constituye esa evidencia.
