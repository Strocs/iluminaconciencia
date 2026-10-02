# IluminAConCiencia Live Mock Snapshot and Map Integration

## Objective
Capture the public IluminAConCiencia dataset as a local mock and use its compact station subset to drive the map during local development without loading dashboard chart payloads into the browser or production bundle.

## Problem and rationale
The full public snapshot now exists, but the current map still reads a five-station placeholder mock. The snapshot has 37 current public nodes, coordinates, and current aggregate metrics; it also contains about 48,000 chart points not needed by the map. The user authorized connecting it for local development and confirmed this project is not being published now.

## Scope and constraints
- Use only the local public-data snapshot `tmp/mocks/iluminaconciencia-snapshot.json`; no new scraping or external calls.
- In `astro dev`, project only map fields from the snapshot into the current `Instrument` contract and serialize that compact list for the map client.
- Do not send the full snapshot/chart series to browser code. Preserve the existing bundled mock as a non-development/production fallback so the source snapshot is excluded from production output.
- Treat absent altitude/weather as unavailable, not fabricated; retain source dashboard links and approximate map coordinates.
- No architecture/dependency changes. Delivery was initially not authorized; the user later explicitly authorized including the local snapshot in grouped workstream commits.

## Tasks
- [x] T1 — Extract the current public homepage node index and summary values.
- [x] T2 — Capture all individual dashboard metadata, monthly rows, chart series, and map-marker positions.
- [x] T3 — Save and independently validate the source-attributed local snapshot.
- [x] T4 — Adapt the map's development data path to project compact `Instrument` records from the snapshot; preserve truthful missing-value presentation and production fallback.
- [x] T5 — Add focused mapper coverage, run project checks, and verify the full snapshot and chart payload do not enter production/client assets.

## Acceptance criteria
- Snapshot remains at `tmp/mocks/iluminaconciencia-snapshot.json` with all 37 nodes and source/coordinate provenance.
- Local development map shows all available snapshot stations and actual public coordinates/summary values.
- Browser map data contains only the compact fields it consumes; the 4.3 MB source snapshot and chart series are not sent to the browser or included in production output.
- Production mode retains the existing local mock until publication is explicitly requested.
- Missing altitude/weather values are presented as unavailable, never substituted with invented values.
- Focused mapping tests plus `pnpm check`, `pnpm test`, and `pnpm build` pass, with the data-boundary assertion verified.

## Checks and current progress
- Snapshot task: complete. Snapshot has 37 stations, 216 monthly rows, 111 chart groups, 48,480 chart points, and 37 valid public map coordinates; independent structural checks passed.
- T4: done by one bounded `gentle-ai-worker`. `loadInstruments` maps the snapshot only in development, retains the existing mock otherwise, and `MapSection.astro` serializes only compact projected records for client code. The drawer displays missing altitude/weather as unavailable.
- T5 test-first evidence: the original focused test failed because the mapper was absent, then passed 3/3 after implementation and regression coverage for unsupported codes. The independent verifier reran the focused suite, `pnpm check`, `pnpm test`, and `pnpm build`; all passed. `pnpm test` is an alias for `astro check`, so the Node built-in suite provides behavioral coverage.
- Production boundary: verified generated production HTML retains the five-entry fallback; scanned built HTML/JS/CSS/JSON contained none of the selected source-snapshot/chart markers. Source snapshot is 4,306,401 bytes; compact dev map payload is about 12 KB. No full chart/table payload is passed to browser code.
- Build warning: Vite reports an existing large MapLibre chunk (~1.04 MB), above the 500 kB warning threshold.
- Parent spot-check: reran the focused Node test; 3/3 passed. No dev server/browser check was run, so live visual interaction remains unverified.
- Native ASSESS failed closed as unassessable because ambient untracked files were not declared; the returned high-risk plan's independent verifier requirement was met. The `gentle-ai review mode status` CLI could not be queried because `gentle-ai` is not installed in PATH; no native review lifecycle was started. RDD is off.
- Changed files: `src/shared/features/instruments/dal/loader.ts`, `src/shared/features/instruments/dal/snapshot-mapper.ts`, `src/shared/features/instruments/types.ts`, `src/features/map/MapSection.astro`, `src/features/map/drawer.ts`, `tests/instruments-snapshot-mapper.test.mjs`.
- Delivery/commit: authorized after implementation; the user specifically confirmed that the 4.3 MB local snapshot should be included in the map workstream commit. Commit identity will be recorded after creation.

## Next step
Run `pnpm dev` locally to visually confirm the 37 markers and drawer behavior; check the expected port first and reuse an existing server if present.