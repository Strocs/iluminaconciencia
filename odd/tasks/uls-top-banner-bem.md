# ULS banner and hero integration

## Outcome
- [x] T1: Native nav-userena BEM banner with standalone CSS, original #0F3063 background, max1800 container and100/40/20px padding, row space-between/gutters/15px bottom margin; unused offset removed.
- [x] T3: Banner normal-flow above Header; measured header offset disappears as banner scrolls away, menu reset/restore verified.
- [x] T4: Inner hero fixed state follows existing ScrollTrigger top-top callbacks/refresh, persists after timeline end; moving mask unchanged. User confirmed desired behavior. Extra RAF/scroll listeners removed.
- [x] T2: Left logo remains intrinsic129.875x50; right scales proportionally at320/390 with no overflow. Desktop1280 and independent mobile checks passed.

## Checks and evidence
Final independent verifier: pnpm typecheck, focused ESLint for all changed TSX/hooks/timeline files, and git diff --check passed. Browser baseline/after checks established responsive logo ratios and isolated banner styling without Tailwind/Preflight. Prior failed DAL typecheck imports disappeared after user deleted obsolete app/_dal/getPoints.ts. No production build run.

## Scope and delivery
Preserved human edits and rename to app/_shared/uls/nav-userena/NavUSerena.tsx. User explicitly authorized committing ALL pending changes including DAL deletion and updating local main; no push. Current branch refactor/link-class-composition is one commit ahead of main with no divergence. Commit then fast-forward main; include existing link refactor commit. Conventional message: feat(uls): add institutional banner and integrate hero scrolling.
Native assessment was unavailable because untracked scope was undeclared; no native review lineage or approval. Independent checks completed; no review approval claimed. Commit identity is recorded in session memory after delivery.
