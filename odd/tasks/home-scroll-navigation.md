# Home scroll navigation

## Objective
Replace rejected /explorar and /contacto URL aliases with scroll-only links and one home page.

## Scope
Remove both alias pages and extracted HomePage wrapper; compose home directly in app/(home)/page.tsx. Remove route-based home-navigation wrapper and policy from generic LinkButton. Section controls scroll on home without URL changes; from interior routes navigate to / and consume a one-shot section intent. No hashes, alias paths, rewrites or scroll-driven URL changes. Preserve header layout modes, all interior pages and pre-existing footer/layout changes. Modified clicks behave normally (open home, without section intent). No tests creation, browser/Playwright, branches or commits.

## Tasks
- [x] T1 (implemented; final verification pending): Remove aliases/extra home wrapper and simplify explicit section navigation consumers; self-check lint/types/build.
- [x] T2 (independent checks passed): Independently verify cleanup and scroll-intent flow; run applicable structural/type checks.

## Acceptance
One home page; no /explorar or /contacto route/link references in application code. Direct-home section clicks do not navigate or change URL; cross-page clicks navigate only to / then scroll. Repeated clicks work. Generic links/buttons do not know home section routing. Hero CTA and header section links work. No stale pending intent, modifier-click interception or source edits outside scope.

## Evidence
Scout mapped alias pages, HomePage extraction, shared route-based controller, header data/NavLink, LinkButton and hero scene data. Cross-page intent may be held in module memory and consumed on home mount; no reload/new-tab section persistence is required. Existing installed docs must be checked by writer; scout could not find node_modules/next. Writer lint/typecheck/build and scoped whitespace checks passed before final deletions. Worker could not perform deletions under its constraints; parent completed the three explicitly user-authorized deletions. Final route type regeneration/build now required.

## Next step
Verifier passed next typegen, lint, typecheck, build and whitespace checks; build confirms aliases absent. Found cancelable RAF can lose cross-page intent because it is consumed before scroll executes. T2 remains in progress: narrow fix to consume only after scroll and disable Next scroll on section links; verify ref setup-cleanup-setup structurally. No browser or HTTP probes run. No commit requested.

## Correction evidence
Writer fixed cancelable RAF intent loss with identity and successful-scroll consumption; scroll=false avoids competing Next scroll. Post-fix lint/typecheck/whitespace passed. Final independent focused verification passed lint/typecheck and scoped whitespace; no blockers. Ref cleanup retains pending intent and successful current-intent scroll consumes it. Browser/runtime navigation not exercised. Native INSPECT blocked on intended-untracked selection amid pre-existing workspace changes; no native approval or commits.
