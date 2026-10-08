# Map mark vocabulary

## Scope
Rename map representation terminology from Instrument to Mark. Retain one instrument per mark, current source data, IDs, filtering, Bortle values, UI copy and interaction behavior. Explicit instrument filter names clarify the distinction. Preserve all existing dirty edits. No commits authorized.

## Tasks
- [x] 1. Rename map record type, loader/projection, collections, selection, drawer and consumers; clarify instrument-specific field/filter names without changing cardinality. Writer baseline/after TypeScript, scoped ESLint and diff check passed. No commits authorized.
- [x] 2. Independently verify imports/types, leftover terminology, unchanged data/filter behavior and focused lint. TypeScript, map ESLint, diff check and reference scan passed. Final drawer id renamed to mark-drawer; scoped ESLint/diff/reference checks passed.

## Naming contract
MapInstrument -> MapMark; instruments (map records) -> marks; filteredInstruments -> filteredMarks; selectedInstrument -> selectedMark; nextInstruments -> nextMarks; loadMapInstruments -> loadMapMarks; projectInstrument -> projectMark; data/instruments.ts -> data/marks.ts; InstrumentDrawer.tsx -> MarkDrawer.tsx; MapInstrumentDrawer -> MapMarkDrawer. Record type -> instrumentType; filter types -> instrumentTypes; selectedTypes -> selectedInstrumentTypes; toggleType -> toggleInstrumentType; selectAllTypes -> selectAllInstrumentTypes. Retain station/source instrumentCode nomenclature and Bortle semantics.

## Plan and checks
Delegated single writer, multi-file rename under map section; report external consumers before widening scope. Forecast 200-350 authored diff lines excluding rename accounting; protect reviewer from unnecessary formatting. No runnable test runner known: semantic-preserving rename uses baseline/after tsc, scoped ESLint, structural/reference and data projection comparison rather than behavior RED. Browser smoke if existing server/tool available via verifier. Review isolation remains unresolved due unrelated dirty edits; do not attribute whole HEAD diff to this task. Task 1 applied; task 2 checks completed with independent verifier. Writer reports approximately 50 additions / 50 deletions excluding file renames and existing changes. Raw source schema/station terms and UI unchanged; owned type field is instrumentType. Native assessment unassessable due untracked selection; independent verification required. No native approval or commits/publishing.

## Final evidence and limitations
Independent verifier confirms single instrumentType and unchanged projection/filter semantics. Browser on existing server rendered 37 marks; instrument filter reduced count to 9, Bortle filter to 8. Drawer selection path verified via DOM click only: real pointer click intercepted by hero overlay, so actual pointer interaction remains unverified. Browser zero errors, four warnings; own session closed. Raw source InstrumentRecord/instrumentCode and input JSON filenames intentionally retained. No behavior test runner available. Native INSPECT blocked on intended-untracked selection and candidate includes unrelated prior edits; native review pending. Follow-up pointer-overlay diagnosis requires separate authorization; not part of terminology refactor.
