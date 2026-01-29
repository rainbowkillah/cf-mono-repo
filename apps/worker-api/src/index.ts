import Env from "@packages/core/env";
import { tenantResolutionMiddleware } from "@packages/core/tenant";
import { createRouter } from "@packages/core/router";
import { successResponse } from "@packages/core/responses";

const router = createRouter();

router.get("/health", async (request, env, ctx) => {
  const tenantContext = (request as any).tenantContext;
  return successResponse({
    ok: true,
    tenantId: tenantContext.config.tenantId,
  });
});

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return tenantResolutionMiddleware(request, env, ctx, async (req, env, context) => {
      return router.fetch(req, env, context);
    });
  },
};
