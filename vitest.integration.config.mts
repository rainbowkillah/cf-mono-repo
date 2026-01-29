import { defineConfig } from "vitest/config";
import workers from "@cloudflare/vitest-pool-workers";

export default defineConfig({
  resolve: {
    alias: {
      '@packages': './packages',
    },
  },
  test: {
    pool: workers(),
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "apps/worker-api/wrangler.toml"
        }
      }
    }
  }
});
