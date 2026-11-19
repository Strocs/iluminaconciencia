# Mapa ampliado en /explorar
Objetivo: reutilizar el mapa del home en una ruta dedicada con transición de ampliación. Rama: `main`, conforme a la política del repositorio; sin publicación.
Entrega: un commit local en main por solicitud explícita, sin PR ni publicación; incluye los ajustes anteriores del mapa. Comprobaciones: `pnpm lint`, `pnpm typecheck`, `pnpm build`; sin tests ni navegador según las reglas del proyecto.

## Specs

- S1: «Bien, quiero añ ádir un botón de pantalla completa para el mapa. Arriba del zoom in out. Esta pantalla completa debe mostrar el mapa en grande en una ruta /explorar».
- S2: «Presionar el botón debe transicionar el contenido hacia esta ruta, esta ruta tendrá header solamente (el navbar) el resto será el mapa a pantalla completa con el filtro flotante a un costado y desde el otro se abre el panel de información. No tendrá footer.»
- S3: «o puede reiniciarse el contexto, pero me refiero a generar una transición, no sé si con view transition o algo así. de modo de que abrir en pantall completa no se sienta como un cambio de ruta si no que se sienta como que de verdad se amplía».
- S4: «al verlo en pantalla completa, ya no necesitamos el mod de ctrl para zoom in out, podemos hacer zoom normal, ua que no necesitamos scrollear».
- S5: «no perdón, sin barra institucional, solo navbar».
- S6: «Qué pasó con la alineacion de los botones? el de pantalla completa se posiciono separado de los de zoom? edberian alinearse mediante un padre contenedor que los organice verticalmente».
- S7: «La pantalla completa visualmente funcioan bien, sólo quiero que el botón de créditos (marca blanca) se mueva hacia donde apunte con la flecha, porque o si no queda oculto.»
- S8: «Lo otro es que el panel lateral de info no aparezca asomado.»
- S9: «Un Bug visual aparece cuando presionamos un botón, el mapa pareciera moverse. No debe moverse, debe quedar quieto. El panel aparece como un overlay, no tiene nada que mover.»

- S10: «Ahora el link explorar del navbar y del footer deberíá llevar a esta ruta».
- S11: «el botón del hero igual deberíá conducir a la ruta, en la atercera scene».

## Tasks

- T1 | S1, S2, S5 | Ruta: implementación local | Estado: completado | Compartir el módulo funcional y separar la composición institucional de la estructura raíz. Commit: `:/^feat[(]map[)]: add fullscreen explorer route$`. Risk: item 3, estructura compartida de páginas existentes.
- T2 | S1–S11 | Ruta: implementación local y corrección delegada | Estado: completado | Crear /explorar, adaptar paneles y gestos e incorporar navegación con ampliación visual. Commit: `:/^feat[(]map[)]: add fullscreen explorer route$`.
- T3 | S1–S11 | Ruta: comprobaciones locales y gentle-ai-verify independiente | Estado: completado | Lint, tipos, build y revisión estructural aprobados; confirmación manual recibida del usuario. Commit: `:/^feat[(]map[)]: add fullscreen explorer route$`.

## Log

- L1 — Solicitud original, literal:

> Bien, quiero añ ádir un botón de pantalla completa para el mapa. Arriba del zoom in out. Esta pantalla completa debe mostrar el mapa en grande en una ruta /explorar
>
> Presionar el botón debe transicionar el contenido hacia esta ruta, esta ruta tendrá header solamente (el navbar) el resto será el mapa a pantalla completa con el filtro flotante a un costado y desde el otro se abre el panel de información. No tendrá footer.
>
> Antes de implemetnar analiza la dificultad, reutilizar componentes. Arquitectura, etc.

- L2 — Aclaración literal: «o puede reiniciarse el contexto, pero me refiero a generar una transición, no sé si con view transition o algo así. de modo de que abrir en pantall completa no se sienta como un cambio de ruta si no que se sienta como que de verdad se amplía».
- L3 — Aclaración literal: «al verlo en pantalla completa, ya no necesitamos el mod de ctrl para zoom in out, podemos hacer zoom normal, ua que no necesitamos scrollear».
- L4 — Decisión final literal: «no perdón, sin barra institucional, solo navbar». Sustituye la selección previa de conservar la barra institucional.
- L5 — Autorización literal: «bien, t oddo claro. Puedes comenar por favor».
- L6 — Análisis confirmado: módulo funcional compartido en app/_features/map; un único layout raíz; composición institucional solo para rutas normales; ViewTransition documentado por Next.js 16.3.8 sin configuración adicional. No se requiere persistir filtros, selección ni cámara. Sin dependencias nuevas.
- L7 — Estado inicial: HEAD eb70348; tres archivos del mapa contienen cambios anteriores de esta misma sesión. Conservar esos cambios y excluirlos de la unidad de commit de esta función. No usar stash ni restauraciones globales. El repositorio prohíbe nuevas ramas, tests y verificación visual con Playwright sin solicitud explícita.
- L8 — Comprobación visual de la transición y de gestos no ejecutada: las reglas actuales no autorizan navegador. La compilación y la revisión estructural no sustituyen esa evidencia.
- L9 — Primera comprobación `pnpm lint && pnpm typecheck && git diff --check`: timeout de 30 segundos durante lint; los pasos siguientes no se ejecutaron. Se solicitó autorización y la respuesta explícita fue «Sí, repetir lint en segundo plano». Repetición autorizada en job-4: lint, typecheck y diff-check completados con código 0 en 36 segundos. T1 comprobada; comienza T2.
- L10 — T2 implementada. Formato normalizado; job-5 ejecutó lint, typecheck, build y diff-check con código 0. /explorar incluida en el build. Se preservan vista plana, norte fijo, tamaño de zoom y prioridad de marcadores anteriores. Falta comprobación visual de la ampliación y de las superposiciones.
- L11 — ASSESS: riesgo high por escalación explícita de item 3 (layouts compartidos), nativeRisk medium, reviewDue false, motivo under_budget. Requiere un verificador independiente; no corresponde iniciar revisión nativa. Se inicia T3.
- L12 — Verificador mwmtiwoo-3-8ndv: partial. HTML confirma shell requerido en /explorar y conservación de home y /proyecto; detecta regresión en el 404 raíz, sin navbar ni pies. Se reabre T1 para una corrección acotada de app/not-found.tsx. Aviso visual no corroborado: posible franja de 12 px del panel cerrado; no se declara validada la geometría sin navegador.
- L13 — Decisión explícita de verificación: «Prefiero comprobarlo manualmente». No usar Playwright ni abrir navegador. La validación visual de ampliación, paneles, zoom y geometría queda a cargo del usuario antes de cerrar la función y realizar el commit.
- L14 — Informe literal con captura: «Qué pasó con la alineacion de los botones? el de pantalla completa se posiciono separado de los de zoom? edberian alinearse mediante un padre contenedor que los organice verticalmente». Se confirma en código que el enlace está posicionado de forma absoluta fuera del control nativo; se reabre T2 para compartir un único contenedor vertical.
- L15 — Worker mwmtnf3v-4-wek0 añadió app/not-found.tsx; typecheck y diff-check pasaron. Falta reconstruir y revalidar únicamente el bloqueo del 404.
- L16 — Revisión manual con captura, literal:

