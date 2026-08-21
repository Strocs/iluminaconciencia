# Skill Registry — iluminaconciencia

Generated: 2026-08-20 by sdd-init (mode: engram)
Index, not summary. Subagents must read the full `SKILL.md` source of truth at the exact paths below.

## Scan Sources

- User skills scanned: `~/.pi/agent/skills/`, `~/.agents/skills/`, `~/.config/opencode/skills/`
- Project skills scanned: `{root}/skills/`, `{root}/.opencode/skills/`, `{root}/.claude/skills/`, `{root}/.agents/skills/`, `{root}/.atl/skills/`, `{root}/.cursor/skills/`, `{root}/.github/skills/` — **none exist**
- Convention files indexed: `AGENTS.md` (project root)

## Registry Contract

- Skip `sdd-*`, `_shared`, and `skill-registry` (excluded, not broken).
- Deduplication: by skill name, preferring the runtime-resolved path from this session's available_skills (exact source of truth loaded by the orchestrator). Where a skill exists in multiple global locations, the resolved path is the one listed here.
- `customize-opencode` is a built-in skill (no filesystem path); listed for completeness so agents do not search blindly.

## Skills (27 indexed)

| Skill | Trigger / Description | Scope | Path |
| ----- | --------------------- | ----- | ---- |
| astro | Build with Astro: components, SSR adapters, content collections, static sites, CLI | user | /home/strocs/.agents/skills/astro/SKILL.md |
| astro-react-islands | Static-first islands: atomic React islands, client:load, state via stores | user | /home/strocs/.agents/skills/astro-react-islands/SKILL.md |
| branch-pr | Create Gentle AI PRs with issue-first checks | user | /home/strocs/.config/opencode/skills/branch-pr/SKILL.md |
| chained-pr | Split oversized changes (>400 lines) into chained PRs | user | /home/strocs/.config/opencode/skills/chained-pr/SKILL.md |
| cognitive-doc-design | Design docs that reduce cognitive load (guides, READMEs, RFCs) | user | /home/strocs/.agents/skills/cognitive-doc-design/SKILL.md |
| comment-writer | Warm, direct collaboration comments (PR feedback, reviews) | user | /home/strocs/.config/opencode/skills/comment-writer/SKILL.md |
| customize-opencode | Edit opencode's own configuration, agents, subagents, skills, plugins, MCP | built-in | \<built-in\> |
| game-engine | Web game engines/games: HTML5, Canvas, WebGL, physics, loops | user | /home/strocs/.agents/skills/game-engine/SKILL.md |
| gentle-ai-bench | Author/verify bench journeys; go test ./bench never proves driven execution | user | /home/strocs/.agents/skills/gentle-ai-bench/SKILL.md |
| go-testing | Focused Go testing patterns (teatest, golden files, coverage) | user | /home/strocs/.agents/skills/go-testing/SKILL.md |
| gsap-core | GSAP core API: to/from/fromTo, easing, stagger, matchMedia | user | /home/strocs/.agents/skills/gsap-core/SKILL.md |
| gsap-performance | GSAP performance: transforms, avoid layout thrash, will-change | user | /home/strocs/.agents/skills/gsap-performance/SKILL.md |
| gsap-scrolltrigger | Scroll-linked animation, pinning, scrub, triggers | user | /home/strocs/.agents/skills/gsap-scrolltrigger/SKILL.md |
| gsap-timeline | Timelines, position parameter, nesting, playback | user | /home/strocs/.agents/skills/gsap-timeline/SKILL.md |
| islands-architecture | Islands architecture pattern for partial hydration | user | /home/strocs/.agents/skills/islands-architecture/SKILL.md |
| issue-creation | Create/triage GitHub issues from repository evidence | user | /home/strocs/.agents/skills/issue-creation/SKILL.md |
| judgment-day | Blind dual review with at most two scoped fix rounds | user | /home/strocs/.config/opencode/skills/judgment-day/SKILL.md |
| no-use-effect | ALWAYS ACTIVE: never write useEffect directly; derived state/events/stores | user | /home/strocs/.agents/skills/no-use-effect/SKILL.md |
| playwright | Real-browser automation via playwright-cli or wrapper script | user | /home/strocs/.agents/skills/playwright/SKILL.md |
| playwright-cli-hygiene | Close every browser instance the agent opened; ask before closing pre-existing | user | /home/strocs/.agents/skills/playwright-cli-hygiene/SKILL.md |
| rdd-defect-workflow | Receipt-driven development: review authority, delivery gate, bounded defects | user | /home/strocs/.agents/skills/rdd-defect-workflow/SKILL.md |
| skill-creator | Create LLM-first skills with valid frontmatter | user | /home/strocs/.config/opencode/skills/skill-creator/SKILL.md |
| skill-improver | Audit and upgrade existing LLM-first skills | user | /home/strocs/.config/opencode/skills/skill-improver/SKILL.md |
| systemic-issue-triage | Attack issues by root class, never one-by-one | user | /home/strocs/.config/opencode/skills/systemic-issue-triage/SKILL.md |
| typescript-advanced-types | Advanced TS type system: generics, conditional/mapped/template types | user | /home/strocs/.agents/skills/typescript-advanced-types/SKILL.md |
| vercel-react-best-practices | React/Next.js performance optimization guidelines | user | /home/strocs/.agents/skills/vercel-react-best-practices/SKILL.md |
| work-unit-commits | Plan commits as reviewable work units (tests+docs with code) | user | /home/strocs/.agents/skills/work-unit-commits/SKILL.md |

## Excluded (intentionally not indexed)

- `sdd-*` (sdd-apply, sdd-archive, sdd-design, sdd-explore, sdd-init, sdd-onboard, sdd-propose, sdd-spec, sdd-tasks, sdd-verify) — SDD pipeline skills, resolved by the orchestrator.
- `_shared` (and `shared`) — shared SDD references, not invokable.
- `skill-registry` — this generator skill.

## Convention Files

- `/home/strocs/dev/iluminaconciencia/AGENTS.md` — CALUZ contribution rules (language, architecture, dev verification).