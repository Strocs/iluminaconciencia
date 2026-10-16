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

## Tasks

- T1 [S1] — Extract the 31 news and seven publications. Route: completed extraction unit. Status: done. Commits: d1a2feb, e480269.
- T2 [S10, S11] — Commit the pending source-guide removal and full implementation tracking. Route: inline cleanup. Status: done. Commit: 65bc48ffb26a943acaccc5621c58344578aa362c (`chore(dal): remove extraction source guide`).
- T3 [S1-S3, S9, S11] — Add server-only DAL types and getNews summaries, getNewsBySlug details, getArticles. Route: worker, measured runtime context backstop. Status: in_progress. Commit: pending (`feat(dal): add news and article queries`).
- T4 [S2, S8-S9, S11] — Implement /noticias/[slug] with direct DAL lookup, 404, static params, inline presentation and available content/media. Route: worker, context backstop. Status: pending. Commit: pending (`feat(news): add news detail pages`).
- T5 [S4, S6, S9, S11] — Install nuqs, add the App Router adapter and a small reusable URL pagination hook. Route: worker plus parent-managed dependency installation; independent verification for dependency risk item 5. Status: pending. Commit: pending (`feat(pagination): add nuqs-backed pagination`).
- T6 [S1, S4-S6, S11] — Replace the news placeholder with its own paginated listing, controls and internal news links. Route: worker, context backstop. Status: pending. Commit: pending (`feat(news): add paginated news listing`).
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
