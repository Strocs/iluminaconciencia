<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Module exports

Use named exports and named imports for owned application code. Keep external package APIs unchanged; framework-required default exports (such as Next.js pages/layouts and configs) and default imports for assets are exempt.

## Genneral Rules

DONT write tests.
DONT create branches for new features, just commit to main.
DONT do visual verification with playwright unless user tells you to do so.

## Styles
For conditional classes use cn() utility function. DONT use template strings.
ONLY use css modules to override styles from a external package, for inner components prefer tailwind

## Data Fetching and Server Composition

- Call data-fetching functions only from Server Components, as close as possible to where the data is consumed.
- Let the consuming Server Component obtain its own data. Do not hoist queries into pages, layouts, or parent components solely to pass the results through props to another Server Component.
- Avoid wrapper components unless they provide a necessary, concrete responsibility. Do not introduce wrappers just to fetch data or forward props.

## Colocation and Module Organization

Follow [README architecture](README.md#arquitectura) when changing structure, composition, or dependencies. Do not add unnecessary layers.

- Keep all application code within `app/`, following a **colocation-first** approach.
- Place components, hooks, DAL, and utilities as close as possible to their consumers, using private folders (`_components/`, `_hooks/`, `_dal/`, etc.).
- When multiple routes share a module, move it to their **lowest common ancestor**, avoiding premature global abstractions.
- **Preserve functional ownership:** if shared code belongs to a specific domain or feature, group it within a dedicated feature module instead of placing it in generic shared folders.
- Use `_components/` for presentation components, not complete functional modules.
- Use `_features/<module>/` for reusable functional modules that own composition, logic, and data consumption. Keep their internal components colocated within the module.
- Keep shared modules independent of route-specific implementations. Avoid circular dependencies and unnecessary coupling.
- Prefer simple, local structures; introduce additional abstraction only when actual reuse or complexity justifies it.
