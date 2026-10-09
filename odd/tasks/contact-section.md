# Contact section

## Intent
Add a static contact section after NewsArticlesSection on the home page. Reuse SectionHeading and existing styles. Resolve the existing #contacto navigation target. No form, backend, global styling changes, or hero animation changes.

## Scope
- app/(home)/_sections/contact/ContactSection.tsx
- app/(home)/page.tsx

## Tasks
- [x] T1 Implement and integrate the static contact section (delegated writer; revised placement and heading; lint and typecheck passed).
- [x] T2 Verify code and responsive presentation (independent verifier; build and desktop/mobile checks passed).

## Acceptance
Use the supplied Spanish paragraphs, Benavente 980 - La Serena - Chile, and iluminaconciencia@userena.cl with mailto. Use a semantic section with id contacto and a labelled shared heading. Shared SectionHeading eyebrow: 04 / CONTACTO; title: Contáctanos (not uppercase). Preserve heading component styles without overrides. Two columns on desktop, stacked on mobile. Preserve existing sections and hero behavior.

## Checks
No test script was found during exploration. Static content has no meaningful unit-test RED; use lint, typecheck, build and browser checks when available. Native review unavailable: gentle-ai command not found. Commits require explicit user authorization and will not be created.

## Delivery
Forecast: under 150 authored changed lines; single focused change, no publishing.

## Evidence
Initial git status clean; branch main. Planning explorer mapped shared heading and section conventions. First writer implemented former placement and passed pnpm lint and pnpm typecheck. User revised placement and heading before verification; T1 remains in progress. Writer preserved unrelated BrandStarIcon.tsx changes.

## Next step
Functional implementation verified; ready for human inspection. Native review remains pending: inspect requires intended-untracked selection, and the candidate also contains unrelated tracked header/icon changes. No START performed to avoid expanding review scope without user decision.

## Final verification evidence
- pnpm lint and pnpm typecheck passed (writer).
- pnpm build passed (independent verifier).
- Browser desktop 1280px: two columns; mobile 390px: stacked. No horizontal overflow. Heading defaults preserved; title text-transform none.
- Contact navigation initiated in-page scrolling; URL remained without hash.
- Browser: zero errors, four warnings (not diagnosed). Verification browser closed; existing server preserved.
- Unrelated BrandStarIcon/header/NavLink changes preserved. No commits made.
- Native facade is callable despite shell CLI absence. Assessment failed on undeclared untracked paths; inspect also exposes a mixed workspace candidate. Native review pending, not approved.
