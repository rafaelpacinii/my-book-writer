# Project Rules

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Tauri
- Rust
- SQLite

This is a desktop application designed with a local-first architecture.

## Project Structure

Frontend code lives inside:

`src/`

Native Tauri/Rust code lives inside:

`src-tauri/`

Do not move frontend code outside `src/`.

## Architecture

Use the following responsibility boundaries:

- Next.js / React: UI and user interaction
- Tauri / Rust: native operations and local application services
- SQLite: local persistence
- Remote API: online synchronization
- MySQL: remote database behind the API

The frontend must never connect directly to MySQL.

## General Rules

- Prefer small and focused files.
- Prefer explicit and readable code.
- Reuse existing project patterns before creating new abstractions.
- Avoid unrelated refactors.
- Avoid unnecessary dependencies.
- Do not use `any` unless strictly justified.
- Do not silently swallow errors.

## Local-First

Normal application functionality must work without internet access.

Persist changes locally first.

Preferred flow:

`user action → SQLite → local UI → sync queue → remote API`

Remote synchronization must not block normal local usage.

## Scope-Specific Rules

Frontend rules are defined in:

`src/AGENTS.md`

Tauri/Rust rules are defined in:

`src-tauri/AGENTS.md`

Always follow the closest applicable `AGENTS.md`.

## Before Finishing

Run the relevant checks for the files changed.

Never claim that a command, check, test, lint, or build succeeded unless it was actually executed.

## Git Workflow

Follow the Gitflow workflow described by Atlassian.

Use these long-lived branches:

- `main`: production and official release history
- `develop`: integration branch for ongoing development

Use these supporting branch prefixes:

- `feature/` for new features
- `fix/` for non-production bug fixes
- `release/` for release preparation
- `hotfix/` for urgent production fixes

### Branch Rules

New features must branch from `develop`.

Example:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-book-form
```

Regular bug fixes that are not production hotfixes should also branch from `develop`.

Example:

```bash
git checkout develop
git pull origin develop
git checkout -b fix/book-form-validation
```

Release branches must branch from `develop`.

Example:

```bash
git checkout develop
git pull origin develop
git checkout -b release/0.1.0
```

Hotfix branches must branch from `main`.

Example:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-startup-crash
```

Feature and regular fix branches must target `develop`.

Release branches must eventually be merged into both `main` and `develop`.

Hotfix branches must eventually be merged into both `main` and `develop`.

Do not commit feature development directly to `main`.

Do not commit ordinary feature development directly to `develop`.

## Git Commands After Changes

After completing a coding task, always provide the exact Git commands needed for the user to:

1. create the appropriate branch when the task has not already been started on one
2. stage the relevant changes
3. create a commit
4. push the branch
5. create a GitHub pull request using `gh`

The commands must already contain appropriate branch names, commit messages, pull request titles, and pull request bodies based on the work performed.

Do not output placeholder values such as:

- `<branch-name>`
- `<commit-message>`
- `<title>`
- `<description>`

Generate concrete values from the actual task.

## Branch Naming

Use short, descriptive, kebab-case branch names.

Examples:

- `feature/setup-sqlite`
- `feature/add-library-page`
- `feature/offline-sync`
- `fix/sidebar-overflow`
- `fix/sqlite-migration`
- `release/0.1.0`
- `hotfix/startup-crash`

Choose the branch type based on the actual work performed.

## Commits

Use concise, descriptive commit messages.

Prefer Conventional Commit-style messages when appropriate.

Examples:

- `feat: configure SQLite persistence`
- `feat: add library page`
- `fix: prevent duplicate sync operations`
- `refactor: split library components`
- `chore: configure Tailwind CSS`
- `docs: update project architecture rules`

Do not use vague commit messages such as:

- `update`
- `changes`
- `fix stuff`
- `work`
- `final`

## Staging

Prefer staging only files related to the current task.

Use explicit file paths when practical.

Example:

```bash
git add src/app/library/page.tsx src/components/library src/hooks/useLibrary.ts
```

Use:

```bash
git add .
```

only when all current working-tree changes are known to belong to the same task.

Never recommend staging unrelated changes.

## Push

Push new branches with upstream tracking:

```bash
git push -u origin feature/setup-sqlite
```

After the upstream already exists, normal pushes may use:

```bash
git push
```

## Pull Requests

Use the GitHub CLI to generate pull requests.

Feature and regular fix pull requests should normally target `develop`.

Example:

```bash
gh pr create \
  --base develop \
  --head feature/setup-sqlite \
  --title "feat: configure SQLite persistence" \
  --body "## Summary
- configure SQLite persistence in the Tauri layer
- add database initialization
- prepare the project for offline-first storage

## Validation
- cargo fmt --check
- cargo check"
```

Release and hotfix pull requests must use the appropriate Gitflow target.

When a release or hotfix requires integration into both `main` and `develop`, provide the necessary pull request commands separately.

## Pull Request Content

Pull request descriptions should be concise and based only on work actually performed.

Prefer this structure:

```text
## Summary
- important change
- important change

## Validation
- check that was actually executed
- test that was actually executed
```

Do not claim tests, builds, lint checks, or other validations were run unless they were actually executed.

If no validation was executed, explicitly state that in the pull request body.

## Required Git Output

At the end of each implementation task, provide a ready-to-run Git section similar to:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/setup-sqlite

git add src-tauri/Cargo.toml src-tauri/src
git commit -m "feat: configure SQLite persistence"

git push -u origin feature/setup-sqlite

gh pr create \
  --base develop \
  --head feature/setup-sqlite \
  --title "feat: configure SQLite persistence" \
  --body "## Summary
- configure SQLite persistence
- add database initialization

## Validation
- cargo fmt --check
- cargo check"
```

Adapt all commands, branch names, messages, titles, files, and descriptions to the actual task.

Do not create commits, push branches, or open pull requests automatically unless explicitly requested. Generate the commands for the user to review and run.
