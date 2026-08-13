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
- `src/features/hero` contains the hero markup, narrative content and motion logic.
- The hero uses `public/images/hero/coquimbo-night-sky.webp`, a locally optimized 1920x1080 crop from the upper-left area of the current client site banner at `https://iluminaconciencia.userena.digital/static/images/full_slider/banner-web-1.jpg`. The local asset is used for performance and does not hotlink the source image.
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

The hero is a continuous native-scroll narrative: artificial glow clears toward a starry sky while messages transition through the same visual field. With `prefers-reduced-motion: reduce`, all content remains in normal flow, visible, unpinned and without artificial narrative space.

## Provisional boundaries

The fixtures are not production data and do not claim realtime freshness. Infrastructure and backend still need to provide the API contract, date/freshness semantics, point identifiers, validated indicators, files, CORS/authentication, caching and error states. The infrastructure meeting must decide hosting details, map provider/tiles, update mechanism and any SSR requirement. No AWS adapter, deployment configuration, provider credentials or secrets are included here.
