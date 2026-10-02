# Map filter, drawer motion and aside actions

Objective: expose SQC as an instrument filter, animate opening the point detail drawer, and align filter aside actions at its bottom.

Evidence: filters are generated from loaded instrument types in MapSection.astro. Production mock has SQC, but current development snapshot contains only TESS-W/TESS-4C, so SQC must be an explicit filter option even with zero matching points; do not fabricate SQC measurements. Drawer is display:none on desktop and transform-animated on mobile, preventing a desktop opening transition. FilterPanel is a full-height flex column, but actions lack an auto-margin anchor.

Scope: map filter option, drawer presentation, aside action layout and focused tests only. Preserve existing dirty development snapshot integration, map provider, focus/Escape/mobile inert behavior and visual language. Use Tailwind utilities, reduced-motion safe transitions. Delivery was initially withheld; the user later explicitly authorized grouped workstream commits.

- [x] M1 Add SQC to filter options even when absent from development data; keep actual type filtering and Select all. Focused test observed RED/GREEN (`node --test tests/map-filter-controls.test.mjs`, 1 passed). No synthetic measurements.
- [x] M2 Add desktop width/transform/opacity transition with always-rendered inert closed drawer, preserving mobile slide and reduced-motion classes. Focused test observed RED/GREEN (2 passed); structural readback caught a missing base `flex`, corrected and retested. Browser behavior remains for M4.
- [x] M3 Anchor Select all and Data table actions at bottom via `mt-auto` on first action; preserve 4-unit gap and disabled link. Focused RED/GREEN; 3 map tests passed. Rendered layout still to verify.
- [x] M4 Independently verify 3 map tests, `pnpm check`, `pnpm test` (check alias), `pnpm build`, `git diff --check`: all passed; build has nonfatal >500 kB warning. Compiled CSS includes motion and mt-auto. Browser session checked SQC, desktop/mobile drawer opening, desktop Escape, desktop bottom alignment (table 3.5 px from aside bottom), open width 220 px and transition 0.2 s. Reduced motion, mobile focus restoration, closed drawer geometry and precise animation frames not measured; desktop focus restoration after Escape unclear. Sessions closed. Native review INSPECT blocked by untracked selection and includes unrelated hero/instruments/UI changes; no START attempted.

Progress: M1–M4 implemented and checked; browser limitations above remain. User later authorized grouped workstream commits; this map-control work is being combined with the point aside and snapshot integration to keep the async loader, MapSection, and LinkButton consumers coherent. Commit identity will be recorded after creation.
