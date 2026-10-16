# News and article pages
Objective: complete the approved DAL, news details, independent paginated listings and home integration.
Branch: main (repository policy). Delivery: local commit per step, no push/PR. Forecast: ~700 authored lines across six small implementation units, generated snapshots excluded. Checks: source/DAL probes, typecheck, lint, build and HTTP checks; no tests or Playwright.

## Specs

- S1 — "Necesito que entres a https://iluminaconciencia.userena.digital/news_list y extraigas información de todas las noticias y también los artículos en el home de la página, esto serán datos mocks y deben vivir dentro de dal mediante un getNews y getArticles siguiendo el mismo patrón actual."
- S2 — "vamos a necesitar algo como getNewBySlug (o id) para poder generar las páginas dinámicamente." Approved plan uses `getNewsBySlug` for `/noticias/[slug]`; IDs remain stable entity identifiers.
- S3 — "Ahora no existirán los datos en news/data/ si no que vivirán en el dal."
- S4 — "No estoy de acuerdo con compartir presentación y paginación, sí estoy de acuerdo con extraer un custom hook que sirva para implementar paginación que sea reutilizable."
- S5 — "Ojalá no compartir componentes a menos que tenga mucho sentido y no sea solo una abstracción únicamente utilizable por ambos componentes, prefiero que si en el futuro nos encontramos con esa necesaidad, ahí hagamos la abstracción."
- S6 — "Para resolver paginación por URL propongo utilizar la librería nuqs, que la encuentro madura y bastante interesante para el requerimiento. Además propongo que el param sea pagina y ni page dado que el sitio es principalmente español. (a menos que me convenzas de lo contrario)"
- S7 — "Ver publicación es correcto porque abriría el pdf en una uneva página. No usar el attr download." Articles link directly to the original resource; no article detail route.
- S8 — "no hagas componentes de presnetación, haz la composición y presnetación en la misma page.tsx, no es necesario extraer algo de ese modo." News detail composition stays in its page; client boundaries required by pagination are not presentation-only extractions.
- S9 — "no utilices caché de react ya que, cuando tengamos el panorama completo, usaremos cache de next con revalidaciones configuradas." / "Si utilizamos cachecomponents by default."
- S10 — "no es relevante no lo dejes co nel código" Do not recreate the removed DAL source Markdown guide.
- S11 — "Suiero que lo armes y cada paso termina con sus commits correpsondientes"
- S12 — "bien comienza con la implementación"
- S13 — "lo autorizo" Authorization for the proposed minimal generateStaticParams adjustment to `/medicion/[punto-id]`, using getPoints without changing global config.

## Tasks

- T1 [S1] — Extract the 31 news and seven publications. Route: completed extraction unit. Status: done. Commits: d1a2feb, e480269.
- T2 [S10, S11] — Commit the pending source-guide removal and full implementation tracking. Route: inline cleanup. Status: done. Commit: 65bc48ffb26a943acaccc5621c58344578aa362c (`chore(dal): remove extraction source guide`).
- T3 [S1-S3, S9, S11] — Add server-only DAL types and getNews summaries, getNewsBySlug details, getArticles. Route: worker, measured runtime context backstop. Status: done. Commit: ba0c7448a71897994a448b959542beceb65af3c4 (`feat(dal): add news and article queries`).
- T4a [S9, S11, S13] — Add known point params to the existing measurement route for Cache Components compatibility. Route: inline minimal authorized fix. Status: done. Commit: 536cd43121e66205bd0c8254df6e77faef99c1fa (`fix(measurement): prerender known point routes`).
- T4 [S2, S8-S9, S11] — Implement /noticias/[slug] with direct DAL lookup, 404, static params, inline presentation and available content/media. Route: worker, context backstop. Status: done. Commit: 443f9327df6b7755e2eba71012e0497cbba7048b (`feat(news): add news detail pages`).
- T5 [S4, S6, S9, S11] — Install nuqs, add the App Router adapter and a small reusable URL pagination hook. Route: worker plus parent-managed dependency installation; independent verification for dependency risk item 5 passed. Status: done. Commit: 2628883dd0dd7846bb8239a848857bade2b8fbbd (`feat(pagination): add nuqs-backed pagination`).
- T6 [S1, S4-S6, S11] — Replace the news placeholder with its own paginated listing, controls and internal news links. Route: worker, context backstop. Status: in_progress. Commit: pending (`feat(news): add paginated news listing`).
- T7 [S1, S4-S7, S11] — Replace the article placeholder with its own paginated listing, controls and external Ver publicación links. Route: worker, context backstop. Status: pending. Commit: pending (`feat(articles): add paginated publication listing`).
- T8 [S1, S3-S5, S7-S11] — Load the home from DAL, remove old content mocks, preserve the existing home composition and complete integrated verification. Route: worker, context backstop. Status: pending. Commit: pending (`feat(home): load news and articles from dal`).