> La pantalla completa visualmente funcioan bien, sólo quiero que el botón de créditos (marca blanca) se mueva hacia donde apunte con la flecha, porque o si no queda oculto.
>
> Lo otro es que el panel lateral de info no aparezca asomado.
>
> Un Bug visual aparece cuando presionamos un botón, el mapa pareciera moverse. No debe moverse, debe quedar quieto. El panel aparece como un overlay, no tiene nada que mover.

- L17 — Se acepta la confirmación manual de la ampliación (S3), no una validación global de paneles y gestos. T2 incorpora créditos fuera del filtro, ocultación completa del panel y ausencia de movimiento del mapa al abrirlo; la corrección de alineación sigue en su worker sin ampliar superficies concurrentes.
- L18 — Worker mwmts492-5-7jjo completó S1/S6 con subclase mínima de NavigationControl, host del enlace y portal en un único grupo nativo. Prettier, eslint enfocado, typecheck y diff-check pasaron. ASSESS posterior: high por item 3, nativeRisk medium, reviewDue false (under_budget). Comienza worker mwmtxcjw-6-a7wg para S7-S9, sin superficies concurrentes.
- L19 — Worker mwmtxcjw-6-a7wg completó S7-S9: créditos a 280 px en escritorio ampliado, recorte del panel cerrado y desplazamiento vertical limitado al listado interno; sin scrollIntoView sobre ancestros. Eslint enfocado, typecheck y diff-check pasaron. Falta lint/build globales, revalidar el 404 corregido y confirmación manual de los nuevos ajustes. ASSESS sigue high por item 3, reviewDue false (under_budget).
- L20 — Job-6: `pnpm lint && pnpm typecheck && pnpm build && git diff --check` completado con código 0 en 45 segundos, incluyendo controles compartidos, S7-S9 y 404. Revalidación independiente limitada al bloqueo original del 404 y a S6-S9 en curso; no se repite la revisión completa.
- L21 — Revalidación mwmu3vww-7-a5jz: 404 y /explorar correctos en HTML generado; S6-S9 cumplidas estructuralmente y sin bloqueos corroborados. CSS generado confirma atribución de 280 px y overflow-clip. Parent spot-check de diff-check completado con código 0. T3 espera exclusivamente la comprobación manual elegida por el usuario: alineación, créditos visibles, panel cerrado sin franja y apertura sin movimiento. Sin commit ni publicación mientras esa evidencia esté pendiente. Antes de commit también se debe confirmar el alcance de los cambios anteriores conservados y revisar el tamaño real de la unidad.
- L22 — Solicitud literal: «Ahora el link explorar del navbar y del footer deberíá llevar a esta ruta». Se reabre T2 para actualizar la entrada compartida de navegación a /explorar sin semántica de ancla; Contacto conserva su comportamiento. La consulta posterior sobre ViewTransition de filtros es solo explicativa, no autoriza cambiarlo.
- L23 — Solicitud literal: «el botón del hero igual deberíá conducir a la ruta, en la atercera scene». La tercera entrada territorial-decisions debe usar /explorar y dejar de activar el scroll por cta.section; no modificar las otras escenas ni el componente compartido.
- L24 — S10/S11 implementadas mediante dos entradas de datos: navigationItems.Explorar y heroScenes.territorial-decisions.cta apuntan a /explorar sin section. Navbar de escritorio y móvil y footer comparten la primera entrada; las otras escenas y Contacto no cambian. Job-7: lint, typecheck, build y diff-check con código 0 en 45 segundos. Lectura del diff confirma ambas rutas. ASSESS sin revisión debida (under_budget); revisión independiente del cambio estructural ya realizada, sin nueva ronda por estos destinos solicitados. T3 continúa esperando la confirmación manual de ajustes visuales anteriores; sin commit ni publicación.
- L25 — Confirmación y autorización literal: «Todo ok, por favor commitea los cambios, no mas verificaciones». Se acepta la comprobación manual y se cierra T3. El commit incluye todos los cambios de esta sesión, incluidos los ajustes anteriores del mapa; esta autorización sustituye la exclusión preventiva registrada en L7. No repetir lint, tipos, build, navegador ni verificaciones funcionales. Sin push.
