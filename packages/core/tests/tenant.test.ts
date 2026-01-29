import { describe, it, expect } from "vitest";
import { resolveTenantId } from "../src/tenant";
import type { Env } from "../src/types";

describe("Tenant Resolution", () => {
  const mockEnv: Env = {
    TENANT_ID: "mrrainbowsmoke",
    AI: {} as Ai,
    CACHE: {} as KVNamespace,
    VECTORS: {} as VectorizeIndex,
    CHAT_SESSIONS: {} as DurableObjectNamespace,
  };

  it("should resolve tenant from x-tenant-id header", () => {
    const request = new Request("https://example.com/health", {
      headers: { "x-tenant-id": "rainbowsmokeofficial" },
    });

    const tenantId = resolveTenantId(request, mockEnv);
    expect(tenantId).toBe("rainbowsmokeofficial");
  });

  it("should resolve tenant from environment when header missing", () => {
    const request = new Request("https://example.com/health");

    const tenantId = resolveTenantId(request, mockEnv);
    expect(tenantId).toBe("mrrainbowsmoke");
  });

  it("should return null when tenant cannot be resolved", () => {
    const request = new Request("https://example.com/health");
    const envWithoutTenant: Env = {
      TENANT_ID: undefined as any,
      AI: {} as Ai,
      CACHE: {} as KVNamespace,
      VECTORS: {} as VectorizeIndex,
      CHAT_SESSIONS: {} as DurableObjectNamespace,
    };

    const tenantId = resolveTenantId(request, envWithoutTenant);
    expect(tenantId).toBeNull();
  });

  it("should prioritize header over environment", () => {
    const request = new Request("https://example.com/health", {
      headers: { "x-tenant-id": "rainbowsmokeofficial" },
    });

    const tenantId = resolveTenantId(request, mockEnv);
    expect(tenantId).toBe("rainbowsmokeofficial");
    expect(tenantId).not.toBe(mockEnv.TENANT_ID);
  });

  it("should handle whitespace in header value", () => {
    const request = new Request("https://example.com/health", {
      headers: { "x-tenant-id": "  mrrainbowsmoke  " },
    });

    const tenantId = resolveTenantId(request, mockEnv);
    expect(tenantId).toBe("mrrainbowsmoke");
  });

  it("should return null for empty header value", () => {
    const request = new Request("https://example.com/health", {
      headers: { "x-tenant-id": "" },
    });
    const envWithoutTenant: Env = {
      TENANT_ID: undefined as any,
      AI: {} as Ai,
      CACHE: {} as KVNamespace,
      VECTORS: {} as VectorizeIndex,
      CHAT_SESSIONS: {} as DurableObjectNamespace,
    };

    const tenantId = resolveTenantId(request, envWithoutTenant);
    expect(tenantId).toBeNull();
  });
});
