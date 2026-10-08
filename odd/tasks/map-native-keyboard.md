# Map native keyboard navigation

## Scope
Remove map overlay Escape/Tab interception; retain initial/return focus, native controls, inert, ARIA and state transitions. Preserve pre-existing working-tree edits. No commits authorized.

## Tasks
- [ ] 1. Remove custom key handlers and component wiring: applied and independently verified; formal closure blocked by baseline typecheck failure.
- [ ] 2. Verify scoped changes: checks executed; overall validation blocked by baseline typecheck failure and native review scope.
- [ ] 3. Resolve pre-existing MapExplorer / MapCanvas prop mismatch and isolate native review candidate, only with separate authorization.

## Evidence
Writer: scoped changes 5 insertions / 68 deletions versus pre-edit state across useMapOverlays.ts, MapExplorer.tsx, FilterPanel.tsx, InstrumentDrawer.tsx. Removed key handlers and wiring; focus refs/calls and inert/ARIA preserved. No runnable test runner found, so no RED/GREEN evidence claimed.
Independent verifier: scoped ESLint and git diff --check passed. TypeScript reports only MapExplorer.tsx:60 mapStyle not declared in MapCanvasProps, same as writer's before-edit baseline.
Browser: existing localhost:3000, viewport 390x844. Filters focus close button on open; Escape does not close; Tab navigates natively; closing restores opener focus. Drawer Escape does not close; Tab exits drawer; Enter opens/closes and focus returns to marker. Zero console errors, four warnings. Browser session closed. Generated .playwright-cli outputs remain.
Native assessment: unassessable, independent verifier required and completed. INSPECT blocked on intended-untracked selection (task document); projected candidate also includes unrelated pre-existing edits. No START, approval or closure claimed. No commits or publishing.

## Status
Requested keyboard handler removal applied and verified. Subsequent user-authorized Marker type fix changed onSelect/openDrawer trigger to HTMLElement and passes event.target.getElement(). Independent current-state TypeScript, scoped ESLint and diff checks now pass; prior mapStyle error is no longer present. Tasks 1 and 2 verification complete; task 3 remains pending only for review isolation. No browser verification of the subsequent Marker type adaptation; earlier button-based browser evidence does not validate the current buttonless marker's keyboard/focus behavior. Native INSPECT remains blocked on untracked selection and includes unrelated edits. No native approval or commits. Existing branch migration/nextjs16 preserved.
