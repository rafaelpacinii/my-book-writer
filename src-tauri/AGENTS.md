# Native Tauri / Rust Rules & AI Agent Guidelines

> **Scope**: Applies to everything under `src-tauri/`.
> **Stack**: Tauri v2, Rust (Edition 2021), SQLite (via SQLx), Headless Chromium (DevTools Protocol).

---

## 1. Responsibilities & Layered Architecture

The Tauri/Rust layer is the native backbone of My Book Writer. It owns:
* Direct SQLite persistence and migrations.
* Filesystem asset storage and cryptographic hashing (SHA-256).
* Offline PDF, EPUB, and DOCX compilation.
* Native OS dialogs (file saving, backup exports/restorations).

### The Layered Flow
Always maintain a strict separation of concerns:
```
Tauri Command (Thin Bridge)
       │
       ▼
Application Service (Business Logic & Validation)
       │
       ▼
Repository (SQLx Queries & Persistence)
       │
       ▼
SQLite Database (WAL Mode)
```

1. **Commands (`src-tauri/src/commands/`)**:
   * Must remain thin and declarative.
   * Parse input DTOs, delegate to the relevant service, and map internal results to `Result<T, AppError>`.
   * **Never** write raw SQL or complex business rules inside command functions.

2. **Services (`src-tauri/src/services/`)**:
   * Contain all business rules, orchestration, and domain validation.
   * Coordinate multiple repositories in transactions when needed.
   * Examples: `BookService`, `ChapterService`, `ExportService`, `BackupService`.

3. **Repositories (`src-tauri/src/repositories/`)**:
   * Encapsulate all SQL queries and data mapping via `sqlx`.
   * Never leak raw database queries into services or commands.

4. **Domain Models (`src-tauri/src/domain/`)**:
   * Define core domain structs, database entities, and command inputs/outputs (`Serialize`, `Deserialize`).

---

## 2. SQLite & Local-First Invariants

* **Offline Autonomy**: Normal operations must complete locally without network requirements.
* **WAL Journal Mode**: SQLite is configured with `PRAGMA journal_mode = WAL` and foreign keys enabled.
* **UUIDv7 Identifiers**: Entities that can be created offline must use client-generated, time-sortable **UUIDv7** strings. Never rely on auto-increment IDs for offline entities.
* **Migrations**: Schema changes must be written as sequential SQL migrations under `src-tauri/migrations/`.

---

## 3. High-Fidelity Export Pipeline (`services/export/`)

* **PDF Generation**: Orchestrated through headless Chromium using the DevTools Protocol (`Page.printToPDF`).
* Injects offline font files and CSS `@page` declarations honoring book trim sizes, inner/outer margins, and typography presets.
* Do not attempt to generate PDFs using third-party web services or network calls.

---

## 4. Error Handling & Diagnostics

* Use structured errors defined in [`src-tauri/src/error.rs`](src/error.rs) (`AppError`).
* **Never silently swallow errors**.
* Never leak raw SQL errors, panic traces, or unhandled internal errors to the frontend. Map them to meaningful, actionable error variants.

---

## 5. Verification Checklist Before Completion

When modifying native code:
```bash
cd src-tauri
cargo fmt --check
cargo check
cargo test --lib
```
* [ ] Verify that commands are thin and delegate to services.
* [ ] Verify that SQL queries remain inside repositories.
* [ ] Verify proper error mapping.
* [ ] Never claim checks passed without executing them.