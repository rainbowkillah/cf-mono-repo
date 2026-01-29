import Env from "@packages/core/env";
import { tenantResolutionMiddleware } from "@packages/core/tenant";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return tenantResolutionMiddleware(request, env, ctx, async (req, env, context) => {
      const tenantContext = (req as any).tenantContext;
      if (!tenantContext) {
        return new Response("Tenant context not available after middleware", { status: 500 });
      }
      // Basic response for now, router will be integrated later
      return new Response(`Hello from tenant ${tenantContext.config.tenantId}!`, { status: 200 });
    });
  },
};

