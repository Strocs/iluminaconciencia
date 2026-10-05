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
- [ ] T02 — Validate exact Next.js/SST/OpenNext versions and Cache Components support; resolve compatibility ambiguities with the user. **In progress**.
  - Route: delegated read-only compatibility exploration and bounded local verification.
  - Acceptance: stable version evidence, adapter support evidence/limitations, agreed cache requirement, and local proof strategy recorded. User chose Next 16.3.8/SST 4.17.1/OpenNext 4.1.8 override and requires shared persistent cache. Specific infrastructure and AWS verification remain separately authorized.
- [ ] T03 — Establish Next.js toolchain, App Router shell, Tailwind, fonts, aliases, metadata, and equivalent scripts.
  - Route: delegated writer; multi-file foundation.
  - Acceptance: `cacheComponents: true`; shell compiles/builds; language/fonts/assets retained; no browser API evaluation on the server.
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
- Work-unit commit: pending documented decision checkpoint.

## Open decisions and blockers
- User selected the latest OpenNext override and requires shared persistent cache; exact storage/handler infrastructure choices and local/end-to-end Cache Components behavior still need validation. Do not downgrade Next, disable Cache Components, or accept process memory as meeting the cache requirement silently.
- Oversized delivery shape is resolved as one future PR. Its compatible destination remains a publishing-time decision because the old main has no common ancestor; no PR/push/merge is authorized.
- AWS region/account/domain, remote cache resources, deployments, and cloud validation are not authorized.
- Browser baseline/production validation needs explicit server permission if no suitable server is already available.

## Next action
Commit T02's documented compatibility decisions, then launch a bounded T03 Next foundation writer with exact verification and allowed surfaces. The foundation is intermediate and must not claim complete feature parity or shared-cache deployment proof. Cache infrastructure choices require later explicit clarification; no AWS mutation. Reconcile this file, its full Engram mirror (`odd/nextjs-migration/tasks`), and visible TODO projection after every transition.
