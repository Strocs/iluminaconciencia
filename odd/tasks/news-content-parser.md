# News content parser
Preserve safe source HTML and render its reading segments in a two-column layout with segment-scoped sticky media.
Worktree: main (repository policy). Delivery: local work unit only; no push/PR. Checks: in-memory public-interface probes, lint, typecheck; no test files or Playwright.

## Specs

- S1: "El parser debe extraer elementos lógicas sin iventar, o sea, no transformar un h1 en un h2 o en un p, si viene un elemento, es ese el elemento que parseamos, el parser sólo extrae segmentos lógicas y arma un arbol que nosotros usamos para renderizar contenidos."
- S2: "Quizá, previo a eso, hay una etapa de sanitización y de cleanup, quitamos algun salto de linea previo al inicio de la noticia (que tiene muy poca posibilidad de ser útil realmente) y quizá también al final."
- S3: "la idea es tampoco ser demasiado estrictos con el hecho de la limpieza, porque debemos permitir que el contenido pueda ser formateado en cuando saltos de línea etc, por el admin. Podemos hacer limpieza de, por ejemplo, saltos de linicia iniciales y finales, un trim completo."
- S4: "supongamos una estructura: texto 1 -> texto 2 -> imagen con su bajada -> texto 3 -> video -> texto4 -> texto 5 -> imagen."
- S5: "columna 1: texto 1 | texto 2 | texto 3 | texto 4 | texto 5 | fin" / "columna 2: img 1   | img 1   | video   | img 2   | img 2   | fin"
- S6: "Qué pasa cuando no hay texto en la noticia y es sólo imágen/es?" / "Qué pasas si la noticia es sólo texto?"
- S7: "Perfecto, ahora sí, puedes comenzar" (acceptance of the immediately preceding segment proposal).
- S8: "o quizá, cuando no hay assets en ese espacio, el ancho de la columna de la iquierda puede crecer un poco (algo como max-w-prose). y shrinkear el de la derecha, si existen contenido en ambas filas tienen igual ancho, hacer eso es sólo css y no condicionar el html. Cuando no hay contenido a la izquierd (texto) entonnces podemos aplicar la misma lógica hacemos crecer un poco la columna derecha."
- S9: "puedes continuar" (authorization to finish delivery and implement the segment-based layout described in the preceding answer).

## Tasks

- T1 [S1-S3] inline, done — Added safe node types, sanitization, and boundary-only cleanup. Risk: item 2 (HTML sanitization). Commit: 6588785 (parser). RED: renderer changed h1/b/i and internal spacing, exit 1. GREEN: exact tags, internal spacing, edge trim, preformatted whitespace, unsafe markup/URLs, exit 0.
- T2 [S4-S7] inline, done — Corrected inline-wrapped media association (S6/S7) without splitting mixed paragraphs. Risk: item 2 (consumes sanitized HTML). Commits: 6588785 (segments), d3b812a (renderer). RED: four span/strong cases exited 1. GREEN: four cases, two mixed guards, source hierarchy/SSR immutability and original mapping; correction ESLint/diff-check exited 0.
- T3 [S1-S7] delegated verification, done — Independent review and targeted correction recheck passed; parent spot-check passed 6/6 with unchanged trees after SSR. Parent project typecheck and scoped lint passed. Global lint and verifier copied-workspace typecheck timed out and remain uncompleted checks; neither was retried. At the initial verification checkpoint no commit had been created; T5 now records the isolated parser/renderer commits.
- T4 [environment] parent, done — User authorized inspection; both /tmp/news-parser-verify.Dfelha and /tmp/.pnpm-store/v11 were absent. Metadata-only check exited 0. Nothing deleted or modified; no cleanup remains.
- T5 [S1-S7,S9] inline, done — Recorded verified parser/renderer as isolated commits 6588785 and d3b812a. Risk: item 2. Native review unavailable: START rejected retained workspace untracked selection for the committed candidate, without mutation or lineage creation.
- T6 [S4-S9] inline, done — Added source-ordered segment rails, CSS occupancy sizing, and per-segment sticky-fit observation. GREEN: exact three-segment SSR, all source leaves/order in 31 snapshot articles, captions, source IDs, suppression and mixed occupancy; resize/cleanup/fallback probes exit 0. Commit: a70a70a497ed0eb2fa6a8eec821ba03d7a32575c. Browser appearance remains unverified.
- T7 [S1-S9] parent, blocked — Code/source-order checks, project TypeScript, scoped lint, live API and Next production build all passed. Layout commit: a70a70a. Await human disposition for closure without browser visual/geometry proof and with native review unavailable. No additional verification or native-route retries are planned; prior timeout commands remain recorded, not passes.

