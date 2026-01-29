# Directory Overview
_Last updated: 2026-01-29_

## LLM PRIMARY COLLAB SPACE
- `.llm/` is the shared workspace for Copilot, Claude, Codex, and Gemini.
- Use `.llm/scratchpad.md` for handoffs and short-term coordination.
- Export chat/context/session notes to `.llm/archive/` (timestamped files).
- Never store secrets or `.env` contents in `.llm/`.

This repository is a Cloudflare Workers multi-tenant monorepo. It contains the worker app, shared core packages, tenant configs, and supporting documentation.

## Key Files

- **`AGENTS.md`**: Repository guidelines and development conventions.
- **`plan.md`**: Master plan with milestones and GitHub issue links.
- **`agents.prompt.yml`**: AI agent prompt configuration.
- **`apps/worker-api/`**: Primary Worker application.
- **`packages/core/`**: Shared core logic (routing, tenancy, DOs).
- **`tenants/`**: Per-tenant configs (`tenant.config.json`, `wrangler.toml`).

## Usage

Use this repo to build and deploy the multi-tenant Workers platform. Follow `AGENTS.md` for conventions, and keep progress aligned with `plan.md`.

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