## Log

### L1 — Original request

Vamos a trabajar en las páginas de noticias y artículos, básicamente funcionan igual, muestran la lista completa de noticias páginadas con la ruta del slug de la noticia. Aún no tenemos claro cómo se renderizará la noticia, si viene como markdown o html, así que por el momento lo trabajaremos directamente en un layout por props.

Necesito que entres a https://iluminaconciencia.userena.digital/news_list y extraigas información de todas las noticias y también los artículos en el home de la página, esto serán datos mocks y deben vivir dentro de dal mediante un getNews y getArticles siguiendo el mismo patrón actual.

Comienza con el análisis de los req

### L2 — Final composition and cache correction

Ok, entendí el tema, no hagas componentes de presnetación, haz la composición y presnetación en la misma page.tsx, no es necesario extraer algo de ese modo. Generalmente no me gusta hacer esa separación de responsabilidades si el componente no es demasiado complejo y no tiene muchas líneas de códiggo. En este caso, el componente es bastante sencillo, no lo requiere y no aporta nada más que sobresplits.

no utilices caché de react ya que, cuando tengamos el panorama completo, usaremos cache de next con revalidaciones configuradas.

Si utilizamos cachecomponents by default.

### L3 — Plan and execution authorization

bien, noté que no haz definido el plan completo de implementación. Suiero que lo armes y cada paso termina con sus commits correpsondientes

bien comienza con la implementación

### L4 — Implementation constraints and baseline

- All steps are authorized, in the approved order, ending in individual commits on main. No publishing is authorized. Commit only this feature's paths.
- Preserve the pre-existing human changes in `app/_components/Separator.tsx` and `next.config.ts`; the working config already enables Cache Components.
- No tests or Playwright, per AGENTS.md. Use runnable data/function probes and HTTP/structural checks; do not add tests or a test harness. No meaningful RED suite is added under this repository constraint.
- Read the installed Next docs before implementing each relevant API and nuqs docs before its hook; no React cache and no speculative cache lifetimes/tags.
- Use named owned exports, existing tokens and `cn` for conditional classes. Do not build generic cards, an HTML parser, or a new design system.
- Query summaries must not expose archival HTML/full bodies to client listings. Unknown slug returns undefined; source-local dates must not acquire an invented timezone.
- Proposed default page size is six and configurable per listing. Reuse nuqs parsing/default/URL/history mechanics; derive only data-dependent page limits and slicing.
- Extraction records and evidence are in `odd/tasks/news-articles-extraction.md`. Raw archival HTML must never be injected into the page.

### L5 — T3 completed

- `getNews`, `getNewsBySlug` and `getArticles` passed the exported-function probe (31/7 records, unknown slug undefined, no body/sourceHtml in summaries, both video-only details preserved), typecheck, focused ESLint and formatting checks.
- Parent corrected nullable link/embed labels to match source data and removed a duplicate image interface; post-correction typecheck/lint passed. No tests added under repository policy.
- Commit: `ba0c7448a71897994a448b959542beceb65af3c4`. Native committed-range ASSESS: medium, reviewDue false (`under_budget`); writer verification stands, no independent verifier required. Risk: none.

### L6 — T4 build blocker

- The detail page passed type generation, typecheck, focused ESLint and Prettier. Parent typecheck also passed. Presentation and querying remain in the page; no archival HTML rendering or React cache was added.
- `pnpm build` (job-1) exited 1 after 31 seconds. Compilation and TypeScript passed, but prerendering failed at the unchanged existing `/medicion/[punto-id]` route with Cache Components enabled: runtime params outside Suspense and header usePathname outside Suspense for that dynamic route.
- Readback confirmed the measurement page has no generateStaticParams and reads params directly; it is outside the feature's authorized edit surfaces. The existing human next.config.ts change enables Cache Components and must not be overwritten.
- No build retry or unrelated fix was performed. News HTTP checks and T4 commit remain pending. Needs human decision: authorize the minimal measurement-route compatibility change (recommended: enumerate known point params), or explicitly defer the global build blocker and permit scoped feature verification. Remaining implementation steps are pending behind T4.

