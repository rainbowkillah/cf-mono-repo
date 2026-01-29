# Rate Limiting Strategy

## Keying Strategy
- Primary key: `tenantId + userId` when `x-user-id` is present.
- Fallback key: `tenantId + ip` using `cf-connecting-ip` or first `x-forwarded-for` value.
- Format examples:
  - `mrrainbowsmoke:user:1234`
  - `mrrainbowsmoke:ip:203.0.113.10`

## Limits
- Default: `60 requests / 60 seconds` per key.
- Limits are enforced by `RateLimiterDurableObject`.

## Response Behavior
- Over limit returns `429 Too Many Requests` with `Retry-After` header (seconds).
- Under limit returns JSON with remaining quota and reset seconds.

## Notes
- The rate limiter is tenant-scoped and enforced at `/api/chat`.
- Policy overrides (per-tenant or per-route) can be added in M1.
