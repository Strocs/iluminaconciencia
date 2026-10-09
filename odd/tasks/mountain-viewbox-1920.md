# Mountain viewBox adaptation

## Objective and scope
Adapt all hero mountain SVG coordinate systems to width 1920 without cropping or changing visual width limits, responsiveness, animation, or CSS placement. Replace only the nearest silhouette with frontalclip.svg, then delete that temporary input. Preserve all existing dirty-worktree changes.

## Approach
Uniformly normalize existing 2400×1700 art to 1920×1360. Embed the new 1920×309 frontal shape bottom-aligned within the normalized art box; do not stretch its ridge vertically. Preserve existing CSS sizing/offset ratios and mask composition.

## Tasks
- [x] T0 (read-only delegated): Diagnosis resolved: original compensation targeted old valley, not silhouette bounding height. User authorizes recalibration, not stretching.
- [x] T1 (delegated): Normalize mountain coordinates/viewBoxes and integrate frontal silhouette; remove temporary SVG. Route: gentle-ai-worker, multi-file write trigger. Checks: typecheck, lint, structural geometry checks.
- [x] T2 (delegated): Independently verify geometry, responsive rendering and preserved behavior; assessment and preflight outcomes recorded. Native review remains pending scope isolation, not approved.

## Acceptance
All mountain art viewBoxes are 1920 wide; middle/distant rendered geometry unchanged; nearest uses the supplied shape; mask scaling and offsets unchanged; no unrelated user edits lost; temporary SVG absent.

## Verification policy
No test script exists. This is a visual geometry change: use deterministic structural geometry checks and browser checks where available, rather than inventing a unit-test RED. Typecheck/lint required. Browser verification pending.

## Delivery
Forecast: under 150 authored diff lines; strategy ask-on-risk. No commits authorized by the user; leave changes uncommitted under repository safety policy. Native review follows user-owned switch only.

## Progress
Implementation partially applied, then paused on user warning about a previously adjusted height. Worker reports CSS height/offsets unchanged; middle/distant now 1920×1360 with scale(0.8), nearest supplied path translated y=1051. Visual ridge-height equivalence is unverified. No restoration or further source writes authorized during diagnosis. Checks and input-file deletion status not yet confirmed.

## Correction evidence
Contour valley237.836 (polygon closure309 excluded), translated valley1288.836, canvas gap71.164. Offset derived from named geometry metadata: artWidth*71.164/1920 -5vh. No vertical stretching. Writer typecheck passed; lint passed with5 warnings,0 errors. Geometry check passed at artwidth975/1920 and viewportheight800/1200. Parent deleted extracted temporary frontalclip.svg. Native assess unassessable due unrelated untracked files; independent verifier running, browser pending. No native closure or commits claimed.

## Next step
Functional verification complete: independent typecheck passed, lint0 errors5 warnings. Browser390×844,1440×900,1920×1080: no horizontal overflow/unwanted spill, computed masks target valley5vh above frame bottom,0 browser errors4 warnings. Existing server preserved; verifier browser closed. Middle/distant rendered geometry equivalent; frontal proportions unchanged; temporary SVG absent. Native inspect blocked on intended-untracked selection and includes unrelated user changes; no START performed. Next: user visual acceptance; isolate candidate before native review. No commits made.
