# Link props and class composition

## Intent
Use the existing cn utility for owned component class composition and inherit NavLink props from Next Link without redundant redeclarations. Preserve visual output, disabled/active semantics and caller overrides. Do not add memoization or change dynamic utility generation.

## Scope
NavLink.tsx, InfoPopover.tsx, HeroScene.tsx, MapCanvas.tsx, app/layout.tsx. Only applicable class compositions are changed.

## Tasks
- [ ] T1 (pending checks): Implementation applied including MapCanvas correction and NavLink icon cn. Route: delegated worker (multi-file write). Global lint/typecheck blocked by unrelated concurrent ULS syntax errors; do not mark complete.
- [ ] T2 (in progress): Independently verify scope, prop forwarding, class precedence and production build. Route: delegated verifier; assessment unassessable.

## Acceptance
All supported Link props are inherited; own variant/active/disabled remain internal. Existing cn used for conditional/composed classes where appropriate. No UI or accessibility regression.

## Verification strategy
No test framework or test script exists; use lint, typecheck, build and structural review rather than inventing RED/GREEN evidence. Forecast <200 authored diff lines; delivery strategy ask-on-risk. No commits authorized explicitly; leave changes uncommitted. Native CLI unavailable (`gentle-ai: command not found`); assessment fallback pending.

## Evidence
Initial tree clean on main. Explorer mapped candidates and two NavLink callers in header/index.tsx.

## Current evidence
Worker changed four files (23 additions, 14 deletions). NavLink inherits ComponentProps<typeof Link>. Installed Next Link guide consulted. lint and typecheck failed on unrelated untracked app/_shared/uls/top-banner/ULSTopBanner.tsx:8 (parse error/TS1109); left untouched. diff --check passed. T1 remains incomplete: parent found MapCanvas only wrapped the conditional inside its template string; correction delegated. Assessment unassessable; independent verifier required. Native tool reports RDD on, but assessment blocked by undeclared untracked files.

## Next
Independent verifier finished: scoped ESLint and diff --check passed; production compilation passed, global lint/typecheck and build typecheck failed on unrelated ULS unclosed img (lines 11/16). Structural prop/ARIA forwarding and cn precedence checked. Parent spot-check dismissed MapCanvas static backtick as a false positive: no interpolation remains and conditional is separate cn argument. layout font interpolation intentionally unchanged. Browser/UI verification not run. Native inspect ready for four tracked changed files, untracked excluded; review not started while functional checks are blocked. T1/T2 remain pending global checks. Next: once concurrent ULS syntax is corrected, rerun lint/typecheck/build and complete review. No commits.
