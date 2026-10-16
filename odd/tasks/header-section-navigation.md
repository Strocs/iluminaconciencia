# Header-owned section navigation

## Objective
Simplify section navigation ownership following the user-approved architecture.

## Scope and constraints
Header/navigation owns NavLink, navigation data and necessary hooks/internal pending intent. Header section links scroll directly on home or navigate to / then scroll when destination mounts; pending intent survives header remount across route groups. Remove shared/home-navigation and its main wrapper. Home retains plain main and no injected scroll controller. Hero CTA only performs local map scroll. Generic LinkButton remains generic. Preserve hero/solid header modes, URLs and all unrelated dirty layout/footer changes. No aliases, rewrites, hash changes, browser/Playwright, tests creation, branches or commits.

## Tasks
- [x] T1 (writer implementation and checks passed): Consolidate header navigation and remove home wrapper/shared module; implement local hero scroll and self-check.
- [x] T2 (independent review and correction checks passed): Independently verify ownership, pending intent lifecycle, lint/types/build and route preservation.

## Acceptance
NavLink encapsulates ordinary vs section destination behavior. Cross-route pending scroll survives group remount, waits for target and cleans observers/listeners without stale executions. Same-home repeated links scroll without URL changes; modified clicks remain normal. Home page has plain main; no HomeScrollTarget or equivalent injected controller. Hero does not import header cross-route navigation. Existing focus/reduced-motion behavior preserved.

## Evidence
User explicitly rejected previous shared component and proposed header/navigation ownership; authorized implementation. Read-only scout mapping current surfaces. Existing shared controller passed lint/types/build but is being replaced for architecture simplicity. No checks run yet for this change. Test-first omitted per explicit project no-tests rule.

## Resume
User paused work and canceled the prior writer. Partial header/navigation files exist alongside legacy files; current state requires reconciliation, not a fresh duplicate implementation. User reauthorized this refactor. Hero map CTA has since been corrected to existing LinkButton as="btn" and verified; preserve it, do not reintroduce raw buttons or copied styles.

## Implementation evidence
Writer completed header/navigation consolidation and deleted legacy components/NavLink.tsx, data/navigation.ts and shared/home-navigation/HomeSectionNavigation.tsx. Home plain main, hero remains LinkButton local scroll. pnpm lint, pnpm typecheck, pnpm build and scoped whitespace passed. No legacy imports found. Parent spot-checked section-intent lifecycle; independent review pending. No browser checks or commits.

## Independent verification
Lint, typecheck and scoped whitespace passed. Header ownership, plain home main, removed legacy imports and lifecycle cleanup structurally confirmed. One finding: disabled section links lack activation guards in click/onNavigate and could still scroll/set intent. Narrow one-file correction delegated; T2 stays open. Browser/runtime navigation not verified.

## Final correction evidence
NavLink now prevents default and returns when disabled in both section onClick and onNavigate, before scroll or intent creation. Writer lint/typecheck/scoped whitespace passed; parent bounded structural readback confirmed both guards and unchanged enabled/modifier flow. Build passed before this guard-only correction; not repeated afterward. Browser/runtime checks not authorized. Native INSPECT remains blocked at intended-untracked selection with mixed pre-existing workspace changes; no START/approval claimed. No commits.

## Next step
Refactor complete within authorized checks; browser navigation remains unverified and native review pending scope resolution. No additional implementation planned.
