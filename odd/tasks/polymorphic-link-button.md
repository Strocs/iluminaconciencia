# Polymorphic LinkButton

## Objective
Unify button and link rendering behind `LinkButton.astro` using `as="btn" | "link"`, preserving LinkButton visual styling, showing the arrow only for links, and migrating all former Button callers to LinkButton directly.

## Problem and rationale
Separate Button and LinkButton components duplicated APIs and styling. The user requires one polymorphic LinkButton import and no Button compatibility component.

## Scope and constraints
- `LinkButton.astro` renders native button or anchor using shared LinkButton visual classes.
- Only link mode renders LinkButton's arrow.
- Delete `Button.astro` and migrate its remaining imports/usages to `LinkButton as="btn"`.
- Do not alter unrelated dirty working-tree changes or dependencies.
- Delivery was initially withheld; the user later explicitly authorized grouped workstream commits.

## Tasks
- [x] PLB-1: Add typed polymorphic rendering and native element semantics to LinkButton.
- [x] PLB-2: Run the project's minimum checks and record results.
- [x] PLB-3: Remove the arrow from button mode; preserve it in link mode.
- [x] PLB-4: Replace Button imports/usages with LinkButton `as="btn"`, remove Button.astro, and run project checks.

## Acceptance criteria
- `as="link"` (default) renders an anchor with href/disabled semantics and the arrow.
- `as="btn"` renders a native button with native type/disabled semantics and no arrow.
- Both modes use LinkButton styling.
- All former Button call sites import and render LinkButton with `as="btn"`; no Button component or imports remain.
- Minimum project checks pass.

## Progress and evidence
- PLB-1: Complete. Typed polymorphism and native semantics implemented in `src/shared/components/ui/LinkButton.astro`.
- PLB-2: Complete. `pnpm check`, `pnpm test` (`check` alias), and `pnpm build` passed; build warned about a chunk >500 kB. No dedicated component behavior test runner exists; test-first RED was inapplicable.
- PLB-3: Complete. Independent verification confirmed the arrow is only emitted by link mode; the three project checks passed again.
- PLB-4: Complete. `Button.astro` removed; both former consumer files now import `LinkButton` and pass `as="btn"`. A precise source search found no `Button` imports/usages.
- Final independent verification: `pnpm check`, `pnpm test`, and `pnpm build` all passed. `pnpm test` runs check; build emitted a chunk-over-500-kB warning.
- One earlier verification attempt found a stale `Button` reference in InstrumentDrawer; that reference was corrected, and the final verification passed.
- Native risk assessment was unassessable due to untracked files and requested an independent verifier, which passed. Native review inspect remains blocked pending intended-untracked selection; no selection was inferred and no lineage was started.
- The user authorized grouped workstream commits. Commit: `7ec4432f8bc51263e7acc82c481f81803d96c63c` (`feat(map): load snapshot data and refine map controls`).

## Next step
If native review is desired for the broader working-tree candidate, resolve the inspect selection stop explicitly and ensure the selected candidate scope is appropriate. No deployment occurred; workstream commits were later authorized and recorded above.
