# InfoPopover local anchor

## Objective
Make InfoPopover a reusable contextual information button whose absolute panel expands from its local trigger without changing surrounding layout.

## Constraints
No fixed positioning or body portal. Preserve Astro, GSAP, dependencies and visual language. Tailwind utilities; Spanish UI. Do not stage or commit (repository policy; no user authorization). Ancestor overflow clipping remains a documented limitation.

## Tasks
- [ ] T1 (in progress): Refine SVG edge clipping from user screenshots: preserve full circle and rounded panel border with a small stroke-safe inset/gutter, without shifting anchor or adding overflow. No test edits.
- [ ] T2 (pending): Verify closed/open border at enlarged screenshots plus repeated hover and mobile overflow using Playwright; run required checks.

## Acceptance and checks
Panel is absolute relative to its wrapper; all four placements expand from the trigger; default hover works with click pinning, Escape and keyboard access. No viewport-coordinate translations; no surrounding layout shift. Required: pnpm check, pnpm test, pnpm build; focused deterministic tests and browser verification when tooling is available. package test currently aliases check; use node test runner for applicable existing/new tests. Observe RED/GREEN where applicable, otherwise document why.

## Evidence
Read-only audit found hover disabled by default, viewport-based fixed positioning, mobile transformed ancestor and scrollable filter container. Working tree clean before changes. gentle-ai review mode status unavailable: executable not found; review switch unknown, do not invent review authority.

## Implementation evidence
Worker changed InfoPopover.astro and added tests/info-popover.test.mjs. Reported RED then GREEN (3 structural source checks), pnpm check/test/build passed; build emitted large-chunk warning. Browser behavior remains unverified. Parent readback confirms local placement classes and reusable timeline. Native assessment unassessable because intended untracked scope is undeclared; independent verification required. Native facade inspection confirms review available and requests untracked selection; defer freeze until functional verification is complete.

## Independent verification evidence
15 node source tests passed; pnpm check/test/build passed (large chunk warning). Browser automation unavailable; no server started. Verifier identified Escape -> trigger.focus -> focusin -> show reopening when a slotted child held focus, based on control-flow evidence. Zero-duration reverse remains a runtime risk. Existing source tests do not establish behavioral RED/GREEN.

## Correction evidence
Worker observed RED for Escape reopening and reduced-motion pointer state, then GREEN after focus restoration guard and direct reduced-motion visibility updates. 5 focused tests / 17 total tests pass, including actual transpiled handlers with fake DOM/GSAP. pnpm check/test/build pass; large chunk warning remains. Harness does not verify real GSAP animation or browser layout.

## Final automated verification
Independent verifier: 17 tests pass; pnpm check reports no diagnostics; pnpm test and pnpm build pass. Vite >500kB chunk warning remains. Escape and reduced-motion regressions resolved in fake DOM/GSAP handler tests; no new deterministic blocker observed. Native review review-76a233bd5ad462ac approved and exact acknowledgement consumed authority for this candidate. Non-blocking informational finding R3-001 at InfoPopover.astro:66; no correction offered. No real-browser verification available; do not mark T2 complete.

## User browser feedback and authorization
Browser acceptance failed: clipping, added horizontal scrolling, fade/scale rather than circular button morph, text scaled rather than revealed. User explicitly authorizes changing FilterPanel overflow; restrictive overflow is not required. Source currently uses overflow-y-auto (also constrains horizontal overflow), not literal overflow-hidden. Previous automated/native approval is historical evidence only, not approval of the upcoming corrected candidate. Dev server closed by user request; do not restart without need/authorization.

## Revised motion acceptance
Visual surface begins exactly at circular trigger bounds and continuously morphs into the locally anchored panel with GSAP; button/icon transition is coordinated, not a separate visible button over a fading window. Content uses natural stable dimensions and reveals via clipping/mask and staged motion without scaling glyphs. Reverse returns to circle, rapid interruptions remain coherent. No fixed/portal or dependency changes.

## Latest correction handoff
Worker removed FilterPanel overflow-y-auto and replaced panel scale with width/height/radius GSAP morph plus independent clipped content reveal. 8 focused / 20 total tests pass; check/test/build and diff --check pass, large chunk warning remains. Worker status partial because browser acceptance unverified. Independent verifier now inspecting interaction regressions, especially autoAlpha-hidden trigger losing click/focus usability. Source T1 not marked complete until that review returns.

## Morph verification blockers
Independent verifier observed source defects: trigger autoAlpha=0 removes visibility/click/focus access to only pin/unpin control; reverse completion disables pointer events but leaves panel autoAlpha=1 visible. Content max-w-full may reflow under animated parent width. 20 tests/check/test/build/diff --check passed but fake GSAP missed rendered visibility semantics. Correct with retained reachable toggle, full closed-state reset, and stable measured content width; add explicit regressions.

## Latest blocker correction
Worker retained visible native button/focus ring and animates decorative surface/icon only, resets panel on reverse completion, and locks measured content width. Enhanced fake GSAP observed RED on hidden button/visible closed panel/content sizing, then GREEN: 21 tests pass; check/test/build/diff --check pass, existing chunk warning. package test confirmed aliases check. Visual acceptance still unverified. Independent correction recheck running; T1 remains in progress until results.

