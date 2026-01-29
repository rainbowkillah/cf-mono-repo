# Copilot Instructions for Cloudflare Workers AI Multi-Tenant Monorepo
_Last updated: 2026-01-29_

## Project Overview

This is a multi-tenant Cloudflare Workers AI platform built as a monorepo. M0 is in progress with core tenant resolution, routing, and test infrastructure in place. Two tenants are configured: `mrrainbowsmoke` and `rainbowsmokeofficial`.

### Primary Documents
 **[plan.md](../plan.md)** - Master project plan with milestones (now with GitHub links)
 **[milestone-tracker.md](./milestone-tracker.md)** - Complete task list with checkboxes
 **[m3-m8-breakdown.md](./m3-m8-breakdown.md)** - Detailed view of M3-M8 tasks
 **[local-dev.md](./local-dev.md)** - Wrangler local development guide

### Architecture & Design
 **[architecture.md](./architecture.md)** - System design and component interactions
 **[tenancy.md](./tenancy.md)** - Tenant isolation patterns and enforcement
 **[testing.md](./testing.md)** - Testing strategy and harness details
 **[metrics.md](./metrics.md)** - Observability schema and dashboard configurations
 **[failure-modes.md](./failure-modes.md)** - Documented failure scenarios
 **[runbooks.md](./runbooks.md)** - Operational procedures

**Core capabilities being built:**
- Workers AI inference with streaming chat
- AI Gateway integration for policy/routing/observability
- Vectorize for embeddings and RAG
- Durable Objects for sessions and rate limiting
- KV for caching and tenant metadata
- Tool/function execution system
- Text-to-speech adapter boundary (provider-agnostic)

## Architecture

### Current Structure (M0)
```
/apps/
  worker-api/           # ✅ Primary API Worker (index.ts)
/packages/
  core/                 # ✅ Tenant resolution, router, types, DO
    src/
      env.ts            # ✅ Env source of truth
      types.ts          # ✅ Type definitions (Env, TenantId)
      tenant.ts         # ✅ Tenant resolution logic
      tenant-config.ts  # ✅ Tenant config schema
      router.ts         # ✅ HTTP router with validation
      responses.ts      # ✅ Response helpers (json, 404, 401)
      session-do.ts     # ✅ ChatSessionDurableObject
    tests/              # ✅ Unit tests (count may vary)
/tenants/<tenant-id>/
  wrangler.toml         # ✅ Cloudflare deployment config
  tenant.config.json    # ✅ Tenant configuration
  .env                  # (local, not committed)
  .env.example          # ✅ Environment template
```

### Planned Additions (M1+)
```
/packages/
  storage/           # KV/DO/Vectorize adapters (tenant-aware)
  rag/               # Chunking, prompting, citations, safety filters
  observability/     # Structured logs + metrics helpers
  testing/           # Integration test fixtures
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

## Development Workflow (M0 In Progress)

### Build & Test Commands
```bash
# Type checking
npm run typecheck

# Run tests
npm test

# Local development
npm run dev:mrrainbowsmoke
npm run dev:rainbowsmokeofficial

# Deploy (requires KV/Vectorize setup)
npm run deploy:mrrainbowsmoke
npm run deploy:rainbowsmokeofficial
```

### Future Nx Plugin
An Nx plugin is planned (`packages/nx-cloudflare/`) for M8:
- **Generators:** `worker`, `tenant`, `binding`, `rag-module`
- **Executors:** `dev`, `test`, `deploy`, `deployAll`

## Code Conventions

### File Naming
- Lowercase and hyphenated: `user-profile/`, `site-header.tsx`
- Tests: `*.test.ts` pattern (configured with vitest)

### Source Organization
- Runtime code in `src/` directories
- Tests in `tests/` or `__tests__/` directories
- Tenant configs in `/tenants/<tenant-id>/`

### Security & Configuration
- **Never commit `.env` files or secrets**
- Use `.env.example` for shared configuration templates (✅ created)
- Tenant configurations in `wrangler.toml` include:
  - `[vars]` with TENANT_ID
  - `[[kv_namespaces]]` for CACHE binding
  - `[[vectorize]]` for VECTORS binding
  - `[[durable_objects.bindings]]` for CHAT_SESSIONS
  - `[ai]` for AI binding
  - Optional: INGEST_TOKEN secret

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

**Current Status:** 🚧 **M0 In Progress**

**M0 Progress:**
- ✅ Monorepo structure with npm workspaces
- ✅ Tenant resolution middleware (header + env fallback)
- ✅ HTTP router with type-safe routing
- ✅ Response helpers (json, 404, 401)
- ✅ Durable Object for chat sessions
- ✅ Test infrastructure (vitest)
- ✅ TypeScript strict mode
- ✅ .env.example templates

**Next:** M1 (Rate Limiting + Session Management)

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

## Testing Strategy (M0 Implemented)

### Unit Tests ✅
- **Status:** 19 tests passing (100%)
- **Framework:** Vitest with node environment
- **Coverage:**
  - Tenant resolution (6 tests)
  - Router logic (8 tests)
  - Response helpers (5 tests)
- Fully local, no external dependencies
- Mock tenant contexts and storage adapters

### Integration Tests (M1+)
- Use staging resources per tenant where needed (CI-gated)
- Tenant isolation tests mandatory for any storage operation
- Contract tests for streaming responses and tool execution

### Commands
```bash
npm test                  # Run all tests
npm run typecheck         # TypeScript validation
```

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
- **.llm/** - LLM PRIMARY COLLAB SPACE (scratchpad + archive)

When making changes, ensure consistency across these files.
