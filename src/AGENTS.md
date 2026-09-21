# Frontend Rules

These rules apply to everything inside `src/`.

## Stack

Use:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

Do not use the Pages Router.

## Structure

Use:

- `src/app/`
- `src/components/`
- `src/hooks/`
- `src/lib/`
- `src/types/`
- `src/utils/`

Do not create another nested `src/`.

## Route Structure

Every route under:

`src/app/<route>/`

must have a corresponding directory under:

`src/components/<route>/`

Example:

`src/app/library/page.tsx`

must use components from:

`src/components/library/`

For nested routes, mirror the route hierarchy when appropriate.

Example:

`src/app/settings/account/page.tsx`

uses:

`src/components/settings/account/`

## Page Files

Every `page.tsx` must only compose route components.

Do not implement the page UI directly inside `page.tsx`.

Even if a page contains only one component, that component must live inside its corresponding directory under `src/components/`.

Example:

```tsx
import { Main } from "@/components/settings/Main";

export default function SettingsPage() {
  return <Main />;
}
```

Keep route files minimal.

## Route Components

Components used only by one route belong in:

`src/components/<route>/`

Example:

- `src/components/library/Header.tsx`
- `src/components/library/Main.tsx`
- `src/components/library/BookGrid.tsx`
- `src/components/library/BookCard.tsx`

Do not place route-specific components directly inside `src/components/`.

## Shared Components

Use:

`src/components/shared/`

for reusable application-specific components.

Examples:

- AppHeader
- Sidebar
- EmptyState
- ErrorState

Only move a component to `shared` when there is a real reuse case.

## UI Components

Use:

`src/components/ui/`

for generic reusable UI primitives.

Examples:

- Button
- Input
- Select
- Dialog
- Card
- Badge
- Spinner

Do not place domain-specific components inside `components/ui`.

## TSX File Limit

Every `.tsx` file has a strict maximum of 70 lines.

If a `.tsx` file exceeds 70 lines, split it into smaller components.

Never bypass this rule by:

- compressing multiple statements into one line
- removing useful whitespace
- creating unreadable JSX
- creating excessively long lines

The purpose of this rule is separation of responsibilities.

## Component Responsibilities

React components should primarily handle:

- rendering
- composition
- event wiring
- simple local UI state

Do not place complex or reusable logic directly inside `.tsx` files.

## Hooks

Use:

`src/hooks/`

for reusable React-specific behavior.

Examples:

- stateful behavior
- effects
- subscriptions
- reusable callbacks
- shared React state behavior

Do not create hooks for pure functions.

## Lib

Use:

`src/lib/`

for application infrastructure and integrations.

Examples:

- Tauri wrappers
- API clients
- service clients
- configuration
- synchronization interfaces
- external library integrations

Avoid vague files such as:

- `helpers.ts`
- `misc.ts`
- `common.ts`

Prefer descriptive names.

## Utils

Use:

`src/utils/`

for small, reusable, deterministic functions.

Utilities should preferably be pure and independent from React.

Do not place API, SQLite, filesystem, or networking access in `utils`.

## Types

Use:

`src/types/`

for reusable TypeScript types and interfaces.

Avoid duplicating types across files.

Small prop types used by only one component may remain next to that component.

## Imports

Use the `@/` alias for imports from `src/`.

Example:

```ts
import { Button } from "@/components/ui/Button";
import type { Book } from "@/types/book";
```

Relative imports are acceptable between closely related files in the same directory.

## TypeScript

Use strict TypeScript.

Avoid `any`.

When the type is genuinely unknown, prefer `unknown` and narrow it safely.

Do not suppress TypeScript errors without a strong reason.

## Tailwind CSS

Use Tailwind CSS for styling.

Prefer existing visual patterns and reusable UI primitives.

Avoid unnecessary:

- inline styles
- CSS modules
- custom CSS files
- arbitrary Tailwind values

Use arbitrary values only when the design genuinely requires them.

## Next.js and Tauri

The Next.js application must remain compatible with static export.

Do not depend on:

- Server Actions
- Next.js API Routes
- runtime SSR
- a persistent Next.js server

Use `"use client"` only when necessary.

Common reasons include:

- React state
- effects
- event handlers
- browser APIs
- Tauri frontend APIs

Keep client boundaries as small as practical.

## Native Operations

React components must not contain:

- SQL
- direct SQLite access
- filesystem implementation
- native OS logic
- Rust implementation details

Use the appropriate frontend service, hook, or Tauri wrapper.

Preferred flow:

`component → hook/service → Tauri command → Rust`

## Before Finishing

For frontend changes:

- run TypeScript checks
- run lint
- run relevant tests
- verify every `.tsx` file has at most 70 lines
- check for unnecessary `any`
- verify `page.tsx` files only compose components
- verify complex logic was not left inside components

Never claim a check passed unless it was actually executed.
