# Restore hero horizon glow

Objective: Restore the bottom-origin, upward-fading hero pollution effect from cce3b70 while retaining today's warm gold palette and current Astro/GSAP architecture.

Problem: a342454 replaced the horizon wash with a high centered source and halo. The previous wash was gray and sank/faded on scroll.

Scope: only the hero light-pollution component, configuration, runtime capability, and directly applicable tests. Keep the current branch and preserve unrelated working-tree changes. No architecture, dependency, map, or deployment changes. Do not stage or commit without explicit authorization under AGENTS.md.

Acceptance: at initial progress the warm horizon is strongest at the bottom and fades upward, without a distinct upper source; at progress 0.8 it is absent and reversing scroll restores it; reduced-motion/static baseline remains usable. Use the current source gold #F6A967, adjusting supporting colors as needed.

- [x] T1 Restore bottom-origin warm gradient and adapt the existing GSAP capability. Focused `node --test tests/hero-horizon-glow.test.mjs` passed (2 tests), after an observed RED against the prior source/halo implementation. No commit: AGENTS.md requires explicit request.
- [x] T2 Run `pnpm check`, `pnpm test`, `pnpm build` and inspect the diff/working tree. All passed; `pnpm test` aliases `pnpm check`, and focused Node tests (2) passed separately. Generated CSS contains the expected bottom-up gradient. `git diff --check` passed. Browser visual comparison was not performed. Commit pending explicit authorization.

- [x] T3 Extend the warm gradient smoothly to the top edge (transparent at 100%) and reduce initial star opacity from 0.2 to 0.12; full-opacity progress remains 0.7. Focused test observed RED then GREEN (2 tests). User screenshot: /tmp/.wsl-screenshot-cli/c3480db4b71e52568939e917204727d6a4ad87633a7a36e7ce1f89fd1922107d.png.
- [x] T4 Repeat focused tests and required `pnpm check`, `pnpm test`, `pnpm build`; all passed, along with `git diff --check`. Built CSS has transparent 100% top stop. Browser comparison was not performed. Native review inspect blocked at untracked selection and its candidate also includes unrelated dirty map/instrument paths, so no review START was attempted.

Progress: T3/T4 verified and committed on `feat/map-hero-updates` as `a1b702a2b3cc63804f272c4dee8cb288a7b2fcc8` (`fix(hero): restore warm horizon glow`). Historical reference: cce3b70 (parent of a342454). Writer changed only three pollution files plus focused test, retained GSAP progress 0..0.8, and used warm #F6A967. Native risk assessment was unassessable due to unrelated untracked files, so independent verifier ran. `pnpm build` reported a >500 kB chunk warning, not attributed to this change. Next: user visually reviews mobile/desktop; no push/deploy requested.
