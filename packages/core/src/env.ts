export type TenantId = "mrrainbowsmoke" | "rainbowsmokeofficial";

export interface Env {
  TENANT_ID?: TenantId;
  TENANT_HOSTNAME_MAP?: string;
  INGEST_TOKEN?: string;

  AI: Ai;
  CACHE: KVNamespace;
  VECTORS: VectorizeIndex;
  CHAT_SESSIONS: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;

  KV_TENANT_CONFIG?: KVNamespace;
}