## Log


L1 — Original request: "De acuerdo, comencemos primero con el parser, ya conoces cómo viene los datos, debemos hacer ajustes. El parser debe extraer elementos lógicas sin iventar, o sea, no transformar un h1 en un h2 o en un p, si viene un elemento, es ese el elemento que parseamos, el parser sólo extrae segmentos lógicas y arma un arbol que nosotros usamos para renderizar contenidos. Quizá, previo a eso, hay una etapa de sanitización y de cleanup, quitamos algun salto de linea previo al inicio de la noticia (que tiene muy poca posibilidad de ser útil realmente) y quizá también al final.

Arma el plan para esta tarea"

L2 — User correction: "No leí nada respecto a cómo decidimos el stickyness de la imágen. Acá resulta justamente el punto del asunto y debemos tomar una decisión buena en UX/UI pero aa la vez no limitante para el contenido, mi propuesta es:

supongamos una estructura: texto 1 -> texto 2 -> imagen con su bajada -> texto 3 -> video -> texto4 -> texto 5 -> imagen.

La lógica sería, los textos quedan lineaamos: texto 1 -> texto 2 -> texto 3 -> texto 4 -> texto 5.

La regla para la imágen es:

columna 1: texto 1 | texto 2 | texto 3 | texto 4 | texto 5 | fin
columna 2: img 1   | img 1   | video   | img 2   | img 2   | fin

O sea, la imágen que aparece despuéß de un aparrao ya se muestra desde antes acompañando a la nonticia en ese momento, la imágen puede tener relacion con lo que está leyendo, si tiene relación con lo que viene después, entonces la imágen no acompañará a ese semento PERO será visible al comenzar ese segmento de lectura, por lo que la continuidad sería similar a una estructura purameente vertical.

Dime qué opinas"

L3 — Accepted proposal context: each media resource closes the preceding text run; consecutive resources remain together; leading resources are opening media; trailing text extends the last segment. Captions remain with figures; mixed text/media paragraphs remain intact. The parser records ownership, not pixel measurements. The renderer remains in original source order in this first parser delivery; two-column/sticky CSS follows separately.

L4 — Authorization: "Perfecto, ahora sí, puedes comenzar".

L5 — Route: one dependent behavior unit, implemented inline; no parallel writer trigger. Independent verifier required for sanitizer security (item 2). Existing unrelated dirty files remain untouched. No new dependencies, API migration, or test files. The global gentle-ai CLI is unavailable (`command not found`), so the bare CLI could not read native review mode; do not change the review switch. Later facade ASSESS reported RDD on, but could not assess the ambient dirty tree because untracked scope was undeclared.

L6 — RED evidence: rendered `<h1>Título</h1><p>Uno <b>dos</b> <i>tres</i></p><p><br></p><p>Cuatro</p>` became an invented section with h2/strong/em and no internal empty paragraph. Public-interface probe exited 1.

L7 — Functional evidence: all 31 snapshot articles parsed/rendered; live API returned HTTP 200 and all 31 articles parsed/rendered (47 segments, 45 media blocks). In-memory probes cover exact tags, internal and boundary whitespace, mixed paragraphs, ancestor preservation, captions, the user's three-segment example, consecutive/opening/trailing/text-only/media-only/empty cases, unsafe tags/attributes/URLs, and permitted embeds. No test files were created.

L8 — Differential check: seven existing rendering behaviors compared against base 34575a917f08113f67c7dcdf4a02b68124fa40ab in a disposable scratch copy. Initially found iframe/video width-height differences (exit 1); corrected renderer sizing while retaining source dimensions in the tree; differential and focused probes then exited 0.

L9 — Checks: `pnpm run typecheck` exited 0; scoped ESLint on all changed news code exited 0; `git diff --check` exited 0. Repository-wide `pnpm run lint` exceeded its 30-second bound and is a failed/uncompleted check; it was not retried or moved to background. Native ASSESS returned nativeRisk unassessable due to undeclared ambient untracked scope; explicit security escalation (item 2) requires one independent verifier. No native authority was started.

L10 — Independent verifier: S1-S5 passed within parser scope; S6/S7 blocked because `<p><span><img src="/a"></span></p>` and the strong equivalent were classified as narrative rather than media. Parent reproduced all four cases (with/without preceding text), exit 1. No sanitizer bypass found; ten baseline rendering comparisons passed. Only this blocker receives a correction and targeted recheck.

