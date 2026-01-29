# Repository Guidelines
_Last updated: 2026-01-29_

## LLM PRIMARY COLLAB SPACE
- `.llm/` is the shared workspace for Copilot, Claude, Codex, and Gemini.
- Use `.llm/scratchpad.md` for handoffs and short-term coordination.
- Export chat/context/session notes to `.llm/archive/` (timestamped files).
- Never store secrets or `.env` contents in `.llm/`.

## Project Structure & Module Organization
- Monorepo layout with `apps/`, `packages/`, `docs/`, `tenants/`, `scripts/`, and `tests/`.
- Runtime code lives in `apps/*/src` and `packages/*/src`.
- Tenant-specific config lives in `tenants/<tenant-id>/` with `tenant.config.json` and `wrangler.toml`.

## Build, Test, and Development Commands
- `npm run dev:mrrainbowsmoke` — start local dev for mrrainbowsmoke tenant.
- `npm run dev:rainbowsmokeofficial` — start local dev for rainbowsmokeofficial tenant.
- `npm run dev:worker-api` — start local dev for worker-api app.
- `npm test` — run the Vitest suite.
- `npm run typecheck` — TypeScript typecheck.

## Coding Style & Naming Conventions
- ESLint and Prettier configs are present (`.eslintrc.cjs`, `.prettierrc`).
- Keep file and directory names lowercase and hyphenated where possible (e.g., `user-profile/`, `site-header.tsx`).

## Testing Guidelines
- Vitest is configured via `vitest.config.ts`.
- Unit tests live under `packages/*/tests` and `tests/` for shared suites.
- Run all tests with `npm test`.

## Commit & Pull Request Guidelines
- This directory is a Git repository.
- If Git is initialized, use clear, imperative commit messages (e.g., "Add landing page hero").
- Pull requests should include a short description, steps to verify, and screenshots for UI changes.

## Security & Configuration Tips
- Do not commit `.env` files or secrets. Use `.env.example` for shared configuration.
- Validate new configuration values locally before sharing.

### Primary Documents
- **[plan.md](../plan.md)** - Master project plan with milestones (now with GitHub links)
- **[milestone-tracker.md](./milestone-tracker.md)** - Complete task list with checkboxes
- **[m3-m8-breakdown.md](./m3-m8-breakdown.md)** - Detailed view of M3-M8 tasks

### Architecture & Design
- **[architecture.md](./architecture.md)** - System design and component interactions
- **[tenancy.md](./tenancy.md)** - Tenant isolation patterns and enforcement
- **[testing.md](./testing.md)** - Testing strategy and harness details
- **[metrics.md](./metrics.md)** - Observability schema and dashboard configurations
- **[failure-modes.md](./failure-modes.md)** - Documented failure scenarios
- **[runbooks.md](./runbooks.md)** - Operational procedures
