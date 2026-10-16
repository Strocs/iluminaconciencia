# News and article source extraction
Objective: capture source-attributed public content for future DAL queries; no UI or query implementation in this work unit.
Branch: main (repository policy). Delivery: one data work-unit commit plus a tracking closeout commit; generated snapshots excluded from authored-line forecast (~150 lines). Checks: snapshot integrity and source comparison; no tests or browser automation.

## Specs

- S1 — "Necesito que entres a https://iluminaconciencia.userena.digital/news_list y extraigas información de todas las noticias y también los artículos en el home de la página, esto serán datos mocks y deben vivir dentro de dal mediante un getNews y getArticles siguiendo el mismo patrón actual." This unit captures the data under DAL; query functions follow in a later unit.
- S2 — "Ahora no existirán los datos en news/data/ si no que vivirán en el dal." New source snapshots belong in `app/_dal/news/data/` and `app/_dal/articles/data/`; migrating the existing home consumer is outside this extraction-only unit.
- S3 — "Respecto a tu presición, si bien dije descargar, en realidad era una referencia externa al recurso en sí mimso, Ver publicación es correcto porque abriría el pdf en una uneva página. No usar el attr download." Extract the publication resource URLs without copying or transcribing their documents.
- S4 — "perfecto, podemos comenzar, la primera tarea debería ser el scrapping y extracción de datos"

## Tasks

- T1 [S1, S4] — Capture the complete news index and every linked detail, preserving source IDs, full titles, dates, excerpts and content/media references. Route: inline. Status: done (31/31 detail pages captured; required source sections present). Commit: d1a2feb567f9cae3893fd425082d957ccf204dde.
- T2 [S1, S3, S4] — Extract every homepage publication and its original date, optional image and absolute resource URL. Route: inline. Status: done (7 publications; original dates and absolute resource URLs captured). Commit: d1a2feb567f9cae3893fd425082d957ccf204dde.
- T3 [S1-S4] — Save attributed DAL snapshots, document extraction limits, verify completeness against captured source pages and commit this data-only work unit. Route: inline extraction/checks; delegated final evidence documentation after the runtime context-backstop signal. Status: done. Commit: d1a2feb567f9cae3893fd425082d957ccf204dde.

## Log

### L1 — Original request

Vamos a trabajar en las páginas de noticias y artículos, básicamente funcionan igual, muestran la lista completa de noticias páginadas con la ruta del slug de la noticia. Aún no tenemos claro cómo se renderizará la noticia, si viene como markdown o html, así que por el momento lo trabajaremos directamente en un layout por props.

Necesito que entres a https://iluminaconciencia.userena.digital/news_list y extraigas información de todas las noticias y también los artículos en el home de la página, esto serán datos mocks y deben vivir dentro de dal mediante un getNews y getArticles siguiendo el mismo patrón actual.

Comienza con el análisis de los req

### L2 — Current authorization

perfecto, podemos comenzar, la primera tarea debería ser el scrapping y extracción de datos

### L3 — Scope and evidence before extraction

- The public index currently contains 31 news routes; the homepage raw HTML contains seven publications, including PDF links omitted by readable-content extraction.
- The index truncates some titles/excerpts; full titles and bodies must come from each news detail. Two news records share a title but have different IDs and dates; keep both.
- Source HTML is extraction evidence, not a chosen future backend format and not trusted renderable content. No HTML renderer, Markdown parser, DAL functions, React cache, pagination dependency or page changes are part of this unit.
- Preserve source date precision and do not infer a timezone, author, category, missing image description or missing article abstract.
- Existing human changes in `app/_components/Separator.tsx` and `next.config.ts` must remain untouched and uncommitted by this unit.
- No RED/GREEN cycle is meaningful for captured passive data; run one-off structural/source checks instead, following the repository prohibition on writing tests. No Playwright.

### L4 — Extraction evidence and documentation

- Parent source-comparison checks passed: 31/31 news records in ID/order, full titles, dates/timestamps, source body fragments and hashes, excerpts/truncation, thumbnails and media/link references; 7/7 publications in title/date/resource URL and URL-derived ID. Structural evidence confirmed unique IDs/slugs, precision, title-collision and media-only records, and the June 2023 bulletin. Totals: 31 news, 7 publications, 5 iframes, 40 body images, 31 thumbnails, 1 publication image and 16 restored full titles.
- The source guide was reconciled with snapshot fields and these counts. Documentation checks: `pnpm exec prettier --check app/_dal/NEWS_ARTICLES_SOURCES.md` and `git diff --check`, both exit 0. Parent repeated the documentation formatting check after delegation; it also passed.

### L5 — Completed data work unit

- Data/source documentation committed as `d1a2feb567f9cae3893fd425082d957ccf204dde` (`feat(dal): capture news and publication source snapshots`). Only the two snapshots and their source guide were included; unrelated human changes were preserved.
- Source comparison and structural checks passed (exit 0). Both JSON snapshots and source documentation passed Prettier. The staged diff passed `git diff --cached --check` before committing.
- Native ASSESS was unavailable: it rejected undeclared untracked files, including the pending tracking document, both on the ambient diff and on the committed-only range. Returned plan: writer self-verification stands; no independent verifier required. No review lineage was started and no native review is claimed.
- Tests, typecheck, application lint/build and visual checks were not run for these unconsumed passive snapshots; no runtime or shared application behavior changed. Binary resource downloads and remote publication availability checks were outside this capture.
- Risk: none. This unit adds passive data and documentation only; no existing helper, public contract, security guard or application behavior changes.
- Next implementation unit: DAL query functions and types, then home integration. It is not part of this completed extraction tracker.
