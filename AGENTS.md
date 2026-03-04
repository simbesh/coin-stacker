# CoinStacker Agent Guide

This file is for agentic coding tools operating in this repository.
Follow these project-specific commands and conventions first.

## Project Snapshot
- Framework: Next.js 16 (App Router) + React 19 + TypeScript.
- Package manager/runtime: Bun (`bun.lock` present, Husky hooks use Bun).
- Lint/format: Ultracite (Biome-based) via `biome.jsonc`.
- Styling: Tailwind CSS v4 + shadcn-style UI components.
- Monitoring: Sentry (`@sentry/nextjs`) integrated in config and routes.

## Source Layout
- `src/app/`: Next.js routes, layouts, API route handlers.
- `src/components/`: React components (feature + UI primitives).
- `src/components/ui/`: reusable UI primitives.
- `src/lib/`: shared utilities, constants, exchange config.
- `src/app/api/price-query/exchanges/`: exchange integrations.
- `scripts/`: utility scripts for data/tasks.

## Install / Run
- Install deps: `bun install`
- Start dev server: `bun run dev` (Turbopack, port 3050)
- Production build: `bun run build`
- Start production server: `bun run start`

## Lint / Format / Typecheck
- Check all code: `bun run check` (alias for `ultracite check`)
- Auto-fix issues: `bun run fix` (alias for `ultracite fix`)
- Direct check command: `bun x ultracite check`
- Direct fix command: `bun x ultracite fix`
- Setup diagnostics: `bun x ultracite doctor`
- Typecheck: `bun x tsc --noEmit`

## Tests (Bun)
- Run full test suite: `bun test`
- Run a single test file: `bun test src/path/to/file.test.ts`
- Run one test by name pattern: `bun test -t "regex for test name"`
- Run one named test in one file: `bun test src/path/to/file.test.ts -t "regex"`
- Coverage run: `bun test --coverage`
- Note: repository currently has no committed `*.test.*`/`*.spec.*` files.

## Commit-Time Automation
- Husky pre-commit hook runs `bun test`.
- If Bun reports "No tests found!", commit continues.
- Hook then runs `bun x ultracite fix`.
- Hook re-stages files that were already staged before formatting.
- If Ultracite cannot auto-fix issues, commit is blocked.

## Formatting Rules (from Biome config)
- Indentation: 4 spaces.
- Max line width: 120.
- Quotes: single quotes.
- Semicolons: as needed (no forced semicolons).
- Trailing commas: always where valid.
- Let Ultracite own formatting; do not hand-format against it.

## Imports and Module Conventions
- Prefer static `import` statements at top of file.
- Keep import groups clean and stable:
  1) external packages,
  2) framework packages (`next/*`),
  3) internal alias imports (`@/*`),
  4) relative imports (`./` and `../`).
- Use `import type` for type-only imports.
- Prefer `@/` path alias over deep relative traversals.
- Avoid namespace imports unless necessary (rule is relaxed, but keep usage intentional).

## TypeScript Conventions
- `strict` mode is enabled; preserve strictness.
- `noUncheckedIndexedAccess` is enabled; guard indexed reads.
- Prefer explicit parameter/return types when they improve clarity.
- Prefer `unknown` over `any`; narrow before use.
- Use discriminated unions and narrowing over assertions.
- Use `as const` for immutable literal maps when appropriate.
- Avoid non-null assertions (`!`) unless unavoidable and justified.

## Naming Conventions
- React components: PascalCase (`PriceLookupTable.tsx`).
- Hooks: `use*` prefix (`useMutableSearchParams.tsx`).
- Utility files: descriptive lower-case or kebab-case names.
- Route handlers: Next App Router convention (`route.ts` in route folder).
- Constants: `UPPER_SNAKE_CASE` for true constants, descriptive camelCase otherwise.
- Exchange IDs/keys: use existing lowercase IDs consistently (e.g., `coinspot`, `swyftx`).

## React / Next.js Practices
- Prefer function components and hooks.
- Keep hooks at top level; never call conditionally.
- Prefer Server Components by default; use `'use client'` only when needed.
- Use Next.js `Image` for images in app UI.
- Use semantic HTML first; avoid clickable non-interactive elements.
- Ensure keyboard access for interactive UI.
- Keep prop interfaces small and explicit.
- Do not define components inside components unless there is a clear reason.

## Error Handling and Observability
- Throw `Error` objects with actionable messages.
- In API routes, return explicit HTTP statuses for validation and not-found paths.
- Capture unexpected backend errors with Sentry when appropriate.
- Avoid noisy `console.log`; use structured handling and monitoring.
- Prefer early returns over deep nesting.

## Async and Data Fetching
- Use `async/await` instead of long `.then()` chains.
- Handle external API failures explicitly (timeouts, malformed payloads, missing markets).
- When aggregating multiple async calls, prefer `Promise.allSettled` when partial failure is acceptable.
- Validate inbound request payloads before heavy processing.

## Accessibility and UX Baseline
- Use labels for controls and meaningful alt text for images.
- Avoid ARIA attributes that do not match element semantics.
- Prefer native interactive elements (`button`, `a`, `input`) over `div` with roles.
- Ensure focus states and keyboard interactions are preserved.

## Performance Guidance
- Avoid unnecessary re-renders and large object recreation in render paths.
- Keep expensive transforms outside hot render loops where possible.
- Reuse shared helpers for exchange parsing/business logic.
- Avoid broad barrel exports; import what is needed.

## Security and Env
- Env vars are validated via `src/env.mjs` (`@t3-oss/env-nextjs` + Zod).
- Required server env currently includes `UMAMI_KEY` and `NODE_ENV`.
- Never hardcode secrets or commit private keys/tokens.
- Be careful with outbound links (`rel="noopener"` when using `target="_blank"`).

## Working Agreement for Agents
- Before finishing: run `bun run check`.
- For substantial logic changes: run `bun x tsc --noEmit`.
- For testable behavior: add/update tests and run `bun test` (or single-file test command).
- Keep diffs focused; avoid drive-by refactors.
- Match existing patterns in neighboring files.
- Update docs when behavior or commands change.

## Cursor / Copilot Rules Audit
- Checked for `.cursor/rules/`: none found.
- Checked for `.cursorrules`: none found.
- Checked for `.github/copilot-instructions.md`: none found.
- Existing Cursor automation: `.cursor/hooks.json` runs `bun x ultracite fix` after file edits.

## If You Add Tooling Later
- If a test runner config is added (Vitest/Jest/Playwright), update this file with:
  - canonical `bun run test` script,
  - single-file command,
  - single-test-name command,
  - CI command and coverage command.
- If Cursor/Copilot rule files are added, mirror their key directives in this document.

## One-Line Principle
Prefer clear, type-safe, accessible code that passes Ultracite and is easy for the next engineer to modify.


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.
