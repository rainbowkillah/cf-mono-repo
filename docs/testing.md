# Testing Plan

This document outlines the testing strategy for the Cloudflare Workers AI multi-tenant platform. Our goal is to ensure correctness, reliability, security, and performance through a multi-layered testing approach.

## 1. Testing Pyramid

We will follow the principles of the testing pyramid, with a strong foundation of unit tests, a solid layer of integration tests, and a smaller, focused set of end-to-end (E2E) tests.

- **Unit Tests (Fast & Cheap):** The majority of our tests. Isolate and verify small pieces of logic in our workers and packages.
- **Integration Tests (Medium Speed & Cost):** Test the interactions between different components, including Cloudflare services like KV, Durable Objects, and Vectorize.
- **E2E Tests (Slow & Expensive):** A small suite of tests to verify complete user flows from the API endpoint to the AI models and back.

## 2. Testing Matrix

| Testing Level | Scope | Tools | Location | Ownership | Gating |
| --- | --- | --- | --- | --- | --- |
| **Unit** | Individual functions, classes, and modules within a package or worker. Tenant resolution middleware, RAG chunking logic, schema validation. | Vitest, Miniflare (for local simulation) | `packages/*/src/**/*.test.ts`, `apps/*/src/**/*.test.ts` | Developer | Pre-commit hook, CI |
| **Integration**| Interaction between components. API worker <> KV/DO. Ingestion worker <> Vectorize. | Vitest, Miniflare, Staging Cloudflare Resources | `tests/integration/**/*.test.ts` | Developer | CI |
| **Contract** | API schema validation. Streaming response protocol. Tooling/function calling schema. | Vitest with schema validators (e.g., Zod) | `tests/contract/**/*.test.ts` | Developer | CI |
| **E2E** | Full user flows. `/chat` endpoint with streaming. `/search` endpoint with RAG. | Vitest with a custom test harness or a dedicated E2E framework | `tests/e2e/**/*.test.ts` | QA / Developer | Nightly build, Pre-production deploy |
| **Performance**| Load and stress testing. Latency benchmarks for critical endpoints. | Custom load testing scripts (e.g., k6, Grafana Faro) | `tests/performance/` | QA / SRE | Manual, Pre-production |
| **Security** | Tenant isolation, authentication/authorization, input validation, dependency scanning. | Custom tests, SAST/DAST tools, dependency scanners (e.g., Snyk) | `tests/security/**/*.test.ts` | Security Team / Developer | CI, Nightly build |

## 3. Key Testing Scenarios

### 3.1. Tenant Isolation (CRITICAL)

- **Goal:** Prove that no data can leak between tenants.
- **Scenarios:**
    - Test that a request with Tenant A's credentials cannot access Tenant B's KV, DO, or Vectorize data.
    - Test that a request with no tenant ID is rejected with a 4xx error.
    - Test that all storage operations (read, write, delete) are scoped to the correct tenant.

### 3.2. Streaming Behavior

- **Goal:** Ensure the `/chat` endpoint provides a reliable and correct streaming experience.
- **Scenarios:**
    - Test that the stream terminates correctly.
    - Test that the stream chunks are in the correct format.
    - Test error handling during a stream.

### 3.3. RAG and Retrieval Quality

- **Goal:** Verify that the RAG pipeline retrieves relevant documents and generates accurate responses.
- **Scenarios:**
    - Use a fixed set of documents and queries to assert that the correct chunks are retrieved.
    - Test that citations are correctly formatted.
    - Test for graceful failure when no relevant documents are found.

### 3.4. Tooling / Function Calling

- **Goal:** Ensure the tool dispatcher is secure and reliable.
- **Scenarios:**
    - Test that only registered tools can be executed.
    - Test that tool execution is correctly logged.
    - Test for input validation and permission checks.

## 4. CI/CD Gating

The following gates will be enforced in the CI/CD pipeline:

1.  **Lint & Format:** All code must pass linting and formatting checks.
2.  **Type Check:** The TypeScript compiler must pass without errors.
3.  **Unit Tests:** All unit tests must pass.
4.  **Integration Tests:** All integration tests must pass.
5.  **Security Scan:** Automated security scans must pass.

E2E and performance tests will run in a dedicated pre-production environment and will gate deployments to production.
