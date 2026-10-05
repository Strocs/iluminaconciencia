# Next.js Migration

## Objective and rationale

Migrate the current Iluminaconciencia Astro site to the latest stable Next.js 16+ while preserving Spanish content, visual identity, routes, data, GSAP/WebGL behavior, and the MapLibre experience. Keep execution recoverable and changes reviewable in independent work units.

## Authorization and isolation

- User approved implementation after the architecture plan.
- Worktree: `/home/strocs/dev/iluminaconciencia-worktrees/nextjs16`.
- Orphan branch: `migration/nextjs16`; it must not inherit existing history.
- Source snapshot: `3dc143b52f6003c1228d3cb93a0b236ef133ebfa` from the original `main`.
- User explicitly selected a root commit containing the Astro baseline, followed by migration commits by stage.
- Preserve the original checkout's modified `AGENTS.md`, untracked `odd/tasks/info-popover-local-anchor.md`, and existing worktrees. Carry the current contribution rules deliberately into this worktree; do not import unrelated local task progress.
- No push, pull request, merge, AWS provisioning, or deployment is authorized.
- Ask the user before resolving ANY ambiguity. Workers return unresolved decisions to the parent; recommendations never constitute approval.

## Agreed architecture

- Next.js App Router, server-first composition, server runtime available; no static export.
- Enable `cacheComponents: true` in `next.config.ts`.
- Use `use cache`, `cacheLife`, and tags only for identified caching needs; appropriate Suspense boundaries for uncached asynchronous/request-dependent work. Preserve prerendering eligibility of static content.
- Keep `src/features`, `src/shared`, `src/styles`, and public asset URLs; add `src/app` for routing/layout.
- Preserve Tailwind CSS v4, native utilities, fonts Baskervville/Ubuntu, and Spanish public UI. Technical documentation, identifiers, and commits remain English.
- GSAP core plus `@gsap/react` and `useGSAP`; scoped animation lifecycle, no monolithic or direct component `useEffect`. Explicit cleanup for non-GSAP resources.
- `visgl/react-map-gl`, imported via `react-map-gl/maplibre`, with the existing MapLibre engine/provider configuration. React owns UI state/events; reuse pure engines and data transformations.
- SST is the intended deployment tool; AWS is probable, not permission to provision. Verify the exact Next/SST/OpenNext combination and Cache Components behavior before claiming deployability.
- User requires durable persistent runtime cache shared across instances from the start. Default runtime `use cache` memory is not sufficient. Verify the composable handler, storage and coherent invalidation; do not assume CDN/incremental caching is equivalent. Any cache infrastructure choice requires user input and AWS operations remain unauthorized.
- Keep local instrument/news fixtures, including the tracked development snapshot. No backend or new product features.

## Checks and routing policy

- The project explicitly does not add automated tests. Do not introduce a test framework or fabricate RED/GREEN evidence. Keep the existing `test` alias semantics documented.
- Required applicable commands: `pnpm check`, `pnpm test`, `pnpm build`; include lint/type/format checks appropriate to the changed unit.
- Browser verification uses `playwright-cli`. Do not start a duplicate server; check ports first and obtain permission before opening a new server under the user's existing preference. Close only agent-owned browser sessions.
- Prefer bounded package workers for all multi-file implementation; allowed edit surfaces and exact verification commands must be supplied per task. External/expensive independent verification goes to `gentle-ai-verify`.
- Native review follows the user-owned review switch and candidate-scoped consent. Its availability is not assumed; `gentle-ai` is currently absent from the parent shell PATH. Tests/builds remain required regardless of review.
- A missing or unusable native assessment is verified conservatively as high risk; no invented review verdicts or receipts.
- About 400 authored diff lines per work unit is a planning heuristic, not a cap. Do not split incoherently or minify to fit it.

## Review workload and delivery

- Imported baseline source is existing product code, not newly authored migration behavior; record it separately from migration diffs.
- Initial estimate: 3,000–7,000 authored migration diff lines, excluding generated files/lockfile and the imported snapshot. Refine after implementation mapping.
- Delivery strategy: `single-pr`, explicitly selected by the user after the oversized-delivery menu. Whole future PR scope: this migration and its work-unit commits on the independent history. No chain strategy applies; do not ask again for chaining. Review-load/feedback/rollback risk explained and accepted as a delivery shape, not a repository-policy exception or publication permission.
- First baseline commit has no parent; later unit comparisons use their preceding boundary. A conventional PR against the old `main` has no shared ancestor and cannot be assumed to work normally.

