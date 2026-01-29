# Cloudflare Workers AI Multi-Tenant Platform

Multi-tenant AI platform built on Cloudflare Workers primitives: Workers AI, AI Gateway, Vectorize, KV, and Durable Objects.

## Features

- 🤖 **Workers AI** - Text generation and embeddings
- 🔀 **AI Gateway** - Model routing, budgets, and observability
- 🔍 **Vectorize** - Vector similarity search for RAG
- 💾 **KV** - Configuration and result caching  
- 🔄 **Durable Objects** - Session state and rate limiting
- 🏢 **Multi-tenancy** - Strict tenant isolation at every layer
- 📡 **Streaming** - Server-Sent Events for chat responses
- 🛠️ **Tool Calling** - Built-in tools (vector_search, kv_get)

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cloudflare account with Workers AI access

### Installation

```bash
# Clone repository
git clone <repository-url>
cd cloudflare

# Install dependencies
npm install

# Type check
npm run typecheck

# Run tests
npm test
```

### Local Development

```bash
# Start local dev server for a tenant
npm run dev:mrrainbowsmoke

# Or for the other tenant
npm run dev:rainbowsmokeofficial
```

### Testing the API

```bash
# Health check
curl -H "x-tenant-id: mrrainbowsmoke" http://localhost:8787/health

# Expected response:
# {"ok": true, "tenantId": "mrrainbowsmoke"}
```

## Architecture

```
┌─────────────────────────────────────────┐
│         HTTP Request (Edge)              │
│   Header: x-tenant-id: <tenant>         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│     Tenant Resolution Middleware         │
│  (Validates tenant + enforces isolation) │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│           HTTP Router                     │
│  /health  /api/chat  /api/search  etc.  │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────┐     ┌──────────┐
│ Workers  │     │ Durable  │
│   AI     │     │ Objects  │
│          │     │ Sessions │
│ Vectorize│     │ History  │
│          │     │ Cache    │
└──────────┘     └──────────┘
```

### Tenant Isolation

Every request **must** resolve a tenant before accessing any resource:

1. **Resolution**: `x-tenant-id` header OR `env.TENANT_ID` binding
2. **Validation**: Tenant matches environment binding
3. **Scoping**: 
   - Durable Object IDs: `${tenantId}:${resourceId}`
   - KV keys: `${tenantId}:${key}`
   - Vectorize metadata filter: `{ tenantId }`

## API Endpoints

### Health Check

```bash
GET /health
Headers: x-tenant-id: <tenant>

Response: { "ok": true, "tenantId": "<tenant>" }
```

### Document Ingestion

```bash
POST /api/ingest
Headers: 
  x-tenant-id: <tenant>
  authorization: Bearer <token>
Body: {
  "documents": [
    {
      "id": "doc-1",
      "text": "Document content...",
      "metadata": { "source": "file.md" }
    }
  ]
}

Response: { "ok": true, "count": 1 }
```

### Semantic Search

```bash
POST /api/search
Headers: x-tenant-id: <tenant>
Body: {
  "query": "What is Cloudflare Workers?",
  "topK": 5
}

Response: {
  "cached": false,
  "matches": [
    {
      "id": "doc-1",
      "score": 0.92,
      "metadata": { "text": "...", "tenantId": "..." }
    }
  ]
}
```

### Streaming Chat

```bash
POST /api/chat
Headers: x-tenant-id: <tenant>
Body: {
  "sessionId": "user-123",
  "message": "How do I deploy?"
}

Response: (Server-Sent Events)
event: tool_call
data: {"type":"tool_call","tool":"vector_search",...}

event: tool_result
data: {"type":"tool_result","result":{...}}

event: message
data: {"content":"To deploy, use wrangler deploy..."}

event: done
data: {"ok":true}
```

## Project Structure

