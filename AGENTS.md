# Project Rules & AI Agent Guidelines

My Book Writer is a local-first desktop editorial studio: Next.js static export,
React 19, TypeScript, Tailwind v4, Tauri v2, Rust and SQLite (SQLx, WAL).

## Start here

Read [current task](TASK.md), [system state](docs/SYSTEM_STATE.md) and the
[documentation map](docs/README.md). Load only the domain documents needed for the
request. [AI governance](docs/ai-governance.md) explains skills and tool adapters.

- [Business rules](docs/BUSINESS_RULES.md) describe editorial invariants.
- [Conventions](docs/CONVENTIONS.md) describe implementation choices.
- [Frontend rules](src/AGENTS.md) apply to `src/`.
- [Native rules](src-tauri/AGENTS.md) apply to `src-tauri/`.
- [Delivery workflow](docs/development/workflow.md) connects issues, PRs and versions.

The closest applicable AGENTS.md adds scoped rules. Explicit user decisions take
precedence over repository guidance; do not ask again for an already authorized
change. Record a requested business-rule change in the affected docs and tests.
Code proves current behavior; a discrepancy with policy is debt to report, not
permission to silently redefine the product.

## Architecture and code

- Core drafting, editing, ordering, versions, front matter and exports work offline.
- Frontend uses typed IPC wrappers. Never access SQLite, the filesystem or remote
  databases directly from React. Browser fixtures are not desktop persistence.
- Native flow: Command → Service → Repository → SQLite. Persist successfully
  before reporting a completed save or publishing a data-change event.
- Remote API/MySQL and background sync remain optional future architecture.
- Every `.tsx` file has at most **70 lines**. Extract components/hooks; never
  compress code to evade the limit. `page.tsx` only composes route components.
- No unjustified `any`; narrow `unknown`. Map errors to actionable typed errors.
- Keep files focused. Preserve unrelated changes, comments and license headers.
- Do not read manuscripts, backups, credentials or generated directories as bulk
  AI context. Use synthetic data for tests; see [context rules](docs/ai-governance.md).

## Task memory and review

For substantial work, maintain TASK.md with objective, acceptance criteria,
affected scope, decisions, checks actually executed and remaining work. Small
wording fixes do not need a new task ceremony. Do not overwrite another active
task silently. Architectural decisions belong in docs/adr; proposals are labeled.
Skills in `.agents/skills/` are reusable procedures, not permissions or subagents.

## Gitflow and authorization

- `main` is release history; `develop` is integration.
- `feature/*` and `fix/*` branch from and target `develop`.
- `release/*` branches from `develop`, merges into `main` and back into `develop`.
- `hotfix/*` branches from `main`, merges into both long-lived branches.
- Never commit, push, create issues/PRs, publish or alter GitHub settings unless
  explicitly requested. Preparing files and commands does not perform those actions.
- At the end of every implementation, supply exact ready-to-run Git commands with
  concrete branch, Conventional Commit message and PR title/body. Stage relevant
  files explicitly, never `git add .`. Account for the actual current branch and
  dirty worktree; do not prescribe a pull over unrelated local changes.
- Meaningful changes reference a real issue when available. Do not fabricate an
  issue number or block local progress solely because GitHub is unavailable.

## Verification

Use `python3 scripts/ai_checks.py verify --scope governance|frontend|native|all`.
Run checks for affected scopes; contract/shared changes require both app scopes.
See [CI scope matrix](docs/development/ci-cd.md) for exact routing.

Frontend: `npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run check:ui`.
On a fresh checkout run `npx next typegen` before TypeScript. Relevant browser
regressions also apply to UI changes; review screenshots before updating baselines.
Native: from `src-tauri`, `cargo fmt --check`, `cargo check --locked`,
`cargo test --locked --lib`. Desktop integration and releases need native evidence.
Documentation/governance alone uses governance checks; it does not require app
compilation. Never claim a skipped, unavailable or unexecuted check passed.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
