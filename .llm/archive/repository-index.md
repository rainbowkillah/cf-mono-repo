# Repository Structure Index
**Generated:** 2026-01-29T16:10:08Z

## Overview
Multi-tenant Cloudflare Workers AI platform with monorepo structure. Current implementation includes basic routing, tenant resolution, Durable Objects for chat sessions, Vectorize integration, and KV caching.

---

## Directory Tree

```
cloudflare/
├── .github/
│   └── copilot-instructions.md          # GitHub Copilot configuration
├── apps/
│   └── worker-api/                      # Main API Worker
│       ├── src/
│       │   └── index.ts                 # Entry point, exports router & DO
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── core/                            # Core shared library
│       ├── src/
│       │   ├── types.ts                 # TypeScript type definitions
│       │   ├── tenant.ts                # Tenant resolution logic
│       │   ├── router.ts                # HTTP router with endpoints
│       │   ├── session-do.ts            # ChatSessionDurableObject implementation
│       │   └── responses.ts             # Response helpers (json, 404, 401)
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   ├── architecture.md                  # System architecture documentation
│   ├── failure-modes.md                 # Failure scenarios and handling
│   ├── m3-m8-breakdown.md              # Milestone breakdown (M3-M8)
│   ├── metrics.md                       # Observability metrics definitions
│   ├── milestone-tracker.md            # Milestone tracking and status
│   ├── project-organization.md         # Project structure guide
│   ├── runbooks.md                      # Operational runbooks
│   ├── tenancy.md                       # Multi-tenancy patterns
│   └── testing.md                       # Testing strategy
├── mrrainbowsmoke/                      # Tenant: mrrainbowsmoke
│   ├── .env                             # Environment variables (not committed)
│   ├── .gitignore
│   └── wrangler.toml                    # Cloudflare deployment config
├── rainbowsmokeofficial.com/            # Tenant: rainbowsmokeofficial.com
│   ├── .env                             # Environment variables (not committed)
│   ├── .gitignore
│   └── wrangler.toml                    # Cloudflare deployment config
├── AGENTS.md                            # Repository guidelines
├── GEMINI.md                            # Directory overview
├── agents.prompt.yml                    # AI agent prompts (empty)
├── plan.md                              # Implementation plan (milestones M0-M8)
├── package.json                         # Workspace root package.json
├── tsconfig.base.json                   # Base TypeScript configuration
├── tsconfig.json                        # Root TypeScript configuration
└── vitest.config.ts                     # Vitest testing configuration
```

---

## Implementation Status

### ✅ Implemented (M0-M2 Features)

#### 1. Monorepo Structure
- **Workspace setup:** Root `package.json` with workspaces for `apps/*` and `packages/*`
- **Build tooling:** TypeScript with shared tsconfig, Vitest for testing
- **Package management:** npm workspaces with workspace protocol

#### 2. Tenant Resolution (`packages/core/src/tenant.ts`)
- **Function:** `resolveTenantId(request, env)`
- **Strategy 1:** Header-based (`x-tenant-id`)
- **Strategy 2:** Environment-based (`env.TENANT_ID`)
- **Returns:** `string | null` (fails closed if no tenant)

#### 3. Type System (`packages/core/src/types.ts`)
```typescript
export type TenantId = "mrrainbowsmoke" | "rainbowsmokeofficial";

export interface Env {
  TENANT_ID: TenantId;
  AI: Ai;                              // Workers AI binding
  CACHE: KVNamespace;                  // KV namespace
  VECTORS: VectorizeIndex;             // Vectorize index
  CHAT_SESSIONS: DurableObjectNamespace; // DO namespace
  INGEST_TOKEN?: string;               // Optional auth token
}
```

#### 4. HTTP Router (`packages/core/src/router.ts`)
**Endpoints:**
- `GET /health` - Health check with tenant context
- `POST /api/ingest` - Document ingestion (requires auth token)
- `POST /api/search` - Semantic search
- `POST /api/chat` - Streaming chat

**Request Flow:**
1. Resolve tenant ID (header or env)
2. Validate tenant matches environment binding
3. Route to Durable Object for stateful operations
4. Return response or error

#### 5. Durable Object: ChatSessionDurableObject (`packages/core/src/session-do.ts`)
**Purpose:** Session state, message history, RAG, tool execution

**Storage:** SQLite table `messages` with columns:
- `id` (INTEGER PRIMARY KEY)
- `role` (TEXT: system/user/assistant)
- `content` (TEXT)
- `created_at` (INTEGER timestamp)

