---
description: Native Tauri v2, Rust, SQLx SQLite, and Chromium PDF export rules
globs: "src-tauri/**/*.{rs,toml,json}"
always_on: true
---

# Native Tauri / Rust Architecture & Coding Rules

> **Scope**: Applied to all native code under `src-tauri/`.
> **Stack**: Tauri v2, Rust (Edition 2021), SQLite (WAL mode, SQLx), Headless Chromium (DevTools Protocol).

---

## 1. Responsibilities & Layered Architecture

The Tauri/Rust layer manages all native OS operations, persistence, and heavy compilation.

Maintain the strict four-tier architecture:
```
Tauri Command (Thin Bridge)
       │
       ▼
Application Service (Business Logic & Validation)
       │
       ▼
Repository (SQLx Queries & Data Mapping)
       │
       ▼
SQLite Database (WAL Mode)
```

1. **Commands (`src-tauri/src/commands/`)**:
   * Thin adapters that deserialize frontend input, delegate to services, and map errors.
   * **Never** contain raw SQL, transaction management, or business logic.
2. **Services (`src-tauri/src/services/`)**:
   * Orchestrate domain rules, validations, and cross-repository transactions.
   * Examples: `BookService`, `ChapterService`, `ExportService`, `BackupService`.
3. **Repositories (`src-tauri/src/repositories/`)**:
   * Own all SQL queries using `sqlx`.
   * Keep database-specific SQL queries completely inside repositories.
4. **Domain (`src-tauri/src/domain/`)**:
   * Data models, entities, and DTOs with `#[derive(Serialize, Deserialize)]`.

---

## 2. SQLite & Local-First Invariants

* **Offline Autonomy**: All core features must function without internet access.
* **WAL Mode**: Connection pool runs with `PRAGMA journal_mode = WAL` and foreign keys enabled.
* **UUIDv7 Identifiers**: All entities created offline use client-generated, time-ordered **UUIDv7** strings. Never rely on auto-increment IDs for offline entities.
* **Migrations**: Sequential SQL migrations live under `src-tauri/migrations/`.

---

## 3. Chromium DevTools PDF Pipeline (`services/export/`)

* PDF export is rendered offline using embedded headless Chromium orchestrated via the Chrome DevTools Protocol (`Page.printToPDF`).
* Injects CSS `@page` declarations and embedded fonts honoring the book's trim size, margins, and typography.
* Do not call remote rendering services or third-party cloud APIs.

---

## 4. Error Handling (`error.rs`)

* Map all native errors to typed `AppError` variants (`Validation`, `Database`, `NotFound`, `Export`).
* Never silently swallow errors.
* Never expose raw SQL errors, stack traces, or panic strings to the frontend.

---

## 5. Verification Checklist

Before reporting completion on any native Rust task:
```bash
cd src-tauri
cargo fmt --check
cargo check
cargo test --lib
```
* [ ] Verify that commands are thin and delegate to services.
* [ ] Verify that SQL queries remain inside repositories.
* [ ] Verify proper error mapping without leaked internal errors.
