# Sky pollution dome

## Objective
Replace linear skyglow with a broad elliptical dome matching the reference through user-led visual calibration.

## Scope and constraints
Change pollution geometry and alpha stops only. Preserve source #F6A967, configured initialOpacity 1 and GSAP timeline. Preserve unrelated edits. No commit/publication without explicit user request. User explicitly cancelled verifier/browser checks and will supply visual feedback.

## Tasks
- [x] T1: Implement and enlarge responsive elliptical gradient. Delegated workers mv0243bv-3-dsmz and mv029cgv-5-7qtc; parent source readback confirms updated geometry/stops. Visual acceptance remains pending. Commit pending authorization.
- [ ] T2 (pending user feedback): User-led visual calibration; verifier cancelled. Native review unresolved.

## Acceptance
Broad low dome; gradual lateral/vertical falloff without harsh rings; unchanged source color/global opacity/timeline.

## Evidence
User result screenshot bbefd4944e193e6626c47b84ff9b939a652d69fa0248c7fe6d0963df2c387632.png is at START of timeline. It showed insufficient upper reach and muted base.
Updated mobile ellipse: 150% 125% at 50% 100%; desktop: 100% 120% at 50% 96%.
Alpha stops: 100% at 0%, 75% at 35%, 35% at 70%, transparent at 100%.
Only light-pollution/index.tsx changed in latest iteration; parent readback confirms bindings preserved.
Initial implementation ESLint/typecheck/diff check passed. Latest iteration structural inspection only: no new lint/typecheck/browser run. No meaningful deterministic RED for aesthetic calibration.
Native ASSESS previously unassessable due undeclared untracked scope; no review outcome for current candidate.

## Delivery and next step
Forecast <100 authored diff lines, ask-on-risk. No commit made.
Await user screenshot/feedback; do not launch verify. Reference: /tmp/.wsl-screenshot-cli/c2d55572db8fab152b6681403058644d8478d5fcca61e63edd43ec9a8870b378.png.
