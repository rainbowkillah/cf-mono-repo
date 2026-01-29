# Wrangler Version & ESM Format Decisions

## 1. Wrangler Version

- **Version:** `^3.109.0` (as specified in `package.json`)
- **Rationale:** This version provides the necessary features for Cloudflare Workers AI, AI Gateway, Vectorize, KV, and Durable Objects, along with compatibility for local development using `wrangler dev`.
- **Maintenance:** The `wrangler` version will be updated periodically to leverage new features and bug fixes, ensuring compatibility with Cloudflare's evolving platform.

## 2. ESM Format Decision

- **Format:** ECMAScript Modules (ESM)
- **Rationale:** Cloudflare Workers primarily use the ESM format. This aligns with modern JavaScript development practices and offers benefits such as:
    - **Tree Shaking:** Improved bundle size by removing unused exports.
    - **Clearer Dependencies:** Explicit `import`/`export` statements.
    - **Future-Proofing:** Aligns with the direction of JavaScript.
- **Configuration:** TypeScript `tsconfig.base.json` is configured with `"module": "ESNext"` and `"moduleResolution": "Bundler"` to support ESM.