## Tasks

- [x] T01 — Prepare and verify the isolated Astro root baseline; commit it without parents. **Complete**.
  - Route: parent Git/state/tracking and mechanical rule copy; delegated verifier for install/check/build.
  - Acceptance: original checkout unchanged; isolated source/assets match agreed baseline except contribution rules and this feature document; baseline check/test/build results observed; root commit identity recorded.
- [x] T02 — Validate exact Next.js/SST/OpenNext versions and Cache Components support; resolve compatibility ambiguities with the user. **Complete: investigation and decisions, not deployment proof**.
  - Route: delegated read-only compatibility exploration and bounded local verification.
  - Acceptance: stable version evidence, adapter support evidence/limitations, agreed cache requirement, and local proof strategy recorded. User chose Next 16.3.8/SST 4.17.1/OpenNext 4.1.8 override and requires shared persistent cache. Specific infrastructure and AWS verification remain separately authorized.
- [ ] T03 — Establish Next.js toolchain, App Router shell, Tailwind, fonts, aliases, metadata, and equivalent scripts. **Paused: font and ESLint blockers; partial source edits**.
  - Route: delegated writer; multi-file foundation.
  - Acceptance: `cacheComponents: true`; shell compiles/builds; language/fonts/assets retained; no browser API evaluation on the server.
- [ ] T03B — Resolve font-loading and ESLint compatibility blockers with baseline evidence and explicit user decisions. **In progress**.
  - Route: scoped read-only verifier for actual baseline font/peer evidence; bounded writer after human choices.
  - Acceptance: clarify actual requested/loaded weights and approved loader strategy, resolve declared ESLint peer compatibility without silent version changes, then required checks and a work-unit commit (may share the coherent T03 foundation commit). No visual parity claimed from types alone.
- [ ] T04 — Migrate local data, static content, and shared interactions.
  - Route: delegated writer; feature/shared TSX and loader adaptation.
  - Acceptance: no Astro/Vite-only data imports; equal fixture output; header/navigation/popover keyboard/focus behavior preserved without direct effects.
- [ ] T05 — Migrate hero orchestration with `useGSAP`, preserving GSAP/WebGL engines and responsive behavior.
  - Route: delegated writer; hero client lifecycle.
  - Acceptance: scenes, Bortle scale, pollution and sky preserved; animation/resource cleanup and reduced motion verified.
- [ ] T06 — Migrate MapLibre orchestration with `react-map-gl/maplibre`.
  - Route: delegated writer; map view and UI state.
  - Acceptance: map, markers, filters, counts, drawer, focus, mobile behavior and resize coordination preserved; no duplicated map ownership.
- [ ] T07 — Integrate SST/OpenNext configuration and validate the local production adapter path and cache expectations.
  - Route: delegated writer plus verifier; no cloud mutations.
  - Acceptance: explicit OpenNext 4.1.8 override, release-backed composable handler with persistent shared storage and coherent invalidation, successful local adapter build/probes, secrets excluded. Storage infrastructure choices must be clarified; AWS cache/streaming verification remains pending without authorization. Do not claim the shared-cache requirement fulfilled solely from local build.
- [ ] T08 — Remove obsolete Astro files/dependencies and update project documentation and contribution rules.
  - Route: delegated writer; scoped cleanup.
  - Acceptance: no runtime/config dependence on Astro; no unapproved structural or provider changes; clean install and required checks pass.
- [ ] T09 — Verify full production/browser parity and close migration work units.
  - Route: delegated verifier and parent synthesis.
  - Acceptance: check/test/build and approved browser checks observed; differences/limitations documented; work-unit commits recorded; no unapproved publication or deployment. Shared persistent cache behavior must be proved on an authorized multi-instance production path before claiming that requirement complete; local app parity may close separately with the cloud criterion explicitly pending.

## Progress and evidence

### T01

