# Home points DAL

## Approved requirement
Use the existing snapshot as a simulated API response in every environment. Add server-only `app/(home)/_dal/getPoints.ts`, exposing async `getPoints(): Promise<MapMark[]>`. Keep the existing MapMark UI contract and snapshot projection semantics. No endpoint, artificial delay, cache, dependency, UI behavior or test suite additions. Remove the mock and obsolete loader after consumer migration. README remains untouched. Implementation authorized; commits and publishing are not requested.

## Tasks
- [x] Implement the home-owned DAL and update MapSection; preserve the snapshot and all mapped fields. Worker structural checks and formatting passed; snapshot copied byte-identically (SHA-256 cdf24f40c093e22056a08098eea719f160164630b49bb340612e4f6ed74ac1ad).
- [x] Remove the obsolete mock and loader after confirming no remaining consumers. Parent checked imports and exact HEAD equality before deleting old marks.ts, mock and duplicated old snapshot; DAL copy retained.
- [x] Independently verify 37 points in both environments, server-only boundaries, formatting, strict lint, types and production build. Actual transpiled getPoints execution matches the original 37-point snapshot projection in both environments. Initial import-path failure corrected; focused strict ESLint, formatting, TypeScript, diff check and production build now pass. Production HTML/RSC contains all 37 points and mapped fields; source-only response fields are absent, as are snapshot IDs/names/URLs from the 10 inspected browser JS chunks. Global strict lint still reports five pre-existing Hero warnings (Hero files unchanged from HEAD); no out-of-scope fix. No browser run, new tests, commit or push. Native review remains pending.

## Evidence
Baseline worktree clean on main. Existing MapSection awaits loadMapMarks; development uses 37 snapshot stations, production uses 5 mock records. Preserve concurrent human improvements. No meaningful existing deterministic runner established; no new tests under project policy. Use independent data/structural and build checks, with explicit limitations.