**Internal Endpoints:**
- `/ingest` - Embed documents and upsert to Vectorize
- `/search` - Semantic search with KV caching
- `/chat` - Streaming chat with RAG context and tools
- `/history` - Retrieve message history (last 50)

**Features:**
- **RAG Integration:** Automatic context retrieval using Vectorize
- **KV Caching:** Search results cached with 60s TTL
- **Tool Calling:** Built-in tools via `@cloudflare/ai-utils`:
  - `vector_search` - Query Vectorize for relevant chunks
  - `kv_get` - Read cached values
- **Streaming:** Server-Sent Events (SSE) format
- **Tenant Filtering:** All Vectorize queries filtered by `tenantId`

#### 6. Response Helpers (`packages/core/src/responses.ts`)
- `json(data, init?)` - JSON response with content-type header
- `notFound()` - 404 response
- `unauthorized()` - 401 response

#### 7. Worker Entry Point (`apps/worker-api/src/index.ts`)
```typescript
import { createRouter } from "@packages/core/router";
import { ChatSessionDurableObject } from "@packages/core/session-do";

export { ChatSessionDurableObject };

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return createRouter().fetch(request, env, ctx);
  }
};
```

#### 8. Tenant Configurations

**mrrainbowsmoke (`mrrainbowsmoke/wrangler.toml`):**
```toml
name = "mrrainbowsmoke-worker-api"
main = "../apps/worker-api/src/index.ts"
compatibility_date = "2025-01-01"

[vars]
TENANT_ID = "mrrainbowsmoke"

[[kv_namespaces]]
binding = "CACHE"
id = "REPLACE_WITH_KV_NAMESPACE_ID"

[[vectorize]]
binding = "VECTORS"
index_name = "mrrainbowsmoke-vectors"

[[durable_objects.bindings]]
name = "CHAT_SESSIONS"
class_name = "ChatSessionDurableObject"

[[ai]]
binding = "AI"
```

**rainbowsmokeofficial.com:** Similar structure with tenant-specific naming

---

## Key Architectural Decisions

### 1. Tenant Isolation Strategy
**Current Implementation:**
- Tenant ID resolved from `x-tenant-id` header or `env.TENANT_ID`
- All requests validated against environment binding (`env.TENANT_ID`)
- Durable Object IDs scoped: `${tenantId}:${sessionId}`
- Vectorize metadata filtering: `{ tenantId }`
- KV keys prefixed: `${tenantId}:${key}`

**Enforcement Points:**
- Router validates tenant before routing
- DO fetch() validates tenant header
- Storage operations include tenant in ID/key/filter

### 2. Storage Primitives

| Primitive | Binding | Purpose | Tenant Scoping |
|-----------|---------|---------|----------------|
| Workers AI | `AI` | Embeddings + chat generation | Via request context |
| KV | `CACHE` | Search result caching | Key prefix: `${tenantId}:` |
| Vectorize | `VECTORS` | Document embeddings | Metadata filter + index name |
| Durable Objects | `CHAT_SESSIONS` | Session state, history | DO ID: `${tenantId}:${sessionId}` |

### 3. RAG Implementation
**Pipeline:**
1. User sends message to `/api/chat`
2. Router forwards to DO: `${tenantId}:${sessionId}`
3. DO generates embedding for user message
4. DO queries Vectorize (tenant-filtered) for top-3 chunks
5. DO builds system prompt with RAG context
6. DO calls Workers AI with context + history + tools
7. DO streams response as SSE
8. DO stores user + assistant messages in SQLite

**Caching:**
- Search queries cached in KV: `rag:${tenantId}:${hash(query)}`
- TTL: 60 seconds
- Cache key includes tenant for isolation

### 4. Tool Execution
**Built-in Tools:**
- `vector_search({ query, topK })` - Semantic search
- `kv_get({ key })` - Read cached value

**Framework:** `@cloudflare/ai-utils` with `runWithTools()`

**Tool Flow:**
1. AI generates tool call (function name + args)
2. Tool handler executes with tenant context
3. Result streamed as `tool_result` event
4. AI continues with tool output

---

## API Contracts

### 1. Health Check
```bash
GET /health
Headers:
  x-tenant-id: mrrainbowsmoke

Response: 200 OK
{
  "ok": true,
  "tenantId": "mrrainbowsmoke"
}
```

