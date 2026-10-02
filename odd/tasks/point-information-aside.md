# Point information aside

## Goal
Align the map point-information aside with the supplied reference: improve text readability and action styling, remove locality and altitude, and show a small set of useful context from existing instrument data.

## Scope
- Update point-detail aside structure and Tailwind presentation without changing shared visual tokens or map behavior.
- Omit locality and altitude; expose the selected snapshot summary period and data percentage as concise context.
- Match the supplied Bortle composition: vertical label, large level numeral, separate colored dot, classification copy, and secondary SQM range.
- Use the sans-serif body font and gold color for the location title.
- Use `LinkButton.astro` for both the information link and close button (`as="btn"` for close), preserving destinations and close behavior.
- Add focused regression coverage and run project checks.

## Constraints
- Preserve all pre-existing dirty work, especially the point drawer transitions, snapshot integration, and shared control changes.
- Add only the selected snapshot summary fields: `homepageSummary.dataPercent` and `homepageSummary.period`; do not add status, statistics breakdowns, funding, or synthetic values.
- Format period and percentage in Spanish for UI display.
- Delivery was initially withheld; the user later explicitly authorized grouped workstream commits.

## Tasks
- [x] M1 Define focused regression coverage for the aside content and readability/action structure. Observed RED against the original markup; focused coverage now includes absent locality/altitude, optional context and local action styling.
- [x] M2 Update the point aside content and presentation using existing data only. Removed locality/altitude, hides unavailable weather, omits unavailable measurement values, increased text sizes, and aligned outlined actions with the reference.
- [x] M3 Verify focused coverage, `pnpm check`, `pnpm test`, `pnpm build`, and `git diff --check`; all passed. Build emitted the existing-style Vite large-chunk warning (>500 kB).

## Completion notes
- The native review preflight was inspected, but START was not invoked: the candidate is the accumulated working tree with unrelated existing changes, not an isolated work-unit commit/PR slice. The untracked scope was explicitly excluded during inspect; no review lineage was started.
- No browser rendering was captured; visual geometry was checked against the supplied composition through source structure only.
- The shared `src/shared/components/ui/Button.astro` had been present as a pre-existing modified file at session start and temporarily disappeared during work. It was restored to the exact modified content visible in the initial diff and remains modified, preserving pre-existing user work.
- User authorized grouped workstream commits. Commit: `7ec4432f8bc51263e7acc82c481f81803d96c63c` (`feat(map): load snapshot data and refine map controls`).

## Evidence
- User supplied current/target screenshots under `/tmp/.wsl-screenshot-cli/` and approved the clarified data/design proposal.
- `stars1141` snapshot: W instrument, Bortle 6, 4,180 measurements, data percentage 46.44, mean magnitude 18.75, period Aug 2026.
- Existing drawer source already has uncommitted changes; retain those changes and layer this request on top.
- Commit pending; the user subsequently explicitly requested commits for the current changes.

## Follow-up tasks (approved)
- [x] M4 Add mapper/type support for data percentage and summary period, with test-first mapper coverage. RED/GREEN observed; 3 mapper tests pass.
- [x] M5 Rebuild drawer context/Bortle layout, use LinkButton for both actions, and style the title in sans-serif gold; cover markup and binding. Focused drawer tests observed RED/GREEN; 7 tests pass.
- [x] M6 Run focused mapper/drawer tests, `pnpm check`, `pnpm test`, `pnpm build`, and `git diff --check`. All passed: 10 focused tests; check/test reported no diagnostics; build emitted the >500 kB chunk warning; diff check clean.
