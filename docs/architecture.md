# Architecture (Cloudflare Workers Primitives)

## Purpose
This document describes how the runtime maps directly onto Cloudflare Workers primitives and how data flows across the system.

## Primitive mapping
- **Workers AI**
  - Model inference (chat) and embeddings.
- **AI Gateway**
  - Routing, policy enforcement, usage tracking for all AI calls.
- **Vectorize**
  - Tenant-scoped embedding storage and retrieval.
- **KV**
  - Lightweight caches, feature flags, prompt versions.
- **Durable Objects**
  - Chat sessions, rate limiting, and (optional) ingestion job coordination.

## Request lifecycle
1) **Worker entry** receives HTTP request.
2) **Tenant middleware** resolves tenant identity before any AI/storage calls.
3) **Policy checks** run (rate limits, allowed models, feature flags).
4) **AI Gateway** routes requests to **Workers AI**.
5) **Vectorize** handles retrieval for RAG endpoints.
6) **Durable Objects** store session history and enforce rate limits.
7) **KV** stores cached responses and configuration.

## Core components
- `apps/worker-api`
  - `/health` tenant health check
  - `/api/chat` streaming chat
  - `/api/search` RAG search
  - `/api/ingest` ingestion
- `apps/ingest-worker` (optional)
  - ingestion pipeline and batch embedding
- `packages/core`
  - tenant resolution, router, schemas, errors
- `packages/ai`
  - AI Gateway wrappers and model routing
- `packages/rag`
  - chunking, retrieval, citations
- `packages/storage`
  - tenant-safe adapters for KV/Vectorize/DO
- `packages/observability`
  - logs and metrics helpers

## Tenancy enforcement points
- Tenant resolution runs before any handler.
- All storage keys and DO IDs include tenant.
- Vectorize queries must include tenant filters or tenant-specific indexes.
- AI Gateway routes are tenant-scoped.

## Boundaries and interfaces
- **TenantContext** is created at the edge and passed to handlers.
- Storage adapters require `tenantId` in method signatures.
- Durable Objects require `x-tenant-id` header for all requests.

## Deployment notes
- Single-tenant deployments can set `TENANT_ID` in `wrangler.jsonc`.
- Multi-tenant deployments must pass `x-tenant-id` on every request and enforce tenant isolation in storage adapters.

