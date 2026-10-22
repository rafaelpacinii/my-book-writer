---
description: Frontend React 19, Next.js, Tailwind CSS v4, and TypeScript engineering rules
globs: "src/**/*.{ts,tsx,css}"
always_on: true
---

# Frontend Architecture & Coding Rules

> **Scope**: Applied to all frontend code under `src/`.
> **Stack**: Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS v4.

---

## 1. Directory Structure & Responsibilities

```
src/
├── app/                  # Next.js App Router entry points (route composition only)
├── components/
│   ├── <route>/          # Scoped strictly to one route (e.g. components/library/)
│   ├── shared/           # Reusable application components (AppShell, AppSidebar, ErrorState)
│   └── ui/               # Generic visual primitives (Button, Input, Select, Dialog, Card)
├── hooks/                # Stateful React logic, subscriptions, and custom hooks
├── lib/                  # Application infrastructure, Tauri IPC wrappers, API clients
├── types/                # Shared TypeScript domain interfaces and types
└── utils/                # Pure, deterministic, testable utility functions (zero React/DOM imports)
```

---

## 2. Component Construction & The Strict 70-Line Rule

### The Strict 70-Line Limit
Every `.tsx` file has a **strict maximum of 70 lines**.
* **Rationale**: Enforces single responsibility, makes code reviews fast and transparent, and guarantees high cohesion.
* When approaching 70 lines:
  1. Extract sub-components into sibling files.
  2. Extract stateful behavior and effects into a custom hook in `src/hooks/`.
* **Zero tolerance for cheat formatting**: Do not join multiple statements on a single line, strip helpful whitespace, or write obfuscated JSX.

### Page Files (`page.tsx`)
Every `page.tsx` must only compose route components in **less than 15 lines**. Never implement UI markup directly inside `page.tsx`:
```tsx
import { Main } from "@/components/library/Main";

export default function LibraryPage() {
  return <Main />;
}
```

### The 4 Mandatory UI States
Every user-facing data view must explicitly handle all four states:
1. **Loading**: Use skeleton loaders or [`LoadingRegion`](../components/ui/LoadingRegion.tsx).
2. **Success**: Render the populated view with responsive layout.
3. **Empty**: Provide empathetic guidance and a clear primary action.
4. **Error**: Use [`ErrorState`](../components/shared/ErrorState.tsx) with an actionable retry button.

---

## 3. Custom Hooks (`src/hooks/`) vs Utilities (`src/utils/`)

* **Custom Hooks (`src/hooks/`)**:
  * Contain `useState`, `useEffect`, `useCallback`, subscriptions, or Tauri IPC calls.
  * Follow naming: `use<Feature>.ts` (e.g. `useBooks.ts`, `useLibrary.ts`, `useChapterVersions.ts`).
* **Utilities (`src/utils/`)**:
  * Must be **pure, deterministic, and free of React hooks or DOM dependencies**.
  * Must have companion unit tests in `src/utils/*.test.ts`.

---

## 4. Next.js Static Export Invariants

* **Desktop Environment**: This app compiles to a static HTML export loaded by Tauri.
* **Strictly Forbidden**: Server Actions, Next.js API Routes (`app/api/*`), runtime SSR (`getServerSideProps`).
* **Client Directives**: Use `"use client"` only where React hooks or browser APIs are needed.

---

## 5. Styling & Design Tokens (Tailwind CSS v4)

* Use Tailwind CSS v4 semantic tokens:
  * Backgrounds: `bg-background`, `bg-surface`, `bg-primary-soft`
  * Typography: `text-foreground`, `text-muted`, `text-primary`
  * Borders: `border-border`, `border-control-border`
  * Accents: `primary`, `success`, `warning`, `danger`
* Avoid hardcoded hex colors or arbitrary brackets in JSX.
* Ensure WCAG AA contrast in both Light and Dark themes.

---

## 6. TypeScript Standards

* **Strict TypeScript**: `noImplicitAny`, strict null checks.
* **Zero `any`**: Use explicit interfaces. For unknown payloads, use `unknown` and narrow safely with type guards.
* **Imports**: Use the `@/` path alias for all internal references.

---

## 7. Verification Checklist

Before reporting completion on any frontend task:
```bash
npx tsc --noEmit
npm run lint
npm test
```
* [ ] Verify that every `.tsx` file is **≤ 70 lines**.
* [ ] Verify that `page.tsx` files only compose components.
* [ ] Verify that zero `any` types were introduced.