L11 — Verification incident: verifier's `pnpm run typecheck` in its copied workspace initiated registry installation and timed out after 30 seconds, without a typecheck result. Verifier reports unexpected `/tmp/.pnpm-store/v11` and retained `/tmp/news-parser-verify.Dfelha`; neither path has been inspected or removed by the parent. Parent diagnosed command resolution (`pnpm` resolves globally; project compiler exists at `node_modules/.bin/tsc`) and observed no package.json/lockfile changes in the project. Exact external-store cause/ownership remains unproven; external inspection/deletion requires explicit user authorization. Parent's earlier project typecheck already passed. Do not retry either timed-out command or substitute an installation.

L12 — User continuation: "Review the delivered subagent output and continue."

L13 — Single correction batch: remove the tag-specific gate for pure-media wrappers. Classification now depends on actual descendants, while preserving the wrapper tags in the tree. Parent's targeted public-interface checks passed (four repros, two mixed-paragraph guards, unchanged source/SSR and original mapping); correction ESLint and diff-check exited 0. No parser/sanitizer policy expansion or environment installation was made.

L14 — Targeted independent recheck PASS: four wrapped-media cases and two mixed-paragraph guards, exit 0, stderr empty; exact SSR, references, source order and tree immutability preserved. Verifier ran no package manager or external cleanup. Parent spot-check repeated those six cases in memory, exit 0. Source/parser work is functionally verified; no tests or browser artifacts were added. No native review authority or commits were created. At that point, the remaining environment decision was permission to inspect/dispose of the external verifier scratch/store; repository-wide lint remained explicitly uncompleted, not a claimed pass.

L15 — User authorized inspection: "si, te aautorizo". Metadata-only inspection found both exact external paths absent (exit 0); nothing was deleted or modified. The environment blocker is resolved, and the visible task list is reconciled with verified parser work. No functional parser tasks remain. Native review and commits have not been executed; the global lint timeout and isolated verifier typecheck timeout are still recorded as uncompleted checks. The current renderer uses content.nodes and md:columns-2; segment-based columns/sticky remain a separate, unimplemented presentation step.

L16 — User continuation: "puedes continuar". Resumed the feature document/mirror and authorized both delivery closure and the previously described segment layout. Work units: parser 258 added lines; renderer 239 authored lines; forthcoming layout forecast roughly 350–400 lines. Sequential dependency means inline implementation, not parallel writers. No push/PR or unrelated changes. No running Next dev server or agent-browser was found; do not install tooling or perform prohibited Playwright visual verification. Browser-level visual proof is unavailable in this environment.

L17 — Parser commit 6588785c1c704313b8ea210257960d7f8896f37f and renderer commit d3b812a866795cbf21a68431b78d5145752fabba contain only this feature. Native ASSESS could not resolve ambient untracked scope. INSPECT excluded unrelated untracked paths; committed-only START then refused with `native-start-retained-selection-candidate-mismatch`, `mutation_performed:false`. No lineage or consent authority was created. Do not retry the same unavailable route or review unrelated workspace changes. Native review remains unavailable; functional independent verification already passed.

L18 — Layout RED: NewsContent rendered zero data-news-segment containers and retained md:columns-2 for the accepted example, exit 1. GREEN after implementation: three segment grids; DOM retains before/media/after order (including trailing text), all source leaves remain ordered across 31 snapshots, captions retained, canonical tree unchanged, source ancestor IDs emitted once. CSS controls rail widths; a tiny callback-ref observer only determines whether the media group fits vertically. Oversized groups stay in normal flow; no clipping, autoplay, internal scroll or forced segment height. Source ancestor wrappers may be projected into multiple layout fragments, with their IDs retained only on the first occurrence; original parser tree remains untouched. In-memory fit/resize/unmount/unsupported-observer checks passed, exit 0. No browser geometry/visual assertion is claimed.

L19 — Final code evidence: direct project tsc --noEmit --incremental false exited 0; scoped ESLint and git diff --check exited 0. Next.js production build compiled and prerendered all 81 pages successfully (exit 0), including news routes. Live API returned HTTP 200; all 31 articles rendered into 48 source-ordered reading segments, preserving meaningful content/media order and canonical trees (exit 0). Prior timeout commands were not retried. No browser visual/geometry assertion is claimed; no browser tooling was installed.

L20 — Layout commit a70a70a497ed0eb2fa6a8eec821ba03d7a32575c contains 216 additions/4 deletions, isolated from unrelated work. Candidate-scoped ASSESS against d3b812a returned medium with nativeRisk unassessable (ambient untracked declaration unavailable), nativeReviewOutcome unavailable; writer self-verification stands and independentVerifier is false for this layout unit. No native authority was created or retried. Source implementation is complete and locally committed; closure waits only for human disposition of the explicitly missing native/visual proof. No push or pull request was performed.
