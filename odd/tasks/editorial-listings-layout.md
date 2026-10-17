# Editorial listings and interior navigation
Implement the approved listing layout, compositional site aside, and centered breadcrumbs. Branch: `main` (repository instruction); delivery: local work-unit commits only, no push or PR.
Checks: focused ESLint, TypeScript, production build, and public HTTP/HTML checks. No test files or Playwright visual verification, per `AGENTS.md`.

## Specs

- S1 — "Comenzaremos con las páginas con la lista, actualmente hay unas cards demasiado grandes, quiero que se componga con otra layout, algo como una lista (similar al componente que existe para la sección nde noticias en la home)". Check compact, text-first news entries and horizontal article rows; retain current destinations and pagination behavior except the requested news page size.
- S2 — "Además esta sección tendrá un aside al lado derecho que se utilizará en varias vistas, este contendrá información resumida de otras secciones, por ejemplo: últimos artículos con una lista con solo los nonmbres truncados de las últimas 5 artículos (en el caso de la vista news) para la vist artículos mostraría news, de forma de poder navegar a otras secciones dem anera clara." Check up to five latest opposite-section titles, visual truncation without removing accessible text, correct links, and a full-section link.
- S3 — "Además añadiremos breadcrumbs a todas las rutas que no sean la home." and "para los breadcrumbs que se esten centrados sobre el sectionheader y que cada link use @app/_components/BrandStarIcon.tsx como separador entre los links." Check every existing interior route, real dynamic titles, decorative star separators, current-page semantics, centered placement above SectionHeading, and absence on home.
- S4 — "Para news haremos que la layout sean 3 columnas en desktop (acualmente son 2), reduciendo la importancia de la iágenn por sobre el texto, cada página contendrá 9 elementos (haciendo una ggrid de 3x3)." Check 9/9/9/4 news pagination for the existing 31 entries, responsive 1/2/3 columns, small optional images, and text prominence.
- S5 — "Noticias debe tener una descripción en el header y aggregar el separador entre le header y la grid". Check visible Spanish description and reuse of Separator between header and news grid.
- S6 — "Respecto al layout, sí, son 3 columnas centrales con max-w o container y el aside va fuera de ese espacio, el aside debe tener solo un border-l para marcar separación sutilmente con border-border y quizá algun poco de opacidad. Para mobiles este aside aparecerá debajo, ante del footer y después del contenido de la página". Check separate bounded main column and aside track, left-only subtle border, and DOM order after content/pagination and before the existing footer; stack when width is insufficient.
- S7 — "por qué editorial va en shared? y no en su respectiva page donde se utiliza? recuerda arquitectura colocated". Check page-local list components; only actually reused page/aside responsibilities belong to shared.
- S8 — "todo bien, respecto al aside, la idea es que contenga más info relevante del sitio, por ahora será los artículos, pero también puede mostrar otras cosas, por ejemplo 3 puntos aleatorios con su escala de bortle y un link para ver la tabla de datos y cada punto." Composition must permit additional blocks; random points remain a future block under the proposed initial scope, not implemented here.
- S9 — "DONT write tests."; "DONT create branches for new features, just commit to main."; "DONT do visual verification with playwright unless user tells you to do so." Preserve existing user edits in `AGENTS.md`, `app/_components/Separator.tsx`, and `next.config.ts`; do not stage unrelated changes.

## Tasks

- T1 [S3,S6,S7,S9] — Shared PageLayout/Breadcrumbs and all interior-route breadcrumb integration. Route: inline (foundation consumed by later tasks; no independent writer unit). Status: done. Commit: `63360ee`. Checks: focused ESLint (zero warnings), TypeScript, diff check, and ten public HTTP baseline comparisons passed.
- T2 [S1,S2,S4,S5,S6,S7,S8,S9] — Reusable compositional aside and compact 9-item news listing. Route: inline (depends on T1 layout). Status: in_progress. Commit: pending. Checks: pending.
- T3 [S1,S2,S6,S7,S8,S9] — Horizontal article rows and recent-news aside, preserving six-item pagination and external destinations. Route: inline (depends on T1/T2 shared surfaces). Status: pending. Commit: pending. Checks: pending.
- T4 [S1-S9] — Integrated functional/structural verification, candidate assessment when available, and final evidence. Route: inline unless a named high-risk item requires an independent verifier. Status: pending. Commit: pending. Checks: pending.

