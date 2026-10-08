# Hero safe sky crop

## Intent
Use the calculated gap-aware sky crop for portrait as well as landscape. Never reveal the full catalog height on valid portrait sizes. Preserve existing local modifications; defer other optimizations.

## Scope and route
Delegated bounded writer: crop implementation plus dependency-free regression checks (multi-file write trigger). Use the aspect-1 MIR rectangle's verified vertical bounds for portrait; preserve group horizontal centering. Do not change landscape or ultra-wide behavior.

## Tasks
- [x] T1: Add focused regression checks, observe RED, apply safe portrait crop, observe GREEN and run typecheck/lint.

## Acceptance
Portrait heights equal the safe aspect-1 MIR height and top cap, not full catalog height. Safe vertical framing stays continuous across aspect 1. Landscape behavior and invalid-input handling remain unchanged. Horizontal centering remains intentional.

## Evidence
Writer observed RED (portrait height at aspect 0.3), then GREEN (4/4 dependency-free Node tests). `pnpm typecheck` passed. `pnpm lint` passed with 18 existing out-of-scope Tailwind ordering warnings in MapCanvas.tsx. Source reuses MIR_RECTS[0].h/y0 for portrait and retains group-derived horizontal positioning; landscape/ultrawide unchanged. Independent verifier confirmed 4/4 tests, typecheck, lint and scoped diff whitespace check pass; no scoped blockers. Node reports a module-type performance warning. Tests cover representative portrait/landscape/ultrawide cases, not an exhaustive aspect sweep.

User explicitly authorized committing the sky changes together with the subsequent static-sample implementation. Native facade is available although the CLI is not in PATH. ASSESS returned unassessable because of untracked files and requires an independent verifier. INSPECT includes unrelated pre-existing tracked changes; native review of this isolated fix is pending rather than freezing those changes into a broader candidate.

## Delivery
One narrow fix, forecast under 120 authored lines; ask-on-risk.

## Next step
This fix's intent is preserved by the subsequent static 16:9 sample (see hero-static-sky-sample.md), whose browser verification passed. Permanent test files were removed at the user's request; results above are historical internal evidence. Commit identity will be recorded after creation; publishing remains unauthorized.
