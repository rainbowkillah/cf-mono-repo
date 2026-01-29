# Local Development (Wrangler)

## Prereqs
- Node.js 18+
- `wrangler` installed via `npm install`

## Run a tenant locally
```bash
npm run dev:mrrainbowsmoke
```

```bash
npm run dev:rainbowsmokeofficial
```

## Run the worker-api app directly
```bash
npm run dev:worker-api
```

## Notes
- Multi-tenant requests should include `x-tenant-id`.
- Tenant configs live under `tenants/<tenant-id>/tenant.config.json`.