### L7 — Measurement compatibility authorization

lo autorizo

- Authorization resolves the external T4 blocker. Add known measurement IDs through generateStaticParams, keep global configuration/header unchanged, then rebuild and verify both measurement and news routes. This additive route export has no meaningful test-first suite under the repository's no-tests policy.

### L8 — Build and route verification passed

- Build/probe job-2 exited 0. Production HTTP verified all 31 news detail routes and all 37 measurement routes with expected titles/names, both video-only news embeds, and 404 responses for unknown news/point IDs. The temporary server was terminated. No visual/browser verification was performed.
- T4a committed as `536cd43121e66205bd0c8254df6e77faef99c1fa`. Exact committed-range native ASSESS: medium, reviewDue false (under_budget). Risk: none; additive params enumeration, existing measurement rendering preserved.
- T4 typegen, types, focused ESLint, Prettier, production build and HTTP checks are passed; its source is staged for its own commit. No HTML renderer, presentation component or React cache was added.
- T4 committed as `443f9327df6b7755e2eba71012e0497cbba7048b`. Exact-range native ASSESS: medium; reviewDue false (under_budget). Risk: none. Moving to the approved dependency/hook unit T5.

### L9 — T5 verification in progress

- Installed nuqs 2.10.2 successfully (job-3 exit 0); kept exact version specifiers in package.json and lockfile, matching existing runtime dependency convention.
- The hook uses nuqs parseAsIndex/default/history APIs; only bounds and slice indexes are derived locally. The site adapter wraps children and leaves the existing Header in place. Worker typecheck/lint/format and corrected inline SSR probe passed; parent typecheck also passed.
- Native ASSESS with escalation item 5 returned high verification plan (native medium), reviewDue false (under_budget), requiring one independent verifier for the dependency unit. The independent verifier returned PASS for S4/S6/S9, dependency/lock compatibility and all six SSR hook cases; no native review lineage was started.
- Production build with the adapter passed (job-4 exit 0). Independent verification also passed pnpm list, focused ESLint/Prettier, staged whitespace checks and default/page2/invalid/negative/out-of-range/empty SSR cases, preserving other query keys. Ready for the T5 commit. Risk: item 5 (new dependency and lockfile).
- Verifier protocol deviation: its external scratch copy had unusable package links and pnpm exec unexpectedly downloaded packages despite the no-network constraint; an initial unsupported cp option also failed. Parent confirmed the main workspace/staged paths were unchanged by verification. No additional checks or source edits were needed; scratch cleanup remains with its owning runtime.
- T5 committed as `2628883dd0dd7846bb8239a848857bade2b8fbbd`. Exact-range ASSESS retained native medium/reviewDue false; item-5 independent verification requirement was already fulfilled. No native lineage or approval is claimed.

### L10 — T6 scoped rendering correction

- Initial news-list worker checks and parent typecheck passed. Production build in job-5 passed, but its HTTP probe exited 1: `/noticias` returned 200 with no rendered news-heading links (expected six). The pure client URL hook under a static Suspense boundary leaves only the loading fallback in server HTML.
- This is an in-scope rendering/verification gap, not an unrelated build blocker. One focused correction is delegated: make the listing's request-dependent subtree server-render with the query context, while leaving URL parsing/history/state entirely with nuqs. No manual URL state or presentation-only files are authorized. Recheck the failed HTTP cases after the correction.
- Correction: an in-file request boundary awaits the page searchParams promise inside Suspense, then renders the existing client list. Nuqs still owns parsing/history/state; no presentation-only file or extra provider was introduced.
- Corrected build/probe job-6 exited 0: default six items, page2 six, final page6 one, oversize clamped to final, zero/negative/invalid values first page, no archival-body fields in client payload. HTTP checks inspected rendered heading links, not serialized full-list props. Ready for the T6 commit. Risk: none.
