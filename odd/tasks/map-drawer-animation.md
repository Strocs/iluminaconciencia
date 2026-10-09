# Map drawer animation

## Implemented objective
Desktop drawer allocation participates in flex flow; ONLY its width animates, including the gap. Map viewport flexes automatically; actual map sizing stays tied to stable outer container via100cqw. Fixed drawer contents don't shrink. Mobile remains absolute right translate overlay. Desktop transparent/borderless; existing user styling preserved.

## Constraints and disposition
User requests ONLY lint/typecheck and human visual review; no browser/tests/build/independent verifier/native review. Candidate sha256:26c07ae9e66801b138c5b6becd5aed0280180d74da40123c3e4a9b6b05a5aa91 explicitly left automatically unreviewed under that instruction. No staging/commits/publishing. No JS sizing/animation or unrelated focus changes.

## Tasks
- [x] T1: Delegated worker implemented flow allocation in MapExplorer.tsx/MarkDrawer.tsx (multi-file/preparation). Removed manual map width subtraction/viewport transition; shared CSS sizing. No commit authorized.
- [x] T2: ONLY pnpm run typecheck and scoped eslint --max-warnings=0 MapExplorer.tsx/MarkDrawer.tsx executed; both passed.
- [ ] T3 (pending user): Human visual review of gaps, animation, width variable changes, map stability and mobile overlay.
- [ ] T4 (separate pending): Prior close-focus restoration failure not included.

## Configuration
MapExplorer.tsx: [--drawer-width:13.5rem] and [--drawer-gap:1rem]. Shared values determine fixed contents and desktop allocation. Only allocation width transitions desktop; mobile retains translate.

## Evidence and limitations
Writer reports two files changed, latest user design retained. No browser/unit tests/build/verifier run per explicit request; do not reuse old visual verification as current evidence. No comparative FPS claim or native approval. Actual rendered behavior awaits user review.

## Next step
User reviews current implementation; report any visual gaps before additional changes. No background agents running.
