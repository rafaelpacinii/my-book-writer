# Codex Pair Programming Instructions — My Book Writer

> **Project Identity**: My Book Writer is a professional, local-first desktop editorial studio for authors and book makers.
> **Stack**: Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS v4, Tauri v2, Rust (Edition 2021), SQLite (WAL mode, SQLx).

---

## 1. Architectural North Star & Non-Negotiables

* **Local-First Sovereign Core**: All core capabilities (writing, chapter reordering, versioning, front matter, PDF/EPUB/DOCX export) operate 100% offline.
* **Strict Boundary Invariants**:
  * **Frontend (`src/`)**: Pure UI rendering and client-side interaction. **Never** access SQLite, the filesystem, or remote databases directly.
  * **Native Core (`src-tauri/`)**: Layered architecture (`Command → Service → Repository → SQLite`). Commands are thin bridges. Services contain business logic. Repositories encapsulate all SQLx queries.
  * Flow: `Component → Hook → Tauri Command → Rust Service → SQLx Repository → SQLite (WAL)`.

---

## 2. Frontend Conventions & How We Code (`src/`)

* **Strict 70-Line Limit per `.tsx` File**:
  * Every `.tsx` file has a **strict maximum of 70 lines**.
  * When approaching 70 lines, immediately extract sub-components into sibling files or extract stateful logic into a custom hook in `src/hooks/`.
  * **Never cheat** by concatenating statements onto one line or stripping helpful whitespace.
* **Page Files (`page.tsx`)**:
  * `page.tsx` must **only compose** route components (aim for < 15 lines). Never implement UI markup directly inside `page.tsx`.
* **Component Placement**:
  * Route-specific components: `src/components/<route>/`.
  * Reusable application components: `src/components/shared/` (e.g., `AppShell`, `AppSidebar`, `ErrorState`).
  * Generic UI primitives: `src/components/ui/` (e.g., `Button`, `Input`, `Dialog`, `LoadingRegion`).
* **Custom Hooks vs Utilities**:
  * Stateful behavior, effects, and IPC calls go to `src/hooks/`.
  * Pure, deterministic functions go to `src/utils/` with unit tests in `src/utils/*.test.ts`.
* **Four Mandatory UI States**:
  * Every view must handle: **Loading** (skeletons / `LoadingRegion`), **Success**, **Empty**, and **Error** (`ErrorState` with retry).
* **Next.js Static Export**:
  * No Server Actions, No API Routes, No runtime SSR. Use `"use client"` only where necessary.
* **TypeScript**: Strict mode, zero `any`. Use `unknown` and narrow safely.

---

## 3. Native Conventions (`src-tauri/`)

* **Commands**: Thin functions that deserialize input, call services, and return `Result<T, AppError>`. No raw SQL.
* **Services**: Business rules, validations, and cross-repository transactions.
* **Repositories**: Encapsulate all SQLx queries and SQLite operations.
* **UUIDv7**: Use client-generated UUIDv7 for all entities created offline.
* **Chromium PDF Pipeline**: Offline rendering orchestrated through headless Chromium via DevTools Protocol (`Page.printToPDF`).
* **Error Handling**: Use structured `AppError`. Never swallow errors silently or leak raw SQL errors to the frontend.

---

## 4. Gitflow Workflow & Output Protocol

* **Rule #1: Never commit, push, or open pull requests automatically**.
* At the end of every completed implementation, always provide the **exact, ready-to-run Git commands** for the user to review and execute.
* Use concrete branch names, conventional commit messages (`feat: ...`, `fix: ...`, `refactor: ...`), and PR descriptions.
* Gitflow branches:
  * Features/Fixes: branch from `develop`, target `develop`.
  * Releases/Hotfixes: branch from/target `main`.

---

## 5. Verification Checklist

Always run and report the exact execution of tests before declaring completion:
* Frontend: `npx tsc --noEmit && npm run lint && npm test`
* Native: `cd src-tauri && cargo fmt --check && cargo check && cargo test --lib`