- Worktree created with `git worktree add --detach ... 3dc143b...`, followed by `checkout --orphan migration/nextjs16`.
- Git automatically populated/staged the original tracked source for the initially unborn branch; the authorized root commit now exists.
- Original checkout still reports only modified `AGENTS.md` and untracked `odd/tasks/info-popover-local-anchor.md`.
- Inventory: 25 tracked `.astro` files and tracked `tmp/mocks/iluminaconciencia-snapshot.json`.
- Current contribution rules include no new automated tests and browser checks using `playwright-cli`; the tracked snapshot predates those local additions.
- Verifier `muvf4kxu-5-d7gc`: Node v26.10.0, pnpm 12.8.1; frozen install passed (460 packages, lockfile unchanged).
- `pnpm check` and `pnpm test` passed: 72 files, zero errors/warnings/hints. `test` delegates to `check`, not an automated test suite.
- `pnpm build` passed: one static page. Pre-existing Vite chunk-size warning (>500 kB) remains; no optimization authorized at baseline.
- Verifier source comparison and parent spot-check `git diff --check 3dc143b...` passed. Only deliberate AGENTS changes differ from source snapshot; new task document is the only untracked file.
- Parent confirmed worktree AGENTS equals the current original AGENTS exactly; original checkout status unchanged.
- No server or browser started; no functional/browser parity claimed.
- Native assessment against original snapshot: medium risk, 2 paths/101 diff lines, `reviewDue: false`, `under_budget`; RDD on, outcome unknown, large runtime writer profile. No separate verifier required by returned plan; independent baseline verifier and parent readback already completed. No native approval/receipt claimed.
- Work-unit commit: `a4b400fd3e36ffa62fa296b8322479730ef15d7f` — `chore: establish isolated Astro migration baseline`. `parents` is empty; worktree was clean immediately after commit.

### T02

- Verifier `muvff99i-6-1su8` completed all five authorized read-only registry commands successfully; no application/toolchain migration writes, installs, or build probes.
- Published versions: Next 16.3.8; SST 4.17.1; OpenNext 4.1.8; @gsap/react 2.1.2; react-map-gl 8.1.3.
- Released SST v4.17.1 `platform/src/components/aws/nextjs.ts` selects OpenNext 3.9.14 for Next 15+; the explicit adapter version is not yet selected by the user.
- OpenNext 4.1.8 declares Next peer `>=15.5.27 <16 || >=16.3.8`; released composable-cache handler/PPR/route-cache code contains Next 16 adaptations. This is implementation evidence, NOT end-to-end compatibility proof. Equivalent Cache Components support in SST's default adapter was not established.
- Published streaming wrappers exist, but neither selected wrapper behavior nor AWS streaming/cache semantics has been verified.
- User explicitly approved Next 16.3.8 + SST 4.17.1 + OpenNext 4.1.8 override for validation, and durable persistent runtime cache shared across instances from the start. These choices do not authorize infrastructure resources or AWS operations.
- Local production-adapter build and explicit Cache Components runtime checks remain pending after version/configuration approval. AWS verification remains separately authorized.
- Sources: https://github.com/sst/sst/blob/v4.17.1/platform/src/components/aws/nextjs.ts ; published npm metadata/tarball for @opennextjs/aws@4.1.8 ; https://opennext.js.org/aws/compatibility (outdated table, insufficient proof).
- Status: release/version investigation complete; agreed local proof strategy is a bounded Cache Components app/adapter build, then cache handler/storage/invalidation checks. Real multi-instance AWS proof is separately authorized and cannot be inferred from local probes. Infrastructure choice remains open; no dependency downgrade/cache disabling/infra assumption made.
- User explicitly selected `single-pr` for eventual delivery; retain stage/work-unit commits, do not initiate PR creation or a branch chain.
- Documentation-only evidence update: meaningful RED/GREEN is not applicable; all registry commands passed, parent structural readback/diff checks apply. No additional framework build success claimed.
- Work-unit commit: `4830fb19163d780fe61406698fdcf385771f0115` — `docs: record Next cache and adapter migration decisions`.
- Parent structural readback/diff check passed. Native assessment against root: passive, 1 path/40 diff lines, `reviewDue: false`, `passive`; structural readback only, no tests/verifier needed. No native approval claimed.

### T03

