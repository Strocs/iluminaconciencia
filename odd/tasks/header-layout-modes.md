# Header layout modes

## Objective
Make the header solid by default on interior routes and hero only on home routes, with explicit server layout composition.

## Design and scope
- Root layout retains institutional navigation, background/providers and both footers; remove only its Header rendering/import.
- (home)/layout.tsx composes Header mode="hero" and children.
- (site)/layout.tsx composes default solid Header and children. Move existing interior route pages into this group without changing URLs.
- No SiteShell, middleware or pathname-based header-mode inference.
- Preserve existing hero thresholds and scroll-hide policy where applicable; clean up observers/state correctly.
- Preserve all pre-existing user changes, particularly root layout/footer migration.
- No tests creation, Playwright, branches or commits without explicit request.

## Tasks
- [x] T1 (writer implementation and checks passed): Add explicit header mode, group layout composition, and move interior routes without URL changes. Self-verify lint/types/build.
- [x] T2 (independent structural and HTTP checks passed): Independently inspect mode initialization/cleanup and verify build/routes without browser automation.

## Acceptance
Interior routes render solid header in initial HTML with no hero boundary dependency. Home and aliases retain transparent hero and solid post-boundary behavior. Switching groups does not retain stale hidden/region state. Root footers and institutional navigation remain common. Existing routes keep responding and invalid point remains 404.

## Evidence
Existing header starts data-region=hero and relies on a home-only sentinel; root layout renders global Header. Prior route implementation committed as 871c504. User explicitly selected layout composition without SiteShell. Writer lint and build passed. Typecheck initially failed due to stale generated route references after moves; pnpm exec next typegen refreshed these and typecheck then passed. No commits created. Native ASSESS requires intended-untracked declaration and returned unassessable; independent verification required. Test-first omitted under explicit no-tests project rule; browser checks not authorized.

## Independent verification
Lint, typecheck and scoped diff whitespace checks passed. Production HTTP verified one header per page: home aliases 200 with hero region and sentinel; interior routes 200 with post-hero region and no sentinel; unknown point 404. Compiled CSS solid-background rule confirmed. Observers/listeners cleanup and preserved thresholds reviewed structurally. Temporary server stopped after correcting initial CLI argument forwarding. Browser hydration/history/group transitions not exercised. No new tests or commits.

## Next step
Implementation verified within authorized checks. Browser transition verification remains unperformed. Native review remains unresolved due mixed pre-existing workspace scope and intended-untracked declaration. Home-navigation restructuring was discussed separately but is not authorized for implementation.
