# Rótulos y límites comunales del mapa
Cambios para reforzar la jerarquía cartográfica y mostrar los límites comunales sin ocultar elementos del mapa base por país.

## Specs

- S1: «entendo, entonces eso no lo hagamos. Sí hagamos lo de darle más protagonismo a las regiones y comunas. Algo que no me gusta en chile es que las regiones dicen "Coquimbo Region, maule region" en inglés, eso es un problema de localización del openfreemap o siempre viene así?»
- S2: «nunca usamos nombres en inglés, el sitio de hecho tiene es en el html. No utlilces nada de fallbacks ni nada ne ingles por favor»
- S3: «Otra duda, quiero que se vean los límites comunales como una línea fina dashed. Esa data existe? de manera de complementar el mapa?»

## Tasks

- T1 — S1, S2 — Rótulos en español y ajuste de jerarquía; worker; verificado — commit pendiente.
- T2 — S1, S3 — Preparar y mostrar límites comunales con procedencia verificable; worker; verificado — commit pendiente.

## Log

- L1: «entendo, entonces eso no lo hagamos. Sí hagamos lo de darle más protagonismo a las regiones y comunas. Algo que no me gusta en chile es que las regiones dicen "Coquimbo Region, maule region" en inglés, eso es un problema de localización del openfreemap o siempre viene así?»
- L2: «nunca usamos nombres en inglés, el sitio de hecho tiene es en el html. No utlilces nada de fallbacks ni nada ne ingles por favor»
- Evidencia T1: el estilo aplica solo `name:es` a las 12 capas de nombres y conserva `ref` en autopistas. Las teselas reales de OpenFreeMap contienen «Región de Coquimbo» y «Región del Maule» en `name:es`. La comprobación estructural y `git diff --check` pasaron.
- Evidencia T2: geoBoundaries CHL ADM3, revisión `9469f09`: 345 entidades, CC BY 3.0 IGO, BCN y OCHA ROLAC. SUBDERE DPA 2023 tiene descarga pública, pero no se confirmó una licencia explícita de redistribución.
- Verificación integrada: `git diff --check`, `pnpm lint`, `pnpm typecheck --incremental false`, `node scripts/build-chile-commune-boundaries.mjs <archivo.geojson> --check` (16 archivos) y `pnpm build` pasaron. No se verificaron en navegador el cruce de zoom 7, el cambio de región ni el orden visual de capas. La evaluación nativa no pudo fijar el alcance con los archivos nuevos sin declarar.
