import { describe, it, expect } from "vitest";
import { parseTenantConfig } from "../src/tenant-config";

describe("Tenant Config Schema", () => {
  it("accepts a minimal valid config", () => {
    const config = parseTenantConfig({
      tenantId: "mrrainbowsmoke",
      ai: {
        gatewayRoute: "mrrainbowsmoke",
        models: {
          chat: "@cf/meta/llama-3.1-8b-instruct",
          embeddings: "@cf/baai/bge-base-en-v1.5"
        }
      }
    });

    expect(config.tenantId).toBe("mrrainbowsmoke");
    expect(config.ai?.models.chat).toBe("@cf/meta/llama-3.1-8b-instruct");
  });

  it("rejects configs missing tenantId", () => {
    expect(() => parseTenantConfig({})).toThrow();
  });
});
