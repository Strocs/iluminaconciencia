# CALUZ observation network scaffold

This is the initial Astro vertical slice for a progressive entry into the CALUZ observation network. Astro owns the shell, semantic HTML and static content. The current point explorer and point briefs use explicitly provisional local fixtures.

## Stable decisions

- Astro is the application shell and default rendering model.
- React is reserved for justified interactive islands; this slice does not need one yet.
- The hero uses native scrolling and a continuous GSAP + ScrollTrigger enhancement. There is no scroll hijacking or ScrollSmoother.
- The map renders with MapLibre GL JS v6 and the OpenFreeMap dark vector style (no API key required). See the [Map provider](#map-provider) section for the required MapLibre v6 worker configuration and how to verify tile loading.
- Domain-facing contracts do not expose Django DTOs or provider SDK types.

## Structure

- `src/domain` contains small product contracts such as `ObservationPoint`, status and coordinates.
- `src/features/observation-points` contains provisional fixtures and point lookup.
- `src/components` contains reusable Astro presentation pieces.
- `src/layouts` owns the document shell and navigation.
- `src/features/hero` contains the Astro-first hero composition, its declarative data, and framework-free runtime.
- The hero uses the approved `public/images/hero/iluminaconciencia-logo.png` and procedural Canvas layers; it does not include a photographic sky asset.
- `src/pages` composes the home feature and static point routes.
- `src/styles` contains Tailwind 4 import and global visual/accessibility rules.

## Commands

```sh
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm preview
```

## Motion and reduced motion

The hero is a continuous native-scroll narrative with a shared normalized progress stream for the scene, procedural sky, and Bortle scale. With `prefers-reduced-motion: reduce`, the overlaid composition remains static, exposes one active scene, and does not start the runtime.

## Map provider

The measurement-node map (`src/features/map`) renders with **MapLibre GL JS** and the **OpenFreeMap dark vector style** (`https://tiles.openfreemap.org/styles/dark`); no API key or registration is required.

### MapLibre v6 worker configuration (required)

MapLibre v6 ships as ESM and derives its worker URL from `import.meta.url` (`maplibre-gl-worker.mjs`, a sibling of the main bundle). Inside a bundler (Vite/Astro) that URL never resolves to the real worker file: in dev it points at `/node_modules/.vite/deps/maplibre-gl-worker.mjs` and in the build at `/dist/_astro/maplibre-gl-worker.mjs`, both 404. The worker performs tile fetching, so a missing worker makes the map silently render only the style background — a black map area with only the DOM markers on top, and no tile requests in the network tab.

The fix lives in `src/features/map/providers/maplibre/map-libre.ts`:

```ts
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(maplibreWorkerUrl)
```

Use `?worker&url`, not plain `?url`: the plain form emits the worker verbatim without its sibling `maplibre-gl-shared.mjs`, so it fails on its first import and the map stays black. `?worker&url` routes the file through Vite's worker pipeline and emits a self-contained chunk in dev and production. `src/env.d.ts` includes `vite/client` types so the import type-checks.

To verify: load the page and check the browser network tab — after the style and sprite requests, tile requests to `tiles.openfreemap.org/planet/...` must appear. References: the MapLibre v5→v6 migration guide (`setWorkerUrl()` is bundler-only), upstream issue maplibre/maplibre-gl-js#8018 ("Map hangs silently when the worker script fails to load"), and the Vite + MapLibre v6 workshop notes from FOSS4G 2026.

## Provisional boundaries

The fixtures are not production data and do not claim realtime freshness. Infrastructure and backend still need to provide the API contract, date/freshness semantics, point identifiers, validated indicators, files, CORS/authentication, caching and error states. The infrastructure meeting must decide hosting details, map provider/tiles, update mechanism and any SSR requirement. No AWS adapter, deployment configuration, provider credentials or secrets are included here.
