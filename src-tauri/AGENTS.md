# Tauri / Rust Rules

These rules apply to everything inside `src-tauri/`.

## Responsibilities

The Tauri/Rust layer owns:

- SQLite access
- local persistence
- filesystem access
- native OS functionality
- secure native operations
- synchronization infrastructure

Keep native implementation details outside the frontend.

## Preferred Structure

Prefer:

`src-tauri/src/commands/`

`src-tauri/src/database/`

`src-tauri/src/domain/`

`src-tauri/src/repositories/`

`src-tauri/src/services/`

`src-tauri/src/services/sync/`

`src-tauri/src/state/`

The exact structure may evolve with the project.

Keep `main.rs` and `lib.rs` focused on initialization and application composition.

Do not place the entire implementation inside them.

## Tauri Commands

Tauri commands must remain thin.

Preferred flow:

`command → service → repository → SQLite`

Commands should primarily:

- receive typed input
- delegate work
- return typed output
- map errors when necessary

Do not put large business rules, raw SQL, or synchronization orchestration directly inside commands.

## Services

Services should contain application and business operations.

Use services when an operation:

- coordinates repositories
- performs domain validation
- manages synchronization
- contains non-trivial application behavior

Avoid giant service files.

Split responsibilities when necessary.

## Repositories

Repositories own persistence concerns.

Examples:

- BookRepository
- SettingsRepository
- SyncRepository

Keep SQL and database-specific implementation inside the persistence layer whenever practical.

## SQLite

SQLite is the local operational database.

Normal application functionality must work offline.

Do not require the remote API before completing ordinary local operations.

Preferred flow:

`user action → Tauri command → service → repository → SQLite`

## Local-First

Persist changes locally first.

Preferred synchronization flow:

`user action → SQLite → sync queue → remote API`

Network failures must not corrupt local application state.

## Synchronization

Keep synchronization logic isolated in dedicated services or modules.

Conceptually:

`SQLite ↔ Sync Service ↔ Remote API ↔ MySQL`

Synchronization must account for:

- pending operations
- retries
- soft deletes
- conflicts
- versions
- sync cursors
- interrupted connectivity

Do not assume connectivity is always available.

## Identifiers

Entities that can be created offline must use client-generated globally unique IDs.

Prefer UUID or UUIDv7 where appropriate.

Do not rely on remote auto-increment IDs for entities created offline.

## Errors

Do not silently swallow errors.

Use structured application errors.

Do not expose raw SQL, SQLite, networking, or internal Rust errors directly to the UI.

Map internal errors into meaningful frontend-facing errors.

## Rust Quality

Prefer:

- explicit types
- small modules
- clear ownership
- proper error propagation
- minimal unnecessary cloning
- idiomatic Rust

Avoid unnecessary abstractions.

## Before Finishing

For relevant Rust changes, run:

`cargo fmt --check`

`cargo check`

Run relevant Rust tests when they exist.

Never claim a command or test passed unless it was actually executed.