# Hero stationary exit

## Scope
Replace GSAP pinning with CSS sticky positioning on the outer viewport layer. Keep ScrollTrigger progress timing unchanged. Keep inner visuals viewport-fixed while the existing foreground mask scrolls away.

Preserve existing dirty changes, mountain geometry, centering, sky lifecycle and reduced-motion behavior. The user authorized a commit containing only this feature; remaining work receives a proposed commit plan.

## Tasks
- [x] T1 Implement the minimal positioning changes in HeroRuntime, scroll-timeline and HeroFrame.
- [ ] T2 Complete visual verification. Static checks and desktop positioning passed; mask painting, mobile, reduced motion and interaction checks remain pending.
- [x] T3 Receive user visual feedback: the user confirmed the behavior works perfectly.

## Validation
The user subsequently authorized appropriate verification. Run focused static checks and bounded browser checks if the existing environment is usable. No meaningful deterministic RED exists for this positioning-only change; no RED/GREEN evidence is claimed. Visual behavior, reverse scrolling, resize and mask compositing remain unverified until checks are observed.

## Evidence
Writer applied the three scoped positioning changes. Independent TypeScript (`tsc --noEmit --incremental false`), focused ESLint (zero errors, three Tailwind style warnings) and scoped diff whitespace checks passed. System Chromium desktop spot-check at 1440x900 confirmed outer wrapper top 0 before exit and -150px after exit while inner fixed wrapper remained top 0 and height 900px. Scene progress and reverse positioning worked. Mask screenshot pixel probe was unsupported (RGB PNG), so actual mask painting remains unverified; mobile, reduced-motion and interaction checks were not completed. Owned browser closed; temporary marker discarded. Native review preflight is blocked on untracked scope and includes unrelated dirty changes; no lineage started. Work-unit commit: `d3e4a0eb06ff45c2b300ba37515888d7a52830e4` (`feat(hero): keep visuals stationary during masked exit`). Framing was staged selectively so unrelated SVG geometry and mask-offset changes remain uncommitted. The committed slice normalizes the inner wrapper height as part of fixed positioning; the user's visual acceptance and earlier checks apply to the full working-tree composition, not an isolated checkout without the remaining artwork changes.
