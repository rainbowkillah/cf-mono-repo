import { createRouter } from "@packages/core/router";
import { ChatSessionDurableObject } from "@packages/core/session-do";
import type { Env } from "@packages/core/types";

export { ChatSessionDurableObject };

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return createRouter().fetch(request, env, ctx);
  }
};