## Log

### L1 — Original request (verbatim)

Necesitamos mejorar la UI de la página de noticias y de artículos.
Comenzaremos con las páginas con la lista, actualmente hay unas cards demasiado grandes, quiero que se componga con otra layout, algo como una lista (similar al componente que existe para la sección nde noticias en la home)

Además esta sección tendrá un aside al lado derecho que se utilizará en varias vistas, este contendrá información resumida de otras secciones, por ejemplo: últimos artículos con una lista con solo los nonmbres truncados de las últimas 5 artículos (en el caso de la vista news) para la vist artículos mostraría news, de forma de poder navegar a otras secciones dem anera clara.

Además añadiremos breadcrumbs a todas las rutas que no sean la home.

Para news haremos que la layout sean 3 columnas en desktop (acualmente son 2), reduciendo la importancia de la iágenn por sobre el texto, cada página contendrá 9 elementos (haciendo una ggrid de 3x3).

Noticias debe tener una descripción en el header y aggregar el separador entre le header y la grid
Comienza el análisis

### L2 — Aside clarification (verbatim)

todo bien, respecto al aside, la idea es que contenga más info relevante del sitio, por ahora será los artículos, pero también puede mostrar otras cosas, por ejemplo 3 puntos aleatorios con su escala de bortle y un link para ver la tabla de datos y cada punto.

Respecto al layout, sí, son 3 columnas centrales con max-w o container y el aside va fuera de ese espacio, el aside debe tener solo un border-l para marcar separación sutilmente con border-border y quizá algun poco de opacidad. Para mobiles este aside aparecerá debajo, ante del footer y después del contenido de la página

### L3 — Architecture correction (verbatim)

por qué editorial va en shared? y no en su respectiva page donde se utiliza? recuerda arquitectura colocated

agrega esta regla en el agents.md primero

### L4 — Implementation authorization (verbatim)

para los breadcrumbs que se esten centrados sobre el sectionheader y que cada link use @app/_components/BrandStarIcon.tsx como separador entre los links.

Creoq que sólo eso tengo para añadir, comienza la implementación.

### L5 — Plan and baseline

The accepted proposal keeps article pagination at six and adds no point block yet. All owned exports are named except framework-required pages/layouts; conditional classes use cn(). Existing DAL order and usePagination remain unchanged. News summaries number 31; articles number 7 and require an independently sorted copy for latest-five selection. Home remains unchanged. PageLayout and aside are server components; existing URL pagination remains in its current Suspense boundary. This multi-turn feature needs durable specifications to retain the user's accumulated corrections. Tasks are sequential consumers of the shared foundation, so no independent parallel writer trigger holds.

Pre-existing modified files: AGENTS.md (the requested colocated rule), app/_components/Separator.tsx, next.config.ts. Initial native review mode command failed with exit 127 (`gentle-ai: command not found`). No development server was listening on 127.0.0.1:3000. No new tests will be written per repository policy; ordinary runtime and structural checks replace RED/GREEN, without claiming test-first evidence.

### L6 — T1 evidence

Committed the shared page foundation and all interior-route breadcrumbs as `63360ee`. Focused ESLint and TypeScript passed; three initial canonical-class warnings were fixed and strict ESLint then passed. All ten baseline HTTP routes returned 200 with identical existing heading text. Interior routes each contain one centered breadcrumb before h1, exactly one decorative star between entries, and one current-page entry; home contains none. The first HTTP assertion exited 1 because it compared tag-stripped baseline text with unstripped inline HTML; correcting that checker to normalize both sides yielded the passing comparison above. No application defect was inferred from that checker failure. Existing user changes were excluded from the commit. Risk: none; SectionPage retains its API through an optional breadcrumb prop and its existing children/heading content was checked on every consuming route shape.
