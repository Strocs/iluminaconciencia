# Agrupación geográfica de instrumentos del mapa
Objetivo: implementar los requisitos S1–S10. Rama: `main`, según la política del repositorio; conservar todos los cambios locales anteriores. Entrega local, sin publicación; estrategia `ask-on-risk` antes de cualquier propuesta de PR.
Comprobaciones autorizadas: `pnpm lint`, `pnpm typecheck`, `pnpm build`; sin tests ni navegador. Estimación: 700–1100 líneas modificadas, incluidas documentación y composición SVG; no reducir claridad para alcanzar una cuota de líneas.

## Specs

### S1. Cercanía, agrupación y panel

> Necesito que añadamos un sistema que reconozca cercanía de puntos: [Image#3]
>
> Ahí el punto de bortle 8 esta superpuesto a uno de bortle 4 de distinto fotometro. Quiero que antes de crear los marcadores se analice la data de modo de reconocer superposiciones con un área tolerable. En ese caso es excacta, pero puede variar levemente y ser considerado misma posición.
>
> Cuando esto sucede, debe aparecer sólo un símbolo, este símbolo debe representar que hay más información en ese punto. Al abrir el panel lateral se mostraríá la info de ambos puntos en un área scrolleable.
>
> Analiza el requerimiento y dime si es posible

### S2. Miniaturas compactas y expansión de las mismas figuras

> Creo que debemos mejorar el marcador, el ícono de grupo no me gustó. Quítalo, respecto al borde quítalo también. La forma da a entender un mensaje errado, creo que mejor lo replanteamos, ambas formas no se fusionan, si no que aparecen más pequeñas pero cercanas, siguen sin tener la información interior cada marcador, pero conservan su border correspondiente a cada uno. Dime si entiendes

Ajuste posterior de proximidad y grosor:

> deben estar más juntos y quizá uno levemente superpuesto con el otro, el border debe ser de 1px o lo más fino posible

Ampliación posterior diferenciada por cantidad:

> La idea es que el grupo de 2 sean más grandesl os íconos, pero el grupo de 3 no, porque ya abarrca más espacio

Se conserva la expansión solicitada originalmente:

> Al presionar estos marcadores de grupos, las formas se separan y muestran la info clickeable para cada item del grupo, por ejemplo, en los marcadores de grupos de 2 estos se abren horizontalmente, esto debe ser que el mísmo marcador se separa no que aparecen nuevas formas

> al presesionar uno de 3, entones se abren de acuerdo a sus posiciones.

> Abría que analizar qué pasa cuando son grupos de dos o tres ítemes iguales, quizá trambién hay que considerarlos y crear los marcadores para todos los casos, luego la data se analiza y se entrega para que utilice el marcadore correspondiente.

### S3. DAL y caché del resultado procesado

> el proceso de analizis de datos debe ocurrir en el DAL, luego del a obtención de datos del "servidor"(mock actual) y debe ser cacheada esa data ya procesada, no solamente la fuente.

### S4. Filtros sobre grupos

> acá hay algo a resolver, qué pasa si se apaga un item del grupo? qué pasa con el marcador?

La respuesta propuesta en la conversación y mantenida para esta implementación se registra como decisión de integración en L9; no es una cita adicional del usuario.

### S5. Contenido y bordes individuales

> siguen sin tener la información interior cada marcador, pero conservan su border correspondiente a cada uno.

Se mantiene la distinción por instrumento solicitada anteriormente:

> además de que los bordes, en el caso de SQC es lineal y en el caso de los fotometros es dashed

El pedido de ícono central y borde dotted común queda sustituido por la corrección literal de S2; la solicitud original permanece como antecedente en el historial.

> deben estar más juntos y quizá uno levemente superpuesto con el otro, el border debe ser de 1px o lo más fino posible

> de hehco los marcadores abiertos no se pareen a los demás

La captura Image#6 documenta la diferencia visual de los bordes desplegados respecto de los marcadores individuales.

### S6. Máximo de integrantes

> es dificil que existan casos de mas de tres, yo diríá imposible porque no van a colocar dos instrumentos iguales que miden lo mismo uno al lado del otro. De hecho ya el caso de dos items iguales en un mismo grupo es complejo que  sucedda. Dejemos el caso doneson máximo 3 solamente

### S7. Tolerancia

> ponle 5 metro

### S8. Verificación permitida

> bien, entonces aplica ese fix. No hagas verificaciones aparte de lint, typecheck y build. Las verififaciones visuales las haré yo

### S9. Tamaño del par y caso cercano de tres integrantes

> Necesito que los íconos sel grupo sean levemente más grandes para hacerlos más notorios.
> Además añade un caso de un grupo de 3 cerca de ese para analizarlo. Datos ficticios, no añadas mensajes de que los datos son ficfticios porque todos los son y eso lo sabemos, esto se cambiará luego.

> La idea es que el grupo de 2 sean más grandesl os íconos, pero el grupo de 3 no, porque ya abarrca más espacio

### S10. Total del encabezado

> en el header, los puntos de medicion deben ser la suma de fotometros + sqc, quita el texto de demostracion, sólo deja N puntos de medición y listo

## Tasks

- T1 | S8, S10 | Ruta: padre, ajuste pequeño de composición | Estado: done | Mostrar el total de instrumentos en el encabezado sin leyenda de demostración, actualizar documentación y ejecutar lint/typecheck/build | Evidencia: job-7; lint 0, typecheck 0, build 0. Commits: d71b0f4 (datos) y 816164d (mapa y encabezado).
- T2 | S8, S10 | Ruta: padre | Estado: done | Registrar resultados y cerrar seguimiento | Evidencia: job-7 y total único registrados. Commit de comportamiento: 816164d; evidencia y seguimiento incluidos en la entrega documental.

## Log

### L1. Solicitud original, literal

Necesito que añadamos un sistema que reconozca cercanía de puntos: [Image#3]

Ahí el punto de bortle 8 esta superpuesto a uno de bortle 4 de distinto fotometro. Quiero que antes de crear los marcadores se analice la data de modo de reconocer superposiciones con un área tolerable. En ese caso es excacta, pero puede variar levemente y ser considerado misma posición.

Cuando esto sucede, debe aparecer sólo un símbolo, este símbolo debe representar que hay más información en ese punto. Al abrir el panel lateral se mostraríá la info de ambos puntos en un área scrolleable.

Analiza el requerimiento y dime si es posible

### L2. Diseño solicitado

Texto literal conservado en S2. La imagen muestra siluetas parcialmente superpuestas que deben leerse como una unión, no contornos independientes interiores.

### L3. Responsabilidad DAL

Texto literal conservado en S3. La fuente compartida `app/_dal/points/getPoints.ts` también alimenta tabla y detalles; no cambiar su contrato ni añadir SQC de demostración a esas vistas. El DAL específico del mapa reúne los datos antes de agruparlos.

### L4. Filtrado y simbología

Textos literales conservados en S4 y S5. El usuario reservó la revisión visual para sí; no iniciar navegador, tests ni revisiones adicionales.

### L5. Límite y tolerancia

Textos literales conservados en S6 y S7. Sustituyen las propuestas anteriores de 50 y 3 metros: el valor acordado es 5 metros, máximo tres integrantes.

### L6. Autorización de implementación

> comienza

### L7. Estado inicial y propiedad

Antes de esta tarea ya existían modificaciones locales en MapSection.tsx, FilterPanel.tsx, MapCanvas.tsx, MapCanvas.module.css, MarkDrawer.tsx, MapFilterStore.ts, types/index.ts y el fixture SQC sin seguimiento, además de numerosos archivos de otras rutas. Conservar todo; no restaurar, limpiar ni hacer commits que incorporen esos cambios por accidente. La política del proyecto prohíbe crear ramas. No publicar ni crear PR.

### L8. Ruta y alcance

El runtime notificó el límite de contexto del padre; la implementación se delega como una sola unidad de comportamiento dependiente a `gentle-ai-worker`, no como escritores paralelos. El padre conserva seguimiento y cierre. Alcance: sección map del home y documentación de datos. No dependencias nuevas, infraestructura de caché externa ni cambios a otras rutas.

### L9. Decisiones de integración y supuestos explícitos

- Aplicar filtros únicamente a los integrantes de grupos geográficos ya calculados en servidor: dos o tres visibles conservan composición; uno recupera marcador individual; cero desaparecen. El contador sigue contando instrumentos. El panel excluye integrantes ocultos y se cierra si no queda ninguno.
- Tolerancia inclusiva de 5 m entre todos los integrantes; evitar agrupaciones transitivas que excedan ese diámetro. IDs y orden deterministas; conservar coordenadas de cada instrumento. No analizar distancias en el cliente.
- Primer clic en grupo: desplegar sus mismas figuras y abrir panel con todos los integrantes. Seleccionar una figura resalta y lleva a la vista su ficha. Una selección de grupo a la vez; cerrar por control del panel, Escape o clic en mapa. Conservar foco, navegación por teclado y movimiento reducido.
- Mantener las figuras individuales actuales: fotómetros con lado de 26 px, Bortle de 18 px y SQC circular con cámara. Los SVG cerrados de grupo no muestran Bortle/cámara; el contorno neutro dotted sigue solamente la silueta exterior. La expansión cambia posiciones de las mismas piezas, no crea nuevos marcadores geográficos.
- Un grupo de más de tres no tiene diseño autorizado. No truncar ni perder registros; si aparece ese caso en la fuente, informar antes de inventar una experiencia distinta. Validación defensiva sin ocultar instrumentos.
- Cachear la respuesta completa del DAL del mapa, incluidas agrupaciones y datos SQC de demostración, siguiendo la política existente de datos (stale 300 s, revalidate 604800 s, expire 2592000 s). No ampliar el webhook público ni tocar sus permisos. Los cambios de build y de argumentos de configuración invalidan la identidad de caché.
- No hay RED/GREEN: el usuario y AGENTS.md prohíben tests; solo lint, typecheck y build. No presentar esos checks como prueba visual o de interacción. La revisión visual queda expresamente delegada al usuario.

### L10. Entrega de T1 y comprobaciones

Worker `mwmabhan-4-xbz8`: S1–S7 implementados, S8 respetado. `pnpm lint`: exit 0 sin warnings; `pnpm typecheck`: exit 0; `pnpm build`: exit 0, 83/83 páginas generadas. Delta propio estimado de unas 800 líneas en 12 archivos. Sin tests, navegador, dependencias nuevas, ramas, commits ni publicación. La fuente actual no produjo grupos de más de tres. El DAL compartido permanece intacto.

La evaluación de autoridad tras la entrega indicó `medium`, `nativeRisk: unassessable` por archivos sin seguimiento, y `independentVerifier: false`: se mantiene la autoverificación del escritor, sin revisión nativa adicional por el límite de comprobaciones del usuario. No se inició ninguna revisión ni se alteró su configuración. Spot check del padre: `pnpm typecheck`, exit 0. La inspección visual y de interacción permanece a cargo del usuario.

### L11. Cierre local

T1 y T2 completadas dentro del alcance autorizado. Comprobaciones permitidas: lint, typecheck y build aprobados por el escritor, typecheck repetido por el padre con exit 0. No se ejecutaron tests ni navegador. La agrupación y su salida procesada se cachean en el DAL local; el contrato compartido de puntos y sus consumidores quedan intactos. No se consideran demostradas visualmente la silueta, expansión ni interacción: las revisa el usuario. `Risk: none` según la clasificación de cambios; la limitación visual se comunica por separado. Sin commits por propiedad mezclada de cambios previos; no hubo ramas, push, PR ni publicación.


### L12. Corrección visual autorizada

[Image#5]

Creo que debemos mejorar el marcador, el ícono de grupo no me gustó. Quítalo, respecto al borde quítalo también. La forma da a entender un mensaje errado, creo que mejor lo replanteamos, ambas formas no se fusionan, si no que aparecen más pequeñas pero cercanas, siguen sin tener la información interior cada marcador, pero conservan su border correspondiente a cada uno. Dime si entiendes

> procede con ese cambio

Reabrir únicamente la representación de S2 y S5 y su comprobación. La unión, el borde dotted común y el ícono de agrupación de L9–L11 quedan como antecedentes sustituidos. Estado cerrado: mismas figuras SVG reducidas y cercanas, sin superposición ni contenido interior, cada una con su borde por instrumento. Estado expandido conserva sus posiciones y tamaños habituales. Sin cambios a DAL, caché, filtrado, panel ni marcadores individuales. Ajuste pequeño preparado con lectura de su componente y documentación; los pasos de seguimiento y las ediciones puntuales se realizan en el padre.


### L13. Comprobaciones del ajuste de miniaturas

`job-6`: `pnpm lint` exit 0, `pnpm typecheck` exit 0 y `pnpm build` exit 0. Solo se modificaron para este ajuste GroupFigure.tsx y el README local del mapa, además del seguimiento. El grupo cerrado muestra sus mismas figuras al 60 %, con espacio entre ellas; cada una conserva color y borde individual dashed/solid, sin icono central ni borde común. Las figuras recuperan tamaño y contenido al expandirse. Se preservaron DAL, caché, coordenadas, filtros, panel y marcadores individuales. Sin tests, navegador, commits ni publicación. Revisión visual a cargo del usuario. Risk: none.


### L14. Proximidad, bordes y equivalencia visual

> deben estar más juntos y quizá uno levemente superpuesto con el otro, el border debe ser de 1px o lo más fino posible

> de hehco los marcadores abiertos no se pareen a los demás

[Image#6]

La captura muestra bordes gruesos en los marcadores desplegados frente a los individuales cercanos. El usuario mantiene la verificación visual; no abrir navegador. Acercar miniaturas con posibilidad de solapamiento leve, sin regresar a siluetas fusionadas, ícono central ni borde exterior común. El borde debe ser de 1 px o menor. Los desplegados deben reutilizar la presentación de los marcadores individuales, incluidas forma, tamaños, Bortle/cámara, colores y estados; no cambiar la apariencia individual para imitar la versión gruesa. La extracción de un componente de presentación compartido tiene reutilización concreta. Mantener las mismas figuras por instrumento al expandir, un Marker geográfico por grupo, hit target único cerrado y activación individual abierta. Sin cambios a datos, caché, membresía, filtros ni panel. Se delega la unidad de varios pasos por el límite de contexto ya notificado. Comprobaciones exclusivamente lint, typecheck y build; sin tests ni navegador.


### L15. Presentación unificada y checks

Worker `mwmbfhqr-5-uloz` completó S2/S5 y respetó S8. MapMarkButton.tsx extrae la presentación ya existente y la reutilizan MapCanvas.tsx y GroupFigure.tsx: mismo borde CSS de 1 px, geometría, tipografía, colores y estados. Las miniaturas se mantienen al 60 % y se acercan a posiciones ±9 px para dos; tres usan posición superior -8 px e inferiores ±9/7 px, permitiendo solapamiento leve. La escala reduce también el borde cerrado a menos de 1 px. Se eliminó la representación SVG separada que producía bordes expandidos de 3/5 px; la cámara conserva su ícono SVG. Mismos botones persistentes, sin Markers geográficos extra. No se modificaron DAL, panel, store ni hooks. README local actualizado.

Worker: `pnpm lint` exit 0 sin warnings; `pnpm typecheck` exit 0; `pnpm build` exit 0, 83/83 páginas. Padre: `pnpm typecheck` exit 0. ASSESS postwriter: medium/unassessable por archivos sin seguimiento; autoverificación vigente y sin verificador independiente ni review adicional, respetando el límite del usuario. Sin tests, navegador, dependencias, commits, ramas ni publicación. La equivalencia visual, solapamiento e interacción se reservan a revisión del usuario. Risk: none.


### L16. Tamaño según cantidad y fixture de tres

[Image#7]

Necesito que los íconos sel grupo sean levemente más grandes para hacerlos más notorios.
Además añade un caso de un grupo de 3 cerca de ese para analizarlo. Datos ficticios, no añadas mensajes de que los datos son ficfticios porque todos los son y eso lo sabemos, esto se cambiará luego.

La idea es que el grupo de 2 sean más grandesl os íconos, pero el grupo de 3 no, porque ya abarrca más espacio

Reabrir únicamente el tamaño compacto de grupos de dos y añadir el caso de tres. Los grupos de tres mantienen su escala compacta actual de 0.6; ambos conservan tamaños expandidos y presentación compartida. El nuevo grupo debe contener TESS-4C, TESS-W y SQC en un mismo lugar cercano al par Nómade existente, pero a más de 5 m para no mezclarlo con él. Se incorpora como fixture local antes del procesamiento cacheado, sin modificar el snapshot compartido, tabla, rutas de detalle ni instrumentos existentes. Sin banners, nombres ni leyendas nuevos de datos ficticios. Los registros sin detalle real no deben enlazar a rutas inexistentes: cualquier extensión debe preservar por defecto los enlaces actuales. Mantener contadores coherentes. Sin cambios a la tolerancia, límites, algoritmos de cercanía ni estilos individuales. Fuente y nueva composición participan en la identidad de caché existente. Solo lint, typecheck y build; sin tests ni navegador.


### L17. Escalas diferenciadas y fixture entregado

Worker `mwmbqogv-6-rfkp`: S2/S9 implementados y S8 respetado. Escala cerrada de pares 0.75; tríos conservan 0.6; expansión 1 con posiciones y estilos originales. Fixture server-only `group-preview.ts`: `map-preview-tess-4c`, `map-preview-tess-w` y `map-preview-sqc` en (-30.29, -70.39), al sureste del par existente y fuera de su tolerancia. Se incorpora antes de preparar/cachear datos; el algoritmo y sqc-demo.ts no cambian. Totales derivados: 39 fotómetros y 11 cámaras, 50 instrumentos. Sin nuevas leyendas de ficción; cámara nueva sin Bortle ni magnitud. Campo opcional local detailHref null omite enlaces a detalles inexistentes; undefined conserva por defecto los enlaces anteriores. Los avisos accesibles heredados de cámaras permanecen solo en registros con demoLocation.

Worker: lint exit 0 sin warnings, typecheck exit 0, build exit 0 (83/83 páginas). Padre: pnpm typecheck exit 0. ASSESS conserva autoverificación y no añade verificador independiente; sin review adicional por límite de comprobaciones del usuario. Sin tests, navegador, commits, ramas ni publicación. Revisión visual pendiente del usuario. Risk: none.


### L18. Encabezado con total único

[Image#8]

en el header, los puntos de medicion deben ser la suma de fotometros + sqc, quita el texto de demostracion, sólo deja N puntos de medición y listo

Usar el total de marcas ya preparadas (fotómetros y SQC), no la cantidad de grupos ni solo los fotómetros. Con la fuente actual: 39 + 11 = 50. Cambiar únicamente el subtítulo de MapSection y su documentación, sin alterar datos, filtros, caché o interacción. Ajuste puntual en el padre. Sin tests ni navegador; solo lint, typecheck y build.


### L19. Total único comprobado

MapSection.tsx usa `marks.length` y el subtítulo exacto «50 puntos de medición» con la fuente actual. Incluye fotómetros y cámaras SQC, sin leyenda de demostración ni conteo de grupos. README local actualizado. Sin cambios al DAL, datos, filtros o interacción. `job-7`: lint exit 0, typecheck exit 0 y build exit 0. Sin tests, navegador, commits ni publicación. Risk: none.


### L20. Commits autorizados de todos los cambios actuales

> muy bien. Commitea todos loscambios actuales por favor, sin verificaciones adicionales, ya comprobamos que todo pasa. Sólo creacommits

La autorización incluye expresamente todos los cambios locales, también los anteriores a esta tarea. No se ejecutaron verificaciones adicionales ni se publicó nada. Se crearon commits locales en main por unidad coherente:

- 2dd7c43: temporizadores de apertura/cierre del popover.
- 871686c: sidebar responsive e índices de página.
- 4524c2e: contenido de proyecto, equipo e imágenes compartidas.
- 2406a98: métodos de medición e ilustraciones.
- 571db73: estilo cartográfico, controles y créditos.
- d71b0f4: datos, fixtures y agrupación cacheada.
- 816164d: marcadores agrupados, interacción, panel y encabezado.

Este documento se incorpora en el último commit de seguimiento. Las menciones anteriores de ausencia de commits describen el estado histórico previo a esta autorización. Los checks válidos siguen siendo los ya registrados; no se repitieron lint, typecheck, build, tests, navegador ni revisión.
