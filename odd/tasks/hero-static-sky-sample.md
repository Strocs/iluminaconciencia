# Static 16:9 hero sky sample

## Intent
Persist an offline-prefiltered catalog for the existing safe 16:9 composition. No filtering during build, request, initialization or resize. Responsive crops stay inside that reference without distorting positions or recalibrating retained stars.

## Constraints and decisions
- Unrelated dirty files preserved. Backup star-catalog.ts.bak unchanged: SHA-256 047dc4db80b635aae871633276dde9ab077bd7daaaf078467627d0b24b8f93da.
- Retained source literals, four fields and order unchanged.
- Reference captured from executable baseline: x0=-2.6601222222222223, y0=-1.4565, width=5.443022222222221, height=3.0617. 1920x1080 is composition, not a canvas/DPR limit.
- Original normalization bounds and magnitude range (-1.46..6.5) remain fixed; projection tangent trig computed once.
- Explicit-only offline generator has read-only --check and no runtime imports/build hooks. The 10 CSS px reference halo margin retains boundary candidates; arbitrary-size edge-perfect coverage is not guaranteed.
- User explicitly authorized committing these changes. Implementation commit: ca3b807b3917837e5d9f2eec539b8fedb9f6faaa (`perf(hero): persist a fixed 16:9 night sky sample`). No push authorized.

## Tasks
- [x] T1: Capture reference, add regressions, persist reduced catalog, implement reference-contained responsive cover framing and fixed calibration; run focused tests/typecheck/lint.
- [x] T2: Independently verify membership, geometry, calibration, backup and browser layouts; record unavailable checks.

## Routing
T1 delegated to gentle-ai-worker (multi-file trigger), with bounded follow-up. Parent corrected only shell quoting in two documentation/generated-comment lines (mechanical, no behavior change). T2 delegated to gentle-ai-verify. Single writer; verifier changed no source.

## Verified evidence
- 5530 -> 4666 stars: 4602 reference centers + 64 halo-only; 864 instances removed (15.62%). Catalog 298309 -> 251348 bytes (15.74% smaller).
- Crop containment RED observed before implementation at aspect 2. Initial catalog behavioral RED was blocked by Node import resolution; historical test-first exception, not fabricated evidence. Later negative controls reject original unfiltered membership and legacy subset recalibration.
- Writer and independent verifier: 10 focused Node tests pass; deterministic generator --check, typecheck, lint, scoped whitespace check and backup SHA all pass. Node emits module-type performance warnings only.
- Writer compared hoisted projection bit-for-bit over all 5530 original rows. Independent verifier reviewed geometry/color logic and tested membership/calibration; did not separately rerun the full legacy mapped-array comparison.
- Browser WebGL active; actual instanced draw count remains 4666 through resize. Checked 1920x1080, 1280x720, 390x844, 1000x900, 3440x1440 and 1920x640. Actual canvas at 3440x1440 is 1920x1440, confirming width-only cap. At DPR 1, backing and CSS sizes match. No prominent catalog gaps or stretched spacing observed.
- Browser console: 0 errors, 4 GPU ReadPixels stall warnings during checks. No FPS benchmark performed; reduced instance count is not a measured FPS improvement.
- Screenshots: output/playwright/static-sky/; parent spot-checked 1920x1080-night.png.
- Owned static-sky-verification browser and port-3100 server closed; closure confirmed. Existing festival-align-followup session untouched.

## Native review and delivery
Initial workspace ASSESS was unassessable and required independent verification, completed above; workspace INSPECT included unrelated work, so no broader START was attempted. After the implementation commit, committed-range ASSESS from base 8b82c8eda2df3c354165aaf1fc227076aaaa71b6 reports medium risk and native review due (slice_budget_reached). The isolated committed candidate is now available; native review outcome remains unknown, with no receipt or approval claimed.

Current uncommitted reviewed surface: authored tracked crop/mapper +33/-187 and 273 lines of new reference/generator/tests (493 total; includes prior untracked test surface). Generated catalog +9/-886 reported separately; backup is an unchanged source copy. Initial authored estimate was lower; scope remains one coherent sky capability. Strategy ask-on-risk; commit explicitly authorized by the user, publishing remains unauthorized.

## Delivery adjustment
The user explicitly requested removing permanent test files from the deliverable. Deleted sky-crop.test.ts and star-mapper.test.ts; functional implementation and original catalog backup remain unchanged. Test results above are historical internal verification evidence, not runnable tests shipped with this change.

## Next step
User-directed visual review or subsequent optimizations. Optional FPS profiling and isolated native review remain separate follow-ups; do not apply or publish automatically.
