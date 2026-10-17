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

## Data Fetching and Server Composition

- Call data-fetching functions only from Server Components, as close as possible to where the data is consumed.
- Let the consuming Server Component obtain its own data. Do not hoist queries into pages, layouts, or parent components solely to pass the results through props to another Server Component.
- Avoid wrapper components unless they provide a necessary, concrete responsibility. Do not introduce wrappers just to fetch data or forward props.
