# Copilot Instructions for Cloudflare Workers AI Multi-Tenant Monorepo

## Project Overview

This is a multi-tenant Cloudflare Workers AI platform built as a monorepo. The project is in the **initial planning and scaffolding phase** with two tenant directories (`mrrainbowsmoke/` and `rainbowsmokeofficial.com/`) awaiting implementation.

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

**Core capabilities being built:**
- Workers AI inference with streaming chat
- AI Gateway integration for policy/routing/observability
- Vectorize for embeddings and RAG
- Durable Objects for sessions and rate limiting
- KV for caching and tenant metadata
- Tool/function execution system
- Text-to-speech adapter boundary (provider-agnostic)

## Architecture

### Target Structure
```
/apps/
  worker-api/        # Primary API surface (/chat, /search, /tools, /ingest, /tts)
  ingest-worker/     # Document ingestion pipeline (optional separation)
/packages/
  core/              # Tenant resolution, middleware, schemas, errors
  storage/           # KV/DO/Vectorize adapters (tenant-aware)
  rag/               # Chunking, prompting, citations, safety filters
  observability/     # Structured logs + metrics helpers
  testing/           # Fixtures, harness, local runners
  nx-cloudflare/     # Nx plugin for scaffolding/deployment (future)
/tenants/<tenant-id>/
  tenant.config.json # Tenant-specific configuration
  wrangler.jsonc     # Cloudflare deployment config
  policies.json      # Optional AI policies
  prompts/           # Optional prompt templates
```

### Key Architectural Principles

**Tenant Isolation (Non-Negotiable):**
- Every request MUST resolve tenant context before any storage/AI call
- All storage bindings MUST be tenant-scoped (KV namespaces, DO IDs, Vectorize indexes)
- No cross-tenant reads/writes unless explicit shared policy exists

**Tenant Resolution:**
- Middleware resolves tenant via header or hostname (configurable priority)
- Tenant context is attached to request lifecycle
- Requests without valid tenant context must be rejected

**Storage Scoping:**
- KV: Tenant-prefixed keys or per-tenant namespaces
- Durable Objects: Tenant ID included in object ID
- Vectorize: Per-tenant index names in tenant config

## Development Workflow (When Implemented)

### Build & Test Commands
Not yet configured. When tooling is added:
- `nx dev <project> --tenant=<id>` - Start local dev server for a tenant
- `nx test <project>` - Run unit tests
- `nx build <project>` - Build production assets
- `nx deploy <project> --tenant=<id>` - Deploy one tenant
- `nx deployAll <project>` - Deploy all tenants

### Nx Plugin (Future)
An Nx plugin is planned (`packages/nx-cloudflare/`) to provide generators and executors comparable to `wrangler` and `create-cloudflare`:
- **Generators:** `worker`, `tenant`, `binding`, `rag-module`
- **Executors:** `dev`, `test`, `deploy`, `deployAll`

## Code Conventions

### File Naming
- Lowercase and hyphenated: `user-profile/`, `site-header.tsx`
- Tests: `*.test.ts` pattern (when testing is configured)

### Source Organization
- Runtime code in `src/` directories
- Tests in `tests/` or `__tests__/` directories
- Tenant configs in `/tenants/<tenant-id>/`

### Security & Configuration
- **Never commit `.env` files or secrets**
- Use `.env.example` for shared configuration templates
- All tenant configurations stored in `tenant.config.json`
- Minimum tenant config fields:
  - `tenantId`, `accountId`, `hostnameMapping`
  - `ai` (models, gateway routes, budgets)
  - `vectorize` (index names)
  - `kv` (namespace mappings)
  - `do` (class + binding names)
  - `cors` (origins)
  - `featureFlags`

### Commit Guidelines
- Use clear, imperative messages: "Add landing page hero", "Fix tenant resolution"
- Include description, verification steps, and screenshots for UI changes in PRs

## Implementation Plan

The project follows a milestone-based approach (M0-M8) defined in `plan.md`:

1. **M0:** Foundation - monorepo setup, tenant resolution middleware, tooling
2. **M1:** Streaming chat + sessions (DO) + KV cache + rate limiting
3. **M2:** AI Gateway integration + model routing policy
4. **M3:** Embeddings + Vectorize + RAG assembly
5. **M4:** AI Search UX endpoint
6. **M5:** Tool/function execution system
7. **M6:** TTS contract + adapter boundary
8. **M7:** Observability, metrics, QA gates, load tests
9. **M8:** Repeatable deployment per tenant + drift detection

**Current Status:** Pre-M0 (planning phase). No source code implemented yet.

## Critical Constraints

### Mandatory Validation
- **Strict request validation** on every endpoint
- **CORS locked down** per tenant
- **Rate limiting** per tenant per IP/user key
- **Log redaction** (no PII, tokens, or raw prompts unless explicitly enabled)

### Failure Mode Documentation
Every component must document:
- Expected failure scenarios
- Fallback behavior
- Observability signals (logs/metrics)

### Observability First
- All operations emit structured logs with: `request_id`, `tenant`, `route`, `latency`
- Metrics definitions, logging schema, and dashboard/alert suggestions are first-class deliverables
- Each milestone requires runnable demo, passing tests, and measurable success criteria

## Testing Strategy (When Implemented)

### Unit Tests
- Fully local, no external dependencies
- Mock tenant contexts and storage adapters

### Integration Tests
- Use staging resources per tenant where needed (CI-gated)
- Tenant isolation tests mandatory for any storage operation
- Contract tests for streaming responses and tool execution

### Local Dev Parity
- Unit tests fully local
- Integration tests use staging resources where Vectorize/Workers AI cannot be simulated

## Documentation Requirements

Refer to these documents as they're created in `/docs/`:
- `architecture.md` - System design and component interactions
- `tenancy.md` - Tenant isolation patterns and enforcement
- `metrics.md` - Observability schema and dashboard configurations
- `testing.md` - Testing strategy and harness details
- `ai-gateway.md` - AI Gateway routing and configuration

## AI Assistant Configuration Files

This repository uses:
- **AGENTS.md** - Repository guidelines (current placeholder)
- **GEMINI.md** - Directory overview (current state documentation)
- **.github/copilot-instructions.md** - This file

When making changes, ensure consistency across these files.
