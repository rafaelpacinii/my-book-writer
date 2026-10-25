# Project Rules & AI Agent Guidelines

> **Project Identity**: My Book Writer is a professional, local-first desktop editorial studio for authors and book makers.
> Built with Next.js (App Router, static export), React 19, TypeScript, Tailwind CSS v4, Tauri v2, Rust, and SQLite (WAL mode).

---

## 1. Architectural North Star

My Book Writer is designed around **data sovereignty** and **sub-millisecond local responsiveness**:
* **Local-First Core**: All core application capabilities (drafting, editing, chapter reordering, versioning, front matter configuration, and high-fidelity PDF/EPUB/DOCX export) must operate flawlessly without an internet connection.
* **Non-Blocking Persistence**: Persist changes locally first. Preferred flow:
  `User Action → SQLite (WAL) → Local UI → Sync Queue (background) → Remote API (optional)`
* **Boundary Invariants**:
  * **Next.js / React (`src/`)**: Pure UI rendering, client-side interaction, and ergonomic layout. The frontend **must never** directly access SQLite, the filesystem, or remote databases.
  * **Tauri / Rust (`src-tauri/`)**: Native system operations, SQLite access via SQLx, Chromium DevTools PDF orchestration, and background sync infrastructure.
  * **SQLite**: Local single source of truth for the desktop client.
  * **Remote API / MySQL**: Optional online synchronization layer. The frontend must never connect directly to MySQL.

---

## 2. General Engineering Rules

* **Small, Single-Responsibility Files**: Keep files small, focused, and legible.
* **Strict TSX Limit**: Every `.tsx` file has a strict maximum of **70 lines**. Split components or extract custom hooks when approaching this threshold.
* **Page Composition**: Every `page.tsx` must only compose route components (typically less than 15 lines). Never implement page UI directly inside `page.tsx`.
* **Zero `any`**: Do not use `any` unless strictly justified. Use `unknown` and narrow safely.
* **Explicit Error Handling**: Do not silently swallow errors. Map internal errors into user-friendly typed application errors.
* **No Unrelated Refactors**: Respect existing code structure and conventions. Only modify files relevant to the active task.
* **Documentation Integrity**: Preserve existing comments, docstrings, and license headers unless explicitly requested to modify them.

---

## 3. Scope Hierarchy

Always consult the closest applicable `AGENTS.md`:
* **Frontend Rules**: [`src/AGENTS.md`](src/AGENTS.md) governs React components, hooks, Tailwind styling, App Router boundaries, and UI primitives.
* **Native Rust Rules**: [`src-tauri/AGENTS.md`](src-tauri/AGENTS.md) governs Tauri commands, application services, SQLx repositories, SQLite schema migrations, and export pipelines.

---

## 4. Gitflow Workflow & PR Generation

Follow the standard **Atlassian Gitflow Workflow**:

### Long-Lived Branches
* `main`: Production and official release history.
* `develop`: Integration branch for ongoing development.

### Supporting Branches
* `feature/<feature-name>`: Branched from `develop`, targets `develop`.
* `fix/<bug-name>`: Branched from `develop`, targets `develop`.
* `release/<version>`: Branched from `develop`, merged into both `main` and `develop`.
* `hotfix/<fix-name>`: Branched from `main`, merged into both `main` and `develop`.

### Rules for AI Agents
1. **Never commit, push, or open pull requests automatically** unless the user explicitly requests you to do so.
2. At the end of every completed implementation task, always generate the **exact, ready-to-run Git commands** for the user to review and execute.
3. Generate concrete values—**never** output placeholders like `<branch-name>`, `<commit-message>`, or `<title>`.
4. Follow Conventional Commits format (`feat: ...`, `fix: ...`, `refactor: ...`, `chore: ...`).
5. Stage only relevant files explicitly (e.g., `git add src/components/library/Main.tsx`).

### Standard Git Output Template
```bash
git checkout develop
git pull origin develop
git checkout -b feature/example-feature-name

git add <specific-files>
git commit -m "feat: concise and descriptive summary"

git push -u origin feature/example-feature-name

gh pr create \
  --base develop \
  --head feature/example-feature-name \
  --title "feat: concise and descriptive summary" \
  --body "## Summary
- concise explanation of changes
- concrete problem solved

## Validation
- specific command actually executed
- test result observed"
```

---

## 5. Verification Before Completion

Before claiming a task is finished:
* **Frontend**:
  ```bash
  npx tsc --noEmit
  npm run lint
  npm test
  ```
* **Native (when Rust code is touched)**:
  ```bash
  cd src-tauri && cargo fmt --check && cargo check && cargo test --lib
  ```
* **Strict Rule**: Never claim a test, build, lint check, or command succeeded unless it was **actually executed** in the environment.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