```
/
├── apps/
│   └── worker-api/          # Main API Worker
│       └── src/
│           └── index.ts     # Worker entry point
├── packages/
│   └── core/                # Shared core library
│       ├── src/
│       │   ├── types.ts     # Type definitions
│       │   ├── tenant.ts    # Tenant resolution
│       │   ├── router.ts    # HTTP router
│       │   ├── session-do.ts # Chat session DO
│       │   └── responses.ts # Response helpers
│       └── tests/           # Unit tests
├── tenants/
│   ├── mrrainbowsmoke/
│   │   └── wrangler.toml    # Tenant config
│   └── rainbowsmokeofficial/
│       └── wrangler.toml
├── docs/                    # Documentation
├── package.json             # Workspace root
└── vitest.config.ts         # Test configuration
```

## Development Commands

```bash
# Run type checking
npm run typecheck

# Run tests
npm test

# Start local dev for a tenant
npm run dev:mrrainbowsmoke
npm run dev:rainbowsmokeofficial

# Deploy a tenant
npm run deploy:mrrainbowsmoke
npm run deploy:rainbowsmokeofficial
```

## Configuration

Each tenant has its own `wrangler.toml` in `tenants/<tenant-id>/`:

```toml
name = "tenant-worker-api"
main = "../../apps/worker-api/src/index.ts"
compatibility_date = "2025-01-01"

[vars]
TENANT_ID = "tenant-name"

[[kv_namespaces]]
binding = "CACHE"
id = "<KV_NAMESPACE_ID>"

[[vectorize]]
binding = "VECTORS"
index_name = "tenant-vectors"

[[durable_objects.bindings]]
name = "CHAT_SESSIONS"
class_name = "ChatSessionDurableObject"

[ai]
binding = "AI"
```

## Testing

### Unit Tests

```bash
npm test
```

Tests cover:
- Tenant resolution logic
- Request routing and validation
- Response helpers
- Tenant isolation enforcement

### Test Coverage

- **19 tests** passing
- **Tenant resolution**: 6 tests
- **Router logic**: 8 tests
- **Response helpers**: 5 tests

## Deployment

### Prerequisites

1. **Create KV Namespaces**:
   ```bash
   wrangler kv:namespace create "CACHE"
   # Update wrangler.toml with the returned ID
   ```

2. **Create Vectorize Indexes**:
   ```bash
   wrangler vectorize create mrrainbowsmoke-vectors --dimensions=768 --metric=cosine
   wrangler vectorize create rainbowsmokeofficial-vectors --dimensions=768 --metric=cosine
   ```

3. **Set Secrets** (optional):
   ```bash
   wrangler secret put INGEST_TOKEN --config tenants/mrrainbowsmoke/wrangler.toml
   ```

### Deploy

```bash
# Deploy single tenant
npm run deploy:mrrainbowsmoke

# Deploy all tenants (when automation is ready)
# npm run deploy-all
```

## Current Status

**Milestone:** M0 (Foundation) - ✅ Completing

**What Works:**
- ✅ Monorepo structure with npm workspaces
- ✅ Tenant resolution and validation
- ✅ HTTP routing with type safety
- ✅ Durable Objects for sessions
- ✅ Full RAG pipeline (ingest → Vectorize → retrieve)
- ✅ Streaming chat with Server-Sent Events
- ✅ Tool calling (vector_search, kv_get)
- ✅ KV caching
- ✅ **Test suite: 19/19 passing**

**Next Steps (M1-M8):**
- AI Gateway integration
- Rate limiting (Durable Object)
- Advanced observability
- Deployment automation

## Documentation

Comprehensive docs in `/docs/`:
- `architecture.md` - System design
- `tenancy.md` - Multi-tenancy patterns
- `testing.md` - Testing strategy
- `metrics.md` - Observability
- `runbooks.md` - Operational guides

## Contributing

See [AGENTS.md](./AGENTS.md) for development conventions.

## License

[Add license information]

## Support

[Add support information]
