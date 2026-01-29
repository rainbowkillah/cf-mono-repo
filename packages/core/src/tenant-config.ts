import { z } from "zod";

export const tenantConfigSchema = z.object({
  tenantId: z.string().min(1),
  accountId: z.string().min(1).optional(),
  hostnames: z.array(z.string().min(1)).optional(),
  ai: z
    .object({
      gatewayRoute: z.string().min(1),
      models: z.object({
        chat: z.string().min(1),
        embeddings: z.string().min(1)
      })
    })
    .optional(),
  vectorize: z
    .object({
      index: z.string().min(1)
    })
    .optional(),
  kv: z
    .object({
      cacheNamespace: z.string().min(1).optional(),
      configNamespace: z.string().min(1).optional()
    })
    .optional(),
  durableObjects: z
    .object({
      chatSessions: z.string().min(1)
    })
    .optional(),
  cors: z
    .object({
      allowedOrigins: z.array(z.string().min(1)).default([])
    })
    .optional(),
  featureFlags: z.record(z.string(), z.boolean()).optional()
});

export type TenantConfig = z.infer<typeof tenantConfigSchema>;

export function parseTenantConfig(input: unknown): TenantConfig {
  return tenantConfigSchema.parse(input);
}
