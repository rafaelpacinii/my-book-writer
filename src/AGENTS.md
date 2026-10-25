# Frontend Architectural Rules & AI Agent Guidelines

> **Scope**: Applies to everything under `src/`.
> **Stack**: Next.js 16 (App Router, Static Export), React 19, TypeScript, Tailwind CSS v4.

---

## 0. Frontend Agent Mandate & Design Workflow

Act as the frontend owner of a **desktop editorial studio**: make writing, finding information, and organizing books understandable before adding visual decoration. Carry the same application identity across routes.

Before changing UI, read [Frontend Design](../docs/frontend-design.md) and the relevant contracts in [UI Quality](../docs/ui-quality.md), then inspect Home, Library, the affected route, and shared components. The old prototype is a reference; explicit user decisions and current contracts take precedence.

### References before new screens

* Before implementing a new screen or proposing a different visual direction, present **2–3 verified links** to concrete app interfaces, screenshots, or design studies. Dribbble, Behance, and official product galleries are acceptable. Explain what each option contributes and recommend one.
* Put clickable reference links in the normal conversation, **outside any interactive option box**. Keep option labels short and link-free.
* Wait for the user's actual choice before implementing the dependent visual design. Continue independent investigation, contracts, and data work while waiting; silence or a preselected option is not a choice.
* Record the chosen direction, applicable routes, and relevant patterns in `docs/frontend-design.md`. Reuse an explicitly approved direction within its agreed scope; do not ask again for routine consistency fixes.

### Implementation contract

* Use a fluid workspace for collections and tools. Restrict width where it improves reading or form usability; do not add a centered `max-w-*` around an entire workspace by habit.
* Reuse `AppShell`, `PageContent`, `PageHeader`, and `ui/` primitives. Match typography, spacing, control sizes, states, and action placement across sibling routes.
* Give each screen a clear task, title, primary action, and understandable local context. Keep contextual breadcrumbs in the titlebar.
* Plan loading, populated, empty, error, keyboard, and narrow-window behavior before implementation. Use real domain data and keep local-first persistence boundaries.
* Use the shared motion tokens and patterns. Movement must explain an interaction, remain interruptible, respect reduced motion, and never delay persistence or navigation. Avoid `transition-all`, per-item entrance cascades, and remounting an editor to animate it.
* Review the result in light/dark themes and narrow/wide windows. Summarize changes, executed checks, and any unverified native behavior; include the concrete Git commands required by the root rules.

---

## 1. Directory Structure & Responsibilities

```
src/
├── app/                  # Next.js App Router route entry points (minimal composition only)
├── components/
│   ├── <route>/          # Components scoped strictly to one route (e.g., components/library/)
│   ├── shared/           # Application-specific reusable components (AppSidebar, AppShell, ErrorState)
│   └── ui/               # Generic reusable UI primitives (Button, Input, Select, Dialog, Card)
├── hooks/                # Stateful React behaviors, subscriptions, and event abstractions
├── lib/                  # Application infrastructure, Tauri IPC wrappers, API clients
├── types/                # Reusable TypeScript interfaces and domain types
└── utils/                # Pure, deterministic, testable utility functions (no React/DOM dependencies)
```

---

## 2. Component Design & The Strict 70-Line Rule

### The 70-Line Limit
Every `.tsx` file has a **strict maximum of 70 lines**. This is not an arbitrary rule—it enforces clean separation of concerns:
* If a component approaches 70 lines, extract sub-components or extract business logic into a custom hook.
* **Never bypass this rule** by compressing statements, removing empty lines, or creating unreadable JSX.

### Page Files (`page.tsx`)
* Every `page.tsx` must **only compose** route components.
* It must contain **no direct UI markup or complex state** (aim for under 15 lines).
* Example:
  ```tsx
  import { Main } from "@/components/library/Main";

  export default function LibraryPage() {
    return <Main />;
  }
  ```

### Route Components (`components/<route>/`)
* Every route in `app/<route>/` must have a matching directory in `components/<route>/`.
* Route components should focus strictly on:
  1. JSX rendering and layout structure.
  2. Wiring user interactions to hooks.
  3. Composing sub-elements.

### Hook Extraction (`src/hooks/`)
* Move stateful logic, `useEffect`, event listeners, and data-fetching orchestrations out of `.tsx` files into dedicated custom hooks in `src/hooks/`.
* Name hooks descriptively (e.g., `useLibrary.ts`, `useBookPagination.ts`, `useEditorCanvas.ts`).
* Do **not** use hooks for pure calculations—use `src/utils/` instead.

---

## 3. State Handling & UI Patterns

Always cover the four fundamental UI states in every user-facing view:
1. **Loading**: Use existing skeleton loaders or [`LoadingRegion`](src/components/ui/LoadingRegion.tsx).
2. **Success**: Render the populated view with proper responsiveness.
3. **Empty**: Provide helpful guidance and primary action (e.g., "Nenhum livro encontrado").
4. **Error**: Use [`ErrorState`](src/components/shared/ErrorState.tsx) with a clear retry mechanism.

---

## 4. Next.js Static Export & Client Boundaries

This application is bundled inside a Tauri desktop container using Next.js static HTML export:
* **Forbidden**: Server Actions, Next.js API Routes (`app/api/*`), runtime SSR (`getServerSideProps`), persistent Node.js servers.
* **Client Boundaries**: Add `"use client"` only when a component requires:
  * React hooks (`useState`, `useEffect`, `useContext`)
  * Browser/DOM APIs
  * Tauri frontend IPC (`@tauri-apps/api`)
* Keep `"use client"` boundaries as localized as possible.

---

## 5. Styling & Design Tokens (Tailwind CSS v4)

* Use Tailwind CSS v4 utility classes mapped to our semantic design tokens:
  * `background`, `surface`, `foreground`, `muted`
  * `primary`, `primary-hover`, `primary-soft`
  * `border`, `control-border`
  * `success`, `warning`, `danger`
* Avoid inline hex codes or arbitrary values (e.g., `bg-[#f3f2ee]`) when semantic classes exist.
* Respect theme changes (`[data-theme="dark"]` and `[data-theme="light"]`) without visual flicker.

---

## 6. TypeScript Standards

* **Strict Mode**: Enable all strict compiler flags.
* **No `any`**: Use explicit interfaces from `src/types/`. When the type is unknown, use `unknown` and perform type narrowing.
* **Path Aliases**: Always use `@/` for imports from `src/` (e.g., `import { Button } from "@/components/ui/Button"`).

---

## 7. Verification Checklist Before Completion

Before presenting any frontend work:
```bash
npx tsc --noEmit
npm run lint
npm test
```
* [ ] Verify that every `.tsx` file is **≤ 70 lines**.
* [ ] Verify that `page.tsx` files only compose components.
* [ ] Verify that no `any` was introduced.
* [ ] Verify light and dark theme contrast.
* [ ] Run `npm run check:ui` and the relevant browser regressions for visual/interaction changes.
* [ ] Inspect changed screenshots before accepting new baselines; check keyboard focus and reduced motion.
* [ ] Confirm fluid workspace usage and reuse of the approved visual direction.