### 2. Document Ingestion
```bash
POST /api/ingest
Headers:
  x-tenant-id: mrrainbowsmoke
  authorization: Bearer <INGEST_TOKEN>
Body:
{
  "documents": [
    {
      "id": "doc-1",
      "text": "Cloudflare Workers run on the edge...",
      "metadata": { "source": "docs/intro.md" }
    }
  ]
}

Response: 200 OK
{
  "ok": true,
  "count": 1
}
```

### 3. Semantic Search
```bash
POST /api/search
Headers:
  x-tenant-id: mrrainbowsmoke
Body:
{
  "query": "What are Workers?",
  "topK": 5
}

Response: 200 OK
{
  "cached": false,
  "matches": [
    {
      "id": "doc-1",
      "score": 0.92,
      "metadata": {
        "tenantId": "mrrainbowsmoke",
        "text": "Cloudflare Workers run on the edge..."
      }
    }
  ]
}
```

### 4. Streaming Chat
```bash
POST /api/chat
Headers:
  x-tenant-id: mrrainbowsmoke
Body:
{
  "sessionId": "user-123",
  "message": "How do I deploy a Worker?"
}

Response: 200 OK (SSE stream)
Content-Type: text/event-stream

event: tool_call
data: {"type":"tool_call","tool":"vector_search","args":{"query":"deploy worker"}}

event: tool_result
data: {"type":"tool_result","result":{"matches":[...]}}

event: message
data: {"content":"To deploy a Worker, use wrangler deploy..."}

event: done
data: {"ok":true}
```

---

## Dependencies

### Root Workspace
```json
{
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.9.0",
    "@cloudflare/workers-types": "^4.20260124.0",
    "typescript": "^5.6.3",
    "vitest": "^2.1.8",
    "wrangler": "^3.109.0"
  }
}
```

### apps/worker-api
```json
{
  "dependencies": {
    "@packages/core": "workspace:*"
  }
}
```

### packages/core
```json
{
  "dependencies": {
    "@cloudflare/ai-utils": "^1.2.0",
    "zod": "^3.24.1"
  }
}
```

---

## Development Workflow

### Local Development
```bash
# Start mrrainbowsmoke tenant
npm run dev:mrrainbowsmoke

# Start rainbowsmokeofficial.com tenant
npm run dev:rainbowsmokeofficial
```

### Testing
```bash
# Run all tests
npm test

# Type checking
npm run typecheck
```

### Deployment
```bash
# Deploy single tenant
npm run deploy:mrrainbowsmoke
npm run deploy:rainbowsmokeofficial
```

---

## Configuration Requirements

### Before First Deploy

1. **Create KV Namespaces:**
   ```bash
   wrangler kv:namespace create "CACHE"
   # Update wrangler.toml with namespace ID
   ```

2. **Create Vectorize Indexes:**
   ```bash
   wrangler vectorize create mrrainbowsmoke-vectors --dimensions=768 --metric=cosine
   wrangler vectorize create rainbowsmokeofficial-vectors --dimensions=768 --metric=cosine
   ```

3. **Set Environment Variables:**
   ```bash
   # Optional: Ingest authentication token
   wrangler secret put INGEST_TOKEN --config mrrainbowsmoke/wrangler.toml
   ```

4. **Deploy Durable Objects:**
   ```bash
   npm run deploy:mrrainbowsmoke
   ```

---

## Missing Components (Per Original Plan)

### From Milestones M3-M8

**M3: AI Gateway Integration**
- [ ] AI Gateway configuration in wrangler.toml
- [ ] Gateway-routed Workers AI calls
- [ ] Model routing policy
- [ ] Gateway observability integration

**M4: Advanced RAG**
- [ ] Citation extraction and formatting
- [ ] Chunking strategies package
- [ ] Prompt template system
- [ ] Safety filters

**M5: Tool System Enhancement**
- [ ] Tool registry with JSON schema validation
- [ ] Per-tenant tool permissions
- [ ] Audit logging for tool execution
- [ ] External tool integrations (weather, search, etc.)

**M6: Rate Limiting**
- [ ] Separate RateLimiterDO implementation
- [ ] Token bucket algorithm
- [ ] Per-tenant + per-client enforcement
- [ ] 429 responses with retry-after

**M7: Observability**
- [ ] Structured logging package
- [ ] Request ID propagation
- [ ] Metrics schema and export
- [ ] Dashboard configurations

