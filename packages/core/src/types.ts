export type TenantId = "mrrainbowsmoke" | "rainbowsmokeofficial";

export interface Env {
  TENANT_ID: TenantId;
  AI: Ai;
  CACHE: KVNamespace;
  VECTORS: VectorizeIndex;
  CHAT_SESSIONS: DurableObjectNamespace;
  INGEST_TOKEN?: string;
}

