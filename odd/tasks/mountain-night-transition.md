# Mountain night transition

## Objective
Place pollution behind both rear hills and synchronize warm-to-black fills and distant-hill transparency with pollution over progress 0..0.8.

## Constraints
Preserve sky gradient, pollution opacity, foreground mask/5vh, geometry and unrelated edits. No verifier/browser/commands per user preference. No commit/publication without explicit request.

## Tasks
- [x] T1: Implemented stacking, landscape capability, and user-approved palette/transparency refinement. Delegated multi-file workers mv0358zd-9-1wiv and mv03dil1-a-g13f. Structural source readback observed; runtime acceptance pending.
- [ ] T2 (pending user feedback): Visual/runtime acceptance pending. Earlier candidate review declined; latest candidate native preflight handled by parent.

## Architecture and acceptance
Existing single ScrollTrigger broadcasts normalized progress. Landscape local paused timeline implements onProgress/destroy and is padded to1. Composition injects pollution horizon timing. No cross-capability events/config imports.
Sky z0 < pollution z1 < distant z10 < middle z20 < narrative z50.
Distant starts #E6A06A opacity.85; middle starts #A67550 opacity1. Both reach #000000 opacity1 at.8, stay there until1, and reverse with scroll. Reduced motion follows current progress0 handling.

## Evidence
Latest worker updated landscape/config.ts, DistantHills.tsx, MiddleHills.tsx, landscape.ts. Parent readback confirms attr fill#000000 and opacity1 animated over passed interval, padded local timeline, cleanup.
No tests/typecheck/lint/browser executed for these iterations per user direction. No deterministic RED observed. Source readback is not runtime proof.

## Delivery and next step
Forecast <200 authored diff lines; ask-on-risk. Commit pending authorization.
Await user screenshot/feedback; no verifier. Native candidate consent is separate and never model-selected.