**M8: Deployment Automation**
- [ ] `scripts/deploy.ts` for single tenant
- [ ] `scripts/deploy-all.ts` for batch deployment
- [ ] Config validation scripts
- [ ] Tenant scaffolding generator

---

## Testing Gaps

### No Test Files Currently Exist
**Expected locations:**
- `apps/worker-api/tests/` or `apps/worker-api/__tests__/`
- `packages/core/tests/` or `packages/core/__tests__/`
- `tests/e2e/` for end-to-end tests
- `tests/load/` for k6 load tests

**Priority Tests Needed:**
1. Tenant resolution logic
2. Cross-tenant isolation (Vectorize filters, DO IDs, KV keys)
3. Request validation (Zod schemas)
4. Tool execution and streaming
5. Cache hit/miss scenarios

---

## Documentation Status

### ✅ Comprehensive Documentation Exists

**Location:** `/docs/`

1. **architecture.md** - System design and component interactions
2. **failure-modes.md** - Error scenarios and recovery strategies
3. **m3-m8-breakdown.md** - Detailed milestone breakdown
4. **metrics.md** - Observability metrics definitions
5. **milestone-tracker.md** - Progress tracking
6. **project-organization.md** - Repository structure guide
7. **runbooks.md** - Operational procedures
8. **tenancy.md** - Multi-tenancy patterns and enforcement
9. **testing.md** - Testing strategy and guidelines

### 📋 Repository Guidelines

1. **AGENTS.md** - Development conventions
2. **GEMINI.md** - Directory overview
3. **.github/copilot-instructions.md** - GitHub Copilot configuration
4. **plan.md** - Implementation plan with milestones M0-M8

---

## Security Considerations

### Current Implementation
✅ Tenant validation on every request
✅ DO IDs include tenant prefix
✅ Vectorize queries filtered by tenant metadata
✅ KV keys prefixed with tenant ID
✅ Optional ingest token authentication

### Additional Needs
⚠️ Rate limiting (planned in M6)
⚠️ CORS configuration per tenant
⚠️ Request/response logging with PII redaction
⚠️ Audit trail for sensitive operations
⚠️ Secrets management (AI Gateway keys, external APIs)

---

## Performance Characteristics

### Measured (Estimated from Implementation)
- **RAG Context Retrieval:** Top-3 chunks from Vectorize
- **Message History:** Last 20 messages for chat context
- **Search Cache TTL:** 60 seconds
- **History Limit:** Last 50 messages retrievable via `/history`

### Unmeasured (Requires Load Testing)
- P50/P95 latency for `/chat` with RAG
- P50/P95 latency for `/search`
- Vectorize query time at scale (1k, 10k, 100k docs)
- DO concurrency limits per session
- Cache hit rate under realistic load

---

## Next Actions

### Immediate Priorities (Based on Plan)

1. **M3: AI Gateway Integration**
   - Configure AI Gateway in Cloudflare dashboard
   - Update Workers AI calls to route through gateway
   - Validate gateway logs and metrics

2. **Testing Infrastructure**
   - Create Vitest test files for existing code
   - Add integration tests with Miniflare
   - Implement tenant isolation test suite

3. **M6: Rate Limiting**
   - Implement `RateLimiterDO` class
   - Integrate into router middleware
   - Add rate limit headers to responses

4. **Observability**
   - Add structured logging to all endpoints
   - Implement request ID generation and propagation
   - Define metrics schema for analytics

5. **Deployment Automation**
   - Create deployment scripts
   - Add config validation
   - Document deployment process

---

## Summary

**Implementation Progress:** ~40% complete (M0-M2 features)

**What Works:**
- Multi-tenant routing with header-based resolution
- Durable Object sessions with SQLite storage
- RAG pipeline: ingest → embed → Vectorize → retrieve → chat
- Streaming responses with Server-Sent Events
- Tool calling (vector_search, kv_get)
- KV caching for search results

**What's Missing:**
- AI Gateway integration (direct Workers AI calls currently)
- Rate limiting enforcement
- Comprehensive test coverage
- Structured observability (logs/metrics)
- Deployment automation scripts
- Advanced RAG features (citations, chunking strategies)
- Production-ready error handling and retry logic

**Architecture Quality:**
- ✅ Type-safe with TypeScript
- ✅ Tenant isolation enforced at multiple layers
- ✅ Clean separation: router → DO → storage primitives
- ✅ Schema validation with Zod
- ⚠️ Missing: comprehensive tests, observability, rate limiting