- Route: bounded package writer; multi-file toolchain and shell migration. Preserve old Astro source as reference until later cleanup; no hero/map runtime migration in this unit.
- Pin Next 16.3.8, @gsap/react 2.1.2, react-map-gl 8.1.3 and local OpenNext 4.1.8 build tooling. SST configuration and cloud resources remain T07/explicit clarification.
- Intermediate Next shell must not be presented as complete page parity; no generic starter content or invented Spanish copy.
- Planned verification: install/lock consistency, check/test/build, lint/type checking, bounded local adapter build when supported; no server/browser/cloud operations.
- Test-first fallback: project prohibits new test implementation; toolchain/shell integration has no applicable existing deterministic test harness. Observe compile/build/structural checks rather than inventing RED/GREEN.
- No component may directly import/call useEffect; preserve server/client boundaries and source algorithms.
- Writer `muvg6m0c-7-bf20` returned **interaction_required** after initial toolchain/shell edits and `pnpm install --lockfile-only`; no required compile/build/functional verification has run.
- Initial changes: package/lock/workspace, TS/Next/PostCSS/ESLint/output config, app layout/page/not-found, Background/Header JSX, AGENTS and README. Existing Astro source remains untouched; no full parity or cache deployment proof.
- pnpm automatically added only `@opennextjs/aws@4.1.8` to `minimumReleaseAgeExclude` in workspace policy. Existing `astro@7.2.1` exclusion and build permissions remain unchanged. Parent readback/diff confirmed the exact added line.
- User explicitly approved retaining the exact `@opennextjs/aws@4.1.8` age exclusion and continuing T03. Approval does not cover other versions/packages, wildcard policy, extra install-script permissions, or security guarantees. Any further policy exception requires another human answer.
- Lockfile-only resolution warned about peers and deprecated glob@9.3.5; actual peer details and effect remain unverified.
- Native ASSESS over returned diff is unassessable due to intended untracked source declarations; no verdict/receipt. Returned plan treats risk as high, requiring writer self-verification plus an independent verifier after the block resolves. Declare intended source scope via proper inspect continuation when candidate is normalized, never invent provider bindings.
- Continuation `muvgrjn4-8-1chm`: `pnpm install --frozen-lockfile` failed with `ERR_PNPM_IGNORED_BUILDS`, requiring a new build-script permission for `unrs-resolver@1.12.2`. Remaining check/test/build/lint/tsc/OpenNext commands were not run.
- Parent readback confirmed allowBuilds still permits only existing esbuild/sharp; no new permission or global script bypass was applied. Installed package metadata for unrs-resolver 1.12.2 declares `postinstall: node postinstall.js`.
- User explicitly approved ONLY `unrs-resolver@1.12.2` in allowBuilds, preserving existing permissions. Enforce exact version scope; if pnpm cannot express it, stop for clarification rather than allow all versions/global scripts. This approval is separate from the previously approved OpenNext age exclusion.
- Known source follow-up within original scope: correct the Header JSX star path to match the original; header runtime, custom 404 copy, peer details, line count and page/cache parity remain unverified.
- Continuation `muvhjveb-9-63vr` added only `'unrs-resolver@1.12.2': true`; pnpm 12.8.1 accepted version-scoped permission and frozen install passed, including postinstall. Prior permissions/age exception preserved.
- Header JSX star path corrected to original SVG according to writer report; independent source/browser parity checks remain pending.
- `pnpm peers check` failed (exit 1): eslint 10.10.0 exceeds declared ranges of eslint-plugin-import 2.32.0, eslint-plugin-jsx-a11y 6.10.2 and eslint-plugin-react 7.37.5. No ESLint version/plugin change made; runtime incompatibility not yet demonstrated.
- `pnpm check` failed (exit 2) on next/font Google weight types: Baskervville supports 400/500/600/700, Ubuntu 300/400/500/700; Astro config requests 400/600/800. No accepted font source/weights change. Remaining required commands not run; no fabricated GREEN or meaningful TDD RED.
- Worker font menu: approve only Next-supported weights accepting a difference; approve non-next/font Google CSS accepting external loading; pause until approved font source/strategy. Before relaying, validate high-consequence premise that requested Astro configuration equals actual rendered weights.
- Status: **Blocked on font strategy and ESLint peer decision**. Source remains uncommitted; no server/browser/cloud actions.

### T03B

