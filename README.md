# CALUZ observation network scaffold

This is the initial Astro vertical slice for a progressive entry into the CALUZ observation network. Astro owns the shell, semantic HTML and static content. The current point explorer and point briefs use explicitly provisional local fixtures.

## Stable decisions

- Astro is the application shell and default rendering model.
- React is reserved for justified interactive islands; this slice does not need one yet.
- The hero uses native scrolling and a continuous GSAP + ScrollTrigger enhancement. There is no scroll hijacking or ScrollSmoother.
- The map is represented by an accessible schematic fallback. No map provider, tiles, chart library, table library or realtime mechanism is selected.
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

## Provisional boundaries

The fixtures are not production data and do not claim realtime freshness. Infrastructure and backend still need to provide the API contract, date/freshness semantics, point identifiers, validated indicators, files, CORS/authentication, caching and error states. The infrastructure meeting must decide hosting details, map provider/tiles, update mechanism and any SSR requirement. No AWS adapter, deployment configuration, provider credentials or secrets are included here.
