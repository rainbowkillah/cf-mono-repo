import type { Env } from "./types";

export function resolveTenantId(request: Request, env: Env): string | null {
  const headerTenant = request.headers.get("x-tenant-id")?.trim();
  if (headerTenant) return headerTenant;
  if (env.TENANT_ID) return env.TENANT_ID;
  return null;
}