# LLM PRIMARY COLLAB SPACE — Scratchpad

## Current Focus
- Pre-M1 preparation and status checks.

## Handoff Notes
- Use this file for M1 readiness updates and action items.

## Open Questions
- Confirm M0 completion in milestone tracker before starting M1.
- Identify any missing M1 prerequisites (rate limiting, session DO behavior, KV cache policy, streaming contract).

## Pre-M1 Status Check (2026-01-29)
- /chat endpoint exists at `/api/chat` and routes to DO; streaming implemented in DO.
- Session storage DO exists (SQLite-backed) with history retrieval.
- KV cache used for search responses; no chat cache policy yet.
- Rate limiting not implemented.
- Streaming contract not documented (SSE currently used).
- Tests: tenant resolution/router/tenant-config + smoke health; no streaming/session isolation/rate limit tests.

## M1 Readiness Gaps
- Define streaming response contract (SSE vs chunked) and document.
- Implement DO-based rate limiter (per tenant + per IP/user) + keying strategy.
- Add session isolation tests and rate limit enforcement tests.
- Decide on retention policy and enforce in session DO.
