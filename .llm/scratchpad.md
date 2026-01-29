# Pre-M1 Phase PR-Check & Preparation Plan

**Objective:** Solidify the M0 foundation and ensure the project is ready for M1 development, which focuses on the `/chat` endpoint and session management.

**Status Check & Refinement of M0:**
1.  **Implement a Basic Router:** The M0 implementation has a very basic "hello world" response. To properly support M1 and beyond, a foundational router is needed. I will create `packages/core/src/router.ts`.
2.  **Implement a `/health` Endpoint:** As per the project plan, a `/health` endpoint is required. I will add this to the new router. This will serve as a more robust "hello endpoint" and smoke test.
3.  **Integrate Router into `worker-api`:** I will update `apps/worker-api/src/index.ts` to use the new router, replacing the current direct response.
4.  **Create a Smoke Test:** I will create a `vitest` test to verify the `/health` endpoint works correctly, including tenant resolution. This will validate the full request lifecycle through the middleware and router.
5.  **Run Tests:** Execute the tests to confirm the M0 foundation is stable and ready for M1.

**Pre-M1 Preparation:**
1.  **Review M1 Requirements:** The key components for M1 are the `/chat` endpoint, Durable Object for sessions, and KV for caching. The router created in the status check will be the foundation for adding the `/chat` endpoint.
2.  **Verify Bindings:** Ensure the `wrangler.toml` for `worker-api` has the necessary (mock) bindings for `SESSION_DO` and `KV_TENANT_CONFIG`. This was done in M0, but I will double-check.

Once these steps are complete, the project will be in a solid state to begin implementing M1 features.