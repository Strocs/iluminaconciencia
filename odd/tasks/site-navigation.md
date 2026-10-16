# Site navigation

## Objective
Create basic section pages and clean home-section URLs without hash fragments.

## Scope and constraints
- /noticias, /articulos, /multimedia, /equipo, /recursos, /medicion, /medicion/tabla-de-datos, /medicion/[punto-id].
- /explorar and /contacto render the complete home and navigate to their respective sections on link activation or direct entry. Manual scrolling never changes the URL.
- Hero: Quiénes somos -> /equipo; Qué hacemos -> /medicion; Explorar el mapa -> /explorar.
- Reuse the existing section-heading component and Spanish UI conventions.
- Preserve all pre-existing changes, especially home, layout and footer work.
- No new tests, no Playwright, no branches. No commits without explicit user request.

## Tasks
- [x] T1 (implemented; writer checks passed): Implement backed home-section routes and basic section pages; connect relevant navigation, CTA, listing and map links.
- [x] T2 (functional verification complete; limitations below): Independently verify types/lint/build where available and structurally inspect route/history behavior; resolve candidate-caused failures.

## Acceptance and checks
Direct requests/reloads resolve; full home available for aliases; clicks target the right section without scroll-driven URL updates; history is handled; static table path is not interpreted as a point; invalid point IDs have an appropriate not-found response. Existing UI remains intact. No content development beyond scaffolding.

## Evidence
Exploration: header uses hash links; hero CTA destinations are placeholders; map and contact IDs already exist. Existing Next version is 16.3.8. Writer reports pnpm lint, pnpm typecheck and scoped diff whitespace checks passed. Build and browser checks pending/skipped respectively. Parent spot-checked alias navigation controller. ASSESS could not classify the candidate because untracked files require explicit declaration; independent verification required. Worker also changed MapSection.tsx and ContactSection.tsx for focus/offset beyond originally enumerated surfaces; these changes are within the authorized feature, but the surface-boundary breach is recorded. No commits created (user authorization required). Test-first omitted under explicit project no-tests policy. Browser verification not authorized.

## Independent verification and corrections
- pnpm lint, pnpm typecheck, pnpm build, scoped git diff --check: passed.
- Production HTTP: all requested pages and aliases returned 200; unknown point returned 404, including reloads. Temporary server terminated.
- Browser checks not authorized; history/scroll only structurally inspected. HTML marker probe inconclusive; full-home reuse confirmed structurally.
- Correction writer implemented active-alias repeated click handling, scroll=false for alias links and canonical / metadata. Post-correction pnpm lint, pnpm typecheck, pnpm build and scoped diff whitespace checks passed. Final independent focused verification passed lint/typecheck and found no concrete blockers; same-path handling, modifier-click exclusions, scroll=false and canonical metadata confirmed structurally.
- Native CLI executable unavailable from shell. Facade INSPECT was available but stopped at intended-untracked selection; current projection includes unrelated pre-existing user changes. No START, scope selection or native approval performed.

## Next step
Functional implementation complete. Manual browser/history verification remains unperformed (not authorized). Native review remains pending explicit scope selection because the workspace includes unrelated pre-existing changes. CALUZ destination remains undefined and unchanged. No commits created.
