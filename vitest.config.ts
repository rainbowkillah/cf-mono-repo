import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
        wrangler: {
          configPath: "apps/worker-api/wrangler.toml"
        }
  },
});

