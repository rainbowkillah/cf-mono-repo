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

## M1 Implementation Progress
- Restored route-based router with tenant enforcement and added rate-limit check.
- Added RateLimiterDurableObject (SQLite) + response helper for 429.
- Added DO bindings and migrations for RATE_LIMITER in tenant and app wrangler.
- Added session retention policy (max 100 messages).
- Added SSE streaming contract doc: `docs/streaming.md`.
- Added/expanded router tests for session isolation, rate limiting, and SSE pass-through.

## M1 Additions (Rate Limiting)
- Added `packages/core/tests/rate-limit-do.test.ts` with mock SqlStorage.
- Added `docs/rate-limits.md` documenting keying strategy and limits.

## M1 Tests Added
- Rate limit keying strategy tests in router.
- Session retention test for ChatSessionDurableObject.

## Admin Updates
- M1 items checked off in docs/milestone-tracker.md.
- Agent instructions aligned with streaming/rate-limits docs and M1 status.