## Latest native review
New candidate review-dc0bfc4451f5ccb8 approved; exact acknowledgement completed and consumed authority. Non-blocking informational R3-001 at InfoPopover.astro:67; no correction offered. This is code review, not browser visual evidence. Independent final command/interaction recheck still running.

## Real browser verification authorized
User requests playwright-cli visual/behavior checks without added tests. Global CLI is available; prior tooling-unavailable claim was incorrect. Port 4321 belongs to sibling hero-layered-hills worktree; do not touch. Parent started correct project server at http://localhost:4322/ (PID 772851), HTTP 200. Leave running for human. Named browser verification session caluz-popover-visual delegated; close owned browser after checks. No new tests or source writes authorized by this verification request.

## New user browser failures
User observes fully gold circle with no icon, morph still not continuous, repeated/alternating hover breaks popovers. Browser verifier tasked with reproducing. Parent source hypotheses: unscoped group-hover inherits outer map group; absolute decorative surface covers unpositioned SVG; resetPanel hides panel but reused timeline only sets autoAlpha=1 in initial FROM, risking hidden reopens; p-4 can prevent true trigger-sized panel geometry. These require browser confirmation. No new tests permitted.

## Confirmed real browser failures and revised approach
Playwright confirmed nested map group-hover makes idle surface/icon gold; full close then reopen leaves panel opacity=0 despite expanded state/timeline progress=1; mobile 390px panel right=526.5px exceeds viewport. Rapid reversal before completed reset passed sampled sequence. Owned browser closed; server 4322 remains running. User recommends SVG circular gold-border surface morphing to rounded rectangle using GSAP MorphSVG and content-driven height. Installed gsap already contains MorphSVGPlugin.js; no dependency needed. Preserve absolute positioning, HTML content at stable type size; flip/shrink available local width to fit viewport without fixed.

## SVG implementation handoff
Worker rewrote only InfoPopover using installed MorphSVG, one silhouette with natural content height and bounded local placement, dynamic-content/resize measurement. Real browser worker confirmed idle border+icon, visibility on reopen, repeated/alternate interaction and reduced-motion; own session closed. check/test/build/diff --check pass, chunk warning persists. Mobile not established: trigger offscreen at390px and document width732px. Independent browser verifier now explicitly opening actual mobile drawer before geometry checks and attributing horizontal overflow; no acceptance claimed yet.

## Independent SVG browser evidence
Desktop1280x720: 5 hover-close cycles each plus alternation, pin/outside/Escape, reduced motion and rapid reversal pass. SVG bbox20x20 ->384x78 with intermediate geometry proves actual morph. DOM text expansion height77.5->737.25, stable14px font/22.75px leading and384px content width proves natural sizing/unscaled glyphs. Mobile390 drawer opened correctly: open popover right369.5 fits, but document732px. Isolation: popovers hidden732, drawer hidden528, both hidden390; separate closed popover overflow contribution must be fixed. InstrumentDrawer closed translation reaches732, unrelated baseline follow-up not authorized. Top/bottom right placements pass; left placements flip in current location, require sufficient-space browser fixture to verify. Owned session closed; preexisting session disappeared independently, no action taken. Server4322 running.

## Closed overflow correction evidence
Worker keeps panel wrapper trigger-sized20x20 closed with clipped absolute content/SVG; morph expands wrapper/silhouette to natural size. Real mobile390 with drawer DOM-only hidden: width390 closed/open/closed, panel right369.55. Browser fixtures all4 placements align to trigger; reduced-motion384x78->20x20; text height78->2762 with stable14px/22.75px typography. check/test/build/diff --check pass; chunk warning persists. Owned browser closed, server4322 active, drawer source unchanged. Independent final spot-check running.

## Current candidate review decision
Native START review-89ad1e925af913b0 returned consent-declined-this-candidate; no lineage created, no mutation. This exact SVG candidate is not natively reviewed; do not reuse earlier approval. Independent verifier already running, functional evidence remains required. Prior untracked fake-harness tests left untouched per user no-test instruction, excluded from this source-only review candidate; not rerun for SVG architecture.

## Final independent browser acceptance
At390x844, actual filters open with InstrumentDrawer temporarily DOM-hidden for isolation: document390px closed/open/closed/reopen; both real buttons5 full hover cycles each and20x20 reset pass. Desktop1280 repeated alternation passes. Centered DOM-only fixtures all4 placements anchor and fit viewport; fixture removed. No browser console errors (4 warnings). Owned session closed, server4322 retained. No new tests/source edits by verifier. This does not establish full-page mobile overflow removal with baseline drawer restored.

## Visual polish feedback
User confirms much better but screenshots show clipped circle/rounded panel edges, requests fine adjustment and suggests padding. Source has overflow-clip wrapper and 1.5px SVG stroke; inspect stroke-safe path geometry and clipping gutters. Avoid naïvely expanding wrapper beyond viewport or restoring closed full-size overflow. Scope component only, no tests.

## Next step
Apply bounded SVG stroke-safe correction, verify magnified edges and mobile overflow on4322. Separate drawer follow-up still requires authorization. Earlier test file remains untouched. Commit evidence: not applicable; commits explicitly disallowed without user request.
