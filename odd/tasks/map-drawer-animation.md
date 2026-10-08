# Map drawer animation

## Objective
Desktop fixed right drawer beside map, NOT overlay. Animate clipped visible viewport while actual MapLibre host/canvas stable. Desktop transparent/borderless; mobile bg/border overlay. Retained content/pure right slide/no squeeze/leak.

## Constraints
Preserve dirty work/other sessions. No staging/commits/publishing/direct useEffect/unrelated focus edits. True viewport resize updates map. Forecast<250lines; ask-on-risk.

## Tasks
- [x] T1: Layout/lifecycle and responsive CSS implemented in MarkDrawer.tsx, MapExplorer.tsx, MapCanvas.tsx and earlier useMapOverlays.ts. Delegated worker multi-file/preparation. No commit authorized.
- [x] T2: Independent Chromium geometry, responsive resize, styles, entry/exit, reduced motion and final controls spot-check passed.
- [x] T3: Resolved viewport clipping requirement, superseding earlier overlay.
- [ ] T4 (separate pending): Prior close-focus restoration failure not addressed.

## Evidence
Desktop1280×80014frames each way viewport993↔777; actual canvas/intrinsic993×618 stable; drawer216fixed/transparent/border0, overlap0. Genuine window resize1024 actual canvas737 correctly. Reduced-motion property none/duration0;8frames each direction no intermediate states. Mobile overlay dialog bg/border1 preserves map geometry. Retained content/no closed leak previously verified; rapid reopen passes.
MapLibre unlayered CSS defeated matching Tailwind control selector; important insets/margin0 fixed. Final independent390controls332–361 with canvasright373(12px inset);1280controls265–294 withcanvasleft253(12px inset); mobile overlay hides controls. Browser owned sessions closed, existing server untouched.
Latest worker pnpm run typecheck passed; all3 scoped lint clean; final independent eslint --max-warnings=0 MapCanvas passed. No deterministic unit runner/files, no full build or comparative FPS proof. Native review pending isolated candidate (mixed existing dirty/untracked scope), no START/approval. No commits/staging.

## Remaining and next step
Requested layout/animation/styles verified. User should confirm perceived smoothness on actual setup; no comparative FPS guarantee. Prior close focus lands on body remains separate pending diagnosis. Native review and full build not completed.
