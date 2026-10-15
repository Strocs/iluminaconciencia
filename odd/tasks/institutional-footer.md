# Institutional footer

## Objective and scope
Reproduce the supplied institutional footer screenshots as an isolated server component in app/_shared/uls/footer/, integrated after page children. Bundle original graphic assets and licensed Roboto Regular WOFF2 via native CSS @font-face, without next/font or external runtime requests. Preserve source links and Spanish institutional copy, three bands, responsive stacking, textured background and graphic proportions. Add accessible link names and keyboard focus. Exclude the global back-to-top control.

## Constraints
No tests (creation or execution), no visual/browser verification, per explicit user request. Nonvisual lint, typecheck and production build only. No commits without explicit request. No unrelated edits. Existing analysis: reference https://iluminaconciencia.userena.digital/; footer HTML and /static/css/custom.css?ver=0.4 define content/style. Screenshots supplied in conversation are visual authority. Roboto is locally rendered in user's browser; package Regular locally for consistency. Preserve accreditation graphic dates rather than inventing updated claims.

## Tasks
- [x] F1 (done): Implement isolated footer, source original assets and font with license, and integrate root layout. Worker lint/typecheck/build passed; parent identified and worker corrected accreditation URL and narrow-screen social wrapping. Post-correction lint/typecheck passed.
- [x] F2 (done): Independent verifier passed pnpm lint, pnpm typecheck, pnpm build and git diff --check after corrections. Confirmed local font/assets, scoped CSS, server component and layout placement. No tests or visual/browser checks were performed, as requested. Native review approved and acknowledgement completed for review-ebafd9e7b42e02b2.

- [x] F3 (done): Applied user desktop feedback: top bar two equal columns with left-aligned partners, max1800 and responsive100/40/20px desktop padding; separators18px #9ba0b8; centered max1440 institutional block without first-column inset; list line-height22px and separator margins10px; logo padding0px top15px bottom. Worker pnpm lint and pnpm typecheck passed; parent git diff --check passed and corrected remaining partner alignment. Native code review approved and acknowledged review-911712e043196606 after final CSS correction. No tests/browser checks; no build rerun for this bounded refinement. Await user visual feedback; no commits.

## Acceptance
All three bands and original destinations present; local font/assets; no Bootstrap/client state or global font changes; responsive layout with no fixed footer height; named export. Available nonvisual checks pass or blockers reported. Visual fidelity remains explicitly unverified pending user feedback.

## Evidence and next step
Initial worktree clean on main. Native review facade available despite shell CLI absent. Initial assessment unavailable pending untracked selection; independent verification completed. Native review approved and acknowledged (review-ebafd9e7b42e02b2); this did not create a Git commit. Commit evidence: not applicable, user has not requested commits. Implemented Footer.tsx, footer.css and bundled graphics/font/license, integrated app/layout.tsx. Fixed original relative PDF URL to absolute source and allowed social wrapping at narrow widths. All authorized nonvisual checks passed. Next: user visual feedback; appearance intentionally unverified.
