# Iluminaconciencia Contribution Rules

## Language

- Public website and UI content is Spanish (professional, neutral Spanish).
- Technical documentation, README files, code comments, identifiers, and commit messages are English.
- Keep CALUZ and proper names unchanged.

## Architecture

- Astro owns the static shell and content.
- Use React only for a justified interactive island.
- Do not change the architecture, visual language, GSAP, dependencies, or project structure without explicit direction.
- Do not make deployment, AWS, or map-provider decisions without explicit direction.

## Styling

- Tailwind utilities required. Prefer native tokens; approximate arbitrary dimensions to the nearest fixed token. Custom tokens only for meaningful, reusable design values. `<style>` only when technically unavoidable; justify the exception in code.

## Development

- Before starting any dev server, check whether the expected port is already listening. Reuse a working server; never start a duplicate.
- Minimum verification: `pnpm check`, `pnpm test`, and `pnpm build`.
- Do not deploy, commit, or stage changes unless explicitly requested.

## Testing
- We are not implementing testing in this project
- Use playwright-cli to test and interact with browser
