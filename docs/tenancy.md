# Tenancy Model

## Goals
- Strict isolation across tenants.
- Every request resolves tenant identity before any storage or AI call.
- All storage access and model usage is tenant-scoped.

## Tenant resolution
Resolution order (current):
1) `x-tenant-id` header (preferred for multi-tenant).
2) `TENANT_ID` binding (single-tenant deployments).

If no tenant is resolved, the request is rejected.

## TenantContext (minimal)
```ts
export type TenantContext = {
  tenantId: string;
  aiGatewayRoute: string;
  modelPolicy: {
    chat: string;
    embeddings: string;
  };
  vectorizeIndex: string;
  kvNamespace: string;
  doSessionName: string;
  rateLimit: {
    perMinute: number;
    burst: number;
  };
};
```

## Storage isolation rules
- **KV**
  - Prefix every key with `tenantId:` unless using per-tenant namespaces.
- **Vectorize**
  - Prefer per-tenant indexes.
  - If shared, enforce `filter: { tenantId }` on every query.
- **Durable Objects**
  - Object IDs include `tenantId`.
  - Requests to DOs must include `x-tenant-id`.

## AI isolation rules
- All model calls go through AI Gateway.
- Gateway routes and model allow-lists are tenant-scoped.
- Per-tenant budgets and rate limits enforced at the Worker boundary.

## Failure modes
- Missing `x-tenant-id` in multi-tenant mode.
- Cross-tenant storage access attempts.
- Invalid tenant configuration or missing bindings.

## Validation checks
- Unit test: tenant resolution.
- Integration test: cross-tenant request rejected.
- Vectorize: enforced tenant filters for shared indexes.

