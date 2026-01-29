# Milestone Tracker

> **Project:** Cloudflare Workers AI Multi-Tenant Monorepo  
> **GitHub Project:** https://github.com/users/rainbowkillah/projects/12  
> **Total Issues:** 122  
> **Last Updated:** 2026-01-29

## Overview

This document tracks all milestones (M0-M8), Nx plugin development phases (NX-1 through NX-4), and review items. Each issue is linked to its GitHub tracking page.

---

## M0: Foundation (12 issues)
**Status:** ⏸️ Prep Phase (Start: Jan 29, 2026)  
**Focus:** Monorepo scaffolding, TypeScript setup, tenant resolution, and tooling foundation

### Critical Path Items
- 🔴 [#8](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/8) - Implement tenant resolution middleware (header/hostname priority)

### Infrastructure Setup
- [ ] [#3](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/3) - Create monorepo skeleton (apps/packages/tenants/docs/scripts/tests)
- [ ] [#4](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/4) - Set up TypeScript baseline + tsconfig for Workers runtime
- [ ] [#5](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/5) - Configure ESLint + Prettier
- [ ] [#6](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/6) - Set up Vitest test runner
- [ ] [#7](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/7) - Create project.json for each apps/* and packages/* target

### Core Implementation
- [ ] [#8](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/8) - Implement tenant resolution middleware (header/hostname priority) **CRITICAL**
- [ ] [#9](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/9) - Define tenant.config.json schema + Zod validation
- [ ] [#10](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/10) - Create core error handling + response envelopes
- [ ] [#11](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/11) - Set up local dev with wrangler dev
- [ ] [#12](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/12) - Create hello endpoint per tenant + smoke tests
- [ ] [#13](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/13) - Define Env typings source of truth (packages/core/src/env.ts)
- [ ] [#14](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/14) - Document wrangler version, ESM format decision

**Exit Criteria:**
- ✅ Local dev can resolve tenant and return `/health` response
- ✅ Any request missing tenant is rejected
- ✅ Unit tests cover tenant resolution and adapter key prefixing

---

## M1: Chat + Sessions (10 issues)
**Status:** 📋 Todo  
**Focus:** Streaming chat, Durable Object sessions, KV cache, rate limiting

### API Implementation
- [ ] [#15](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/15) - Build /chat endpoint with request schema
- [ ] [#16](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/16) - Define streaming response contract (SSE vs chunked)

### Storage & State
- [ ] [#17](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/17) - Implement Durable Object session store (tenant-scoped)
- [ ] [#18](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/18) - Add conversation history with retention policy
- [ ] [#19](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/19) - Implement KV cache layer (tenant-scoped keys)

### Rate Limiting
- [ ] [#20](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/20) - Implement DO-based rate limiter (per tenant + per IP/user)
- [ ] [#21](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/21) - Define rate limit keying strategy (tenant+user+ip)

### Testing
- [ ] [#22](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/22) - Create streaming behavior tests
- [ ] [#23](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/23) - Create session isolation tests
- [ ] [#24](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/24) - Create rate limit enforcement tests

**Exit Criteria:**
- ✅ Session messages persist for same tenant/session
- ✅ Cross-tenant session access is denied
- ✅ Rate limiter rejects over-limit requests with trace id

---

## M2: AI Gateway (7 issues)
**Status:** 📋 Todo  
**Focus:** AI Gateway integration, model routing, observability hooks

### Critical Spike
- 🔴 [#25](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/25) - Gateway integration spike - prove connectivity + configuration

### Implementation
- [ ] [#26](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/26) - Implement model routing (tenant config chooses models)
- [ ] [#27](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/27) - Add per-route model override options
- [ ] [#28](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/28) - Implement budget/limits hooks (token limits)
- [ ] [#29](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/29) - Add observability hooks (latency, status, tokens in/out)

### Documentation
- [ ] [#30](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/30) - Document AI Gateway integration in docs/ai-gateway.md
- [ ] [#31](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/31) - Document fallback behavior for API changes

**Exit Criteria:**
- ✅ All model calls pass through AI Gateway (verified by gateway logs)
- ✅ Tenant-specific model selection works
- ✅ Usage metrics (latency, tokens if available) are recorded

---

## M3: Embeddings + Vectorize + RAG (14 issues)
**Status:** 📋 Todo  
**Focus:** Ingestion pipeline, embeddings, vector search, RAG assembly

### Critical Path
- 🔴 [#41](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/41) - Ensure Vectorize indexes are tenant-scoped

### Ingestion Pipeline
- [ ] [#32](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/32) - Implement ingestion pipeline (chunking strategy)
- [ ] [#33](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/33) - Implement embedding generation
- [ ] [#34](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/34) - Implement Vectorize upsert with metadata

### Retrieval Pipeline
- [ ] [#35](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/35) - Implement retrieval pipeline (query embedding)
- [ ] [#36](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/36) - Implement Vectorize search
- [ ] [#37](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/37) - Add optional rerank hook interface

### RAG Assembly
- [ ] [#38](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/38) - Implement RAG response assembly with prompt template
- [ ] [#39](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/39) - Add citations to RAG responses
- [ ] [#40](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/40) - Implement basic safety filters

### Tenant Isolation
- [ ] [#41](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/41) - Ensure Vectorize indexes are tenant-scoped **CRITICAL**

### Testing
- [ ] [#42](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/42) - Create deterministic fixture retrieval tests
- [ ] [#43](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/43) - Create tenant isolation tests for Vectorize
- [ ] [#44](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/44) - Create metadata integrity tests

### Documentation
- [ ] [#45](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/45) - Document Vectorize local emulation limitations + staging strategy

**Exit Criteria:**
- ✅ Ingested docs are retrievable for correct tenant only
- ✅ Retrieval returns deterministic results with fixture docs
- ✅ Vectorize queries fail closed without tenant context

---

## M4: AI Search UX Endpoint (8 issues)
**Status:** 📋 Todo  
**Focus:** /search endpoint, query processing, caching, metrics

### API Implementation
- [ ] [#46](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/46) - Build /search endpoint with output schema
- [ ] [#47](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/47) - Define output schema: answer + sources + confidence + follow-ups
- [ ] [#48](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/48) - Implement query rewriting / intent detection

### Performance
- [ ] [#49](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/49) - Implement caching for common queries (tenant-scoped KV)
- [ ] [#50](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/50) - Add search latency metrics
- [ ] [#51](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/51) - Add cache hit rate metrics

### Testing
- [ ] [#52](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/52) - Create schema validation tests
- [ ] [#53](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/53) - Create caching behavior tests

**Exit Criteria:**
- ✅ /search returns answer + sources + confidence fields
- ✅ Citations trace back to Vectorize metadata
- ✅ Cache hit reduces latency for repeat queries

---

## M5: Tool/Function Execution System (13 issues)
**Status:** 📋 Todo  
**Focus:** Tool registry, dispatcher, permissions, audit logging

### Core Infrastructure
- [ ] [#54](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/54) - Define tool schema (JSON schema for name, args, permissions)
- [ ] [#55](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/55) - Implement tool dispatcher with registry
- [ ] [#56](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/56) - Implement validation + auth/permission gating

### Tool Implementations
- [ ] [#57](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/57) - Implement tool: summarize
- [ ] [#58](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/58) - Implement tool: extract entities
- [ ] [#59](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/59) - Implement tool: classify intent
- [ ] [#60](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/60) - Implement tool: tag/chunk docs
- [ ] [#61](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/61) - Implement tool: ingest docs

### Security & Observability
- [ ] [#62](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/62) - Implement audit logging (tool name + args hash + outcome)

### Testing
- [ ] [#63](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/63) - Create permission tests
- [ ] [#64](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/64) - Create injection guard tests
- [ ] [#65](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/65) - Create tool correctness tests

### Documentation
- [ ] [#66](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/66) - Document tool contracts

**Exit Criteria:**
- ✅ Invalid tool calls rejected with explicit error
- ✅ Each tool execution logged with tenant + request id
- ✅ Tool registry supports enable/disable per tenant

---

## M6: TTS Adapter Boundary (7 issues)
**Status:** 📋 Todo  
**Focus:** Text-to-speech interface, provider abstraction, stub implementation

### API Contracts
- [ ] [#67](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/67) - Define /tts contract (input: text, voice, format, streaming)
- [ ] [#68](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/68) - Define output contract (audio stream or job id)

### Implementation
- [ ] [#69](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/69) - Implement adapter interface
- [ ] [#70](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/70) - Implement stub with 'not enabled' behavior
- [ ] [#71](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/71) - If feasible: implement provider adapter

### Testing
- [ ] [#72](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/72) - Create contract tests
- [ ] [#73](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/73) - Create stub behavior tests

**Exit Criteria:**
- ✅ TTS endpoint exists with clear contract
- ✅ Adapter interface allows future provider integration
- ✅ Stub implementation returns appropriate error when not configured

---

## M7: Observability, Metrics, QA Gates (12 issues)
**Status:** 📋 Todo  
**Focus:** Structured logging, metrics, load testing, CI gates

### Logging & Tracing
- [ ] [#74](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/74) - Finalize logging schema with required fields
- [ ] [#75](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/75) - Define correlation IDs and tracing strategy

### Metrics Implementation
- [ ] [#76](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/76) - Implement metrics helpers
- [ ] [#77](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/77) - Implement required metrics
- [ ] [#78](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/78) - Add cost monitoring metrics (token usage)
- [ ] [#79](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/79) - Create dashboards/alerts suggestions document

### Testing & QA
- [ ] [#80](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/80) - Create load test scripts
- [ ] [#81](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/81) - Create retrieval quality 'smoke score' regression suite
- [ ] [#82](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/82) - Create streaming stability tests
- [ ] [#83](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/83) - Set up CI gates (lint, typecheck, unit, integration)

### Documentation
- [ ] [#84](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/84) - Document failure mode template
- [ ] [#85](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/85) - Document external dependency failure strategies

**Exit Criteria:**
- ✅ Logs include tenantId, requestId, latency, route
- ✅ Required metrics are emitted and can be queried
- ✅ Load tests pass with defined thresholds
- ✅ CI gates prevent broken code from merging

---

## M8: Deployment Automation (8 issues)
**Status:** 📋 Todo  
**Focus:** Deployment scripts, drift detection, runbooks

### Critical Path
- 🔴 [#91](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/91) - Define multi-account credential strategy

### Deployment Scripts
- [ ] [#86](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/86) - Create deployment script: deploy one tenant
- [ ] [#87](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/87) - Create deployment script: deploy all tenants
- [ ] [#88](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/88) - Add environment selection (dev/stage/prod)

### Validation & Safety
- [ ] [#89](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/89) - Implement config validation (fail fast)
- [ ] [#90](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/90) - Implement drift detection (expected vs deployed)
- [ ] [#91](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/91) - Define multi-account credential strategy **CRITICAL**

### Runbooks
- [ ] [#92](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/92) - Create deploy rollback runbook
- [ ] [#93](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/93) - Create incident response runbook

**Exit Criteria:**
- ✅ `deploy <tenant>` works without manual config edits
- ✅ `deploy-all` fails safely per tenant and reports status

---

## Nx Plugin Development

### NX-1: Plugin Foundation (6 issues)
**Status:** 📋 Todo

- [ ] [#94](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/94) - Create Nx plugin package skeleton (packages/nx-cloudflare)
- [ ] [#95](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/95) - Implement init generator
- [ ] [#96](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/96) - Add shared utilities: parse tenant config
- [ ] [#97](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/97) - Add shared utilities: update JSONC (use jsonc-parser)
- [ ] [#98](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/98) - Add shared utilities: validate config
- [ ] [#99](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/99) - Set up plugin testing infrastructure

### NX-2: Worker Generator (5 issues)
**Status:** 📋 Todo

- [ ] [#100](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/100) - Scaffold worker-api template with tenant middleware
- [ ] [#101](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/101) - Add /health endpoint to template
- [ ] [#102](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/102) - Add project.json targets for dev/test/deploy
- [ ] [#103](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/103) - Define executor-to-wrangler mapping
- [ ] [#104](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/104) - Create worker generator tests

### NX-3: Tenant Generator (5 issues)
**Status:** 📋 Todo

- [ ] [#105](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/105) - Scaffold tenant folder structure
- [ ] [#106](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/106) - Generate tenant.config.json template
- [ ] [#107](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/107) - Generate wrangler.jsonc template
- [ ] [#108](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/108) - Add tenant registry file for discoverability
- [ ] [#109](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/109) - Create tenant generator tests

### NX-4: Binding & Deploy Generators (8 issues)
**Status:** 📋 Todo

- [ ] [#110](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/110) - Implement binding generator (KV/DO/Vectorize/AI)
- [ ] [#111](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/111) - Update Env typing from single canonical file
- [ ] [#112](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/112) - Add DO class skeleton generation
- [ ] [#113](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/113) - Implement deployAll executor
- [ ] [#114](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/114) - Add concurrency policy to deployAll
- [ ] [#115](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/115) - Add dry-run mode to deployAll
- [ ] [#116](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/116) - Add continue-on-error flag to deployAll
- [ ] [#117](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/117) - Create binding generator/executor tests

---

## Review Items (7 issues)
**Status:** 📋 Todo  
**Focus:** Strategic improvements identified by Codex/Gemini

- [ ] [#118](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/118) - Add explicit milestone dependency mapping
- [ ] [#119](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/119) - Quantify exit criteria with specific metrics
- [ ] [#120](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/120) - Define E2E testing layer
- [ ] [#121](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/121) - Add security testing activities
- [ ] [#122](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/122) - Establish performance baselines
- [ ] [#123](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/123) - Define AuthN/AuthZ strategy
- [ ] [#124](https://github.com/rainbowkillah/cloudflare-mono-repo/issues/124) - Pick logging/metrics sink

---

## Priority Legend

- 🔴 **CRITICAL** - Blocking other work, must be resolved first
- 🟠 **HIGH** - Should be done soon, significant impact
- 🟡 **MEDIUM** - Standard priority
- 🟢 **LOW** - Nice to have, can be deferred

## Status Legend

- ✅ Done
- 🚧 In Progress
- 📋 Todo
- ⏸️ Prep/Planning
- 🔍 Spike/Research
