// packages/core/src/env.ts

interface Env {
  // Example KV binding for tenant configurations
  KV_TENANT_CONFIG: KVNamespace;

  // Optional: TENANT_ID for single-tenant deployments
  TENANT_ID?: string;

  // Optional: JSON string mapping hostnames to tenant IDs
  TENANT_HOSTNAME_MAP?: string;

  // Durable Objects for sessions
  SESSION_DO: DurableObjectNamespace;

  // Other bindings will be added here as needed
}

export default Env;
