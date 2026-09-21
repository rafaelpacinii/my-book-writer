# Frontend Rules

Applies to frontend code under `src/`.

## Structure

Use:

- `src/app/`
- `src/components/`
- `src/hooks/`
- `src/lib/`
- `src/types/`
- `src/utils/`

Use Next.js App Router only.

Every route at:

`src/app/<route>/page.tsx`

must compose components from:

`src/components/<route>/`

Do not implement page UI directly inside `page.tsx`.

For nested routes, mirror the route structure when appropriate.

Example:

`src/app/settings/account/page.tsx`

should use components from:

`src/components/settings/account/`

## Components

Route-specific components belong in:

`src/components/<route>/`

Reusable application-specific components belong in:

`src/components/shared/`

Generic UI primitives belong in:

`src/components/ui/`

Do not move components to `shared` or `ui` unless there is a real reuse case.

## TSX Limit

Every `.tsx` file must be at most 70 lines.

If a `.tsx` file exceeds 70 lines, split it into smaller components.

Do not satisfy this rule by:

- compressing multiple statements into one line
- removing useful whitespace
- creating unreadable JSX
- creating excessively long lines

The goal is separation of responsibilities.

## Component Responsibilities

Components should focus on:

- rendering
- composition
- event wiring
- simple local UI state

Do not place complex or reusable logic directly inside `.tsx` files.

## Hooks

Use `src/hooks/` for reusable React-specific behavior.

Examples:

- stateful behavior
- effects
- subscriptions
- reusable callbacks
- shared React logic

Do not create hooks for pure functions.

## Lib

Use `src/lib/` for:

- Tauri wrappers
- API clients
- application services
- configuration
- integrations
- synchronization interfaces

Avoid vague files such as:

- `helpers.ts`
- `misc.ts`
- `common.ts`

Prefer descriptive names.

## Utils

Use `src/utils/` for small, reusable, deterministic functions.

Utilities should preferably be pure and independent from React.

Do not place networking, SQLite, filesystem, or native access inside `utils`.

## Types

Use `src/types/` for reusable TypeScript types and interfaces.

Avoid duplicating types across files.

Small component-specific prop types may remain inside the component file.

## TypeScript

Use strict TypeScript.

Avoid `any`.

When a value is genuinely unknown, prefer `unknown` and narrow it safely.

Do not suppress TypeScript errors without a strong reason.

## Imports

Use `@/` for imports from `src/`.

Example:

```ts
import { Button } from "@/components/ui/Button";
import type { Book } from "@/types/book";
```

Relative imports are acceptable between closely related files in the same directory.

## Styling

Use Tailwind CSS.

Prefer existing UI primitives and established visual patterns.

Avoid unnecessary:

- inline styles
- CSS modules
- custom CSS files
- arbitrary Tailwind values

Use arbitrary values only when the design genuinely requires them.

## Next.js and Tauri

The frontend must remain compatible with static export.

Do not depend on:

- Server Actions
- Next.js API Routes
- runtime SSR
- a persistent Next.js server

Use `"use client"` only when necessary.

Typical reasons include:

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

Use the appropriate hook, service, or Tauri wrapper instead.

Preferred flow:

`component → hook/service → Tauri command → Rust`

## Validation

Before finishing frontend changes:

- run TypeScript checks
- run lint
- run relevant tests
- verify every `.tsx` file has at most 70 lines
- check for unnecessary `any`
- verify `page.tsx` files only compose components
- verify complex logic was not left inside components

Never claim checks passed unless they were actually executed.

## Antigravity Scope

Apply this rule to:

`src/**/*`