- Scoped read-only verifier `muvhzogf-a-sg3z` confirmed local baseline WOFF2 artifacts but its bounded output did not map faces. Parent spot-check: read refuses the 105.9 KB single HTML line; a read-only Python extraction of font-face blocks established the mapping without editing/rebuilding.
- Baseline Baskervville italic 400/600 both use `dist/_astro/fonts/2e9b4e94a1956668.woff2`; normal 400/600 both use `7f6f182cac4135c4.woff2`; Ubuntu normal 400 uses `4900cede8328fcb6.woff2`. Declarations use swap/Latin. No baseline 800 or Ubuntu600 face appears; physical axes and visual parity remain unverified.
- Reusing exact baseline WOFF2 bytes via local font loading is a potential closer-parity option, requiring approved durable source copies, correct licenses/provenance and browser proof. No font strategy or asset copy is approved yet.
- Registry evidence: stable ESLint9 candidate is 9.39.5; eslint-config-next16.3.8 peer >=9.0.0. Candidate satisfies the recorded plugin ranges, but lint runtime has not run. No downgrade/plugin update assumed.
- Same blocked writer `muvidrbt-b-m6f0` completed **question refinement only**, with no edits/installs/build/extra research. Its updated open-response envelope supersedes the original menu: local exact baseline WOFF2 with source copies/licenses/browser proof (recommended), Next-supported Google weights accepting a difference, external Google CSS, or pause/another strategy. Separate ESLint question: approve 9.39.5 pin or retain10.10.0 and investigate alternatives. Safe free-text proposals allowed; no selection/approval inferred.
- Initial refinement dispatch rejected a missing surface heading without launching; reissued with canonical narrow maximum surfaces and explicit read-only override.
- User font free-text direction: Next fonts sourcing Google, weight200/400/600/800 for both families. This conflicts with the retained families' Next16.3.8 loader definitions; no weight cast, fake downloaded faces, family switch, local asset copying, or fallback acceptance assumed. Clarify whether priority is current families, four real weights, or CSS-only weight values.
- User explicitly chose retaining ESLint10.10.0 and investigating compatible alternatives. No ESLint9 pin/plugin/config updates approved.
- Read-only verifier `muvixfs8-c-4p57`: `pnpm lint` (`eslint .`) exited2 with SourceCode.finalize TypeError `scopeManager.addGlobals is not a function`. Parser ownership is not established. Latest import2.32.0/jsx-a11y6.10.2/react7.37.5 releases still exclude10; Next preset's >=9 peer alone does not establish full-stack support. Tailwind plugin4.4.0 accepts10 but does not resolve other gaps.
- Continued read-only diagnostic `muvjgk9g-d-a4ra` to isolate Astro/Next TSX/TS parser behavior and inspect supported alternative config components. It failed at runtime startup timeout: **0 turns, 0 tool calls**, confirmed by one status query at this incident boundary. No extra commands/source changes occurred; no global config/environment workaround or automatic relaunch.
- Parent Git state remains expected uncommitted foundation plus progress document; generated `tsconfig.tsbuildinfo` appeared after the earlier type check and must be ignored/not staged in the eventual source candidate. Original main still only has its existing AGENTS/task changes.
- Read-only explanation requested by user: compared original and draft eslint.config.mjs plus package.json in one bounded batch. Original already uses flat config with JS/TypeScript/Tailwind/Astro recommended rules. Draft adds next/core-web-vitals preset and globalIgnores for .next/out while retaining the base/reference coverage; it is not a validated ESLint10 replacement recipe. Current direct @eslint/js10.0.1/typescript-eslint8.70.0 remain.
- Any manual Next-plugin/modern React/import/accessibility configuration is only a route to assess, not approved/proved compatible. Resolve actual parser failure and declared peer support; do not drop coverage or suppress peers silently.
- Status: **Waiting for font requirement clarification; further ESLint10 diagnosis interrupted**. Source/asset copying, compile/build recovery and shared coherent work-unit commit remain pending. No unsupported peers are suppressed as a substitute for compatibility.
- Work-unit commit: pending.

## Open decisions and blockers

- User selected the latest OpenNext override and requires shared persistent cache; exact storage/handler infrastructure choices and local/end-to-end Cache Components behavior still need validation. Do not downgrade Next, disable Cache Components, or accept process memory as meeting the cache requirement silently.
- Oversized delivery shape is resolved as one future PR. Its compatible destination remains a publishing-time decision because the old main has no common ancestor; no PR/push/merge is authorized.
- AWS region/account/domain, remote cache resources, deployments, and cloud validation are not authorized.
- Browser baseline/production validation needs explicit server permission if no suitable server is already available.

## Next action

Launch the bounded T03 Next foundation writer with exact verification and allowed surfaces. The foundation is intermediate and must not claim complete feature parity or shared-cache deployment proof. Stop for any ambiguity/required out-of-scope edits; cache infrastructure choices require later explicit clarification and no AWS mutation is authorized. Reconcile this file, its full Engram mirror (`odd/nextjs-migration/tasks`), and visible TODO projection after every transition.
