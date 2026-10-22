# GitHub Copilot Custom Instructions for My Book Writer

You are an expert pair programmer working on **My Book Writer**, a calm, professional, local-first desktop editorial studio for authors and book makers.

Always follow these guidelines when suggesting or writing code:

---

## 1. Architectural North Star & Tech Stack
* **Stack**: Next.js 16 (App Router, static export), React 19, TypeScript (strict), Tailwind CSS v4, Tauri v2, Rust (Edition 2021), SQLite (`WAL` mode).
* **Local-First Core**: Everything operates offline without cloud dependencies.
* **Separation of Concerns**:
  * Next.js / React (`src/`): Pure UI rendering, client-side interactions, and styling. The frontend must **never** directly access SQLite, the filesystem, or remote databases.
  * Tauri / Rust (`src-tauri/`): Native OS APIs, SQLite access via SQLx repositories, DevTools Protocol PDF export, and cryptographic hashing.
  * Flow: `Component → Hook/Service → Tauri Command → Rust Service → SQLx Repository → SQLite`.

---

## 2. Frontend Conventions (`src/`)
* **Strict 70-Line Limit for `.tsx`**: Every `.tsx` file must be **70 lines or fewer**. If a component exceeds 70 lines, split sub-components or extract stateful logic into a custom hook in `src/hooks/`.
* **Page Files**: `page.tsx` must only compose route components (under 15 lines). Never implement UI markup directly inside `page.tsx`.
* **Route Structure**: Route components belong in `src/components/<route>/`. Application-wide shared components go in `src/components/shared/`. Generic UI primitives go in `src/components/ui/`.
* **Hooks vs Utils**: Stateful logic and React effects belong in `src/hooks/`. Pure, deterministic functions belong in `src/utils/`.
* **Static Export Boundaries**: Do not use Server Actions, Next.js API Routes, or runtime SSR. Use `"use client"` only where necessary.
* **TypeScript**: Strict types everywhere. Do not use `any`.

---

## 3. Native Conventions (`src-tauri/`)
* **Layered Rust Architecture**:
  * `commands/`: Thin functions receiving typed input, calling services, and returning `Result<T, AppError>`. No business logic or raw SQL here.
  * `services/`: Business logic, orchestrations, and domain validations.
  * `repositories/`: Encapsulate all SQL queries using SQLx.
  * `domain/`: Data structures with Serde derivation.
* **IDs & Migrations**: Use client-generated UUIDv7 strings for offline-created entities. Manage schema changes through sequential migrations in `migrations/`.
* **Error Handling**: Use structured `AppError`. Never swallow errors silently or expose raw SQL errors to the frontend.

---

## 4. Git & Workflow Etiquette
* **Do Not Commit Automatically**: Always present the proposed code changes first. Provide ready-to-run Git commands using Gitflow (`feature/`, `fix/`, `develop`, `main`) with Conventional Commit messages.
* **Run Verification**: Never claim a test or check passed without executing it (`npx tsc --noEmit`, `npm run lint`, `npm test`, `cargo check`).
