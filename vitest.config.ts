import { defineConfig } from "vitest/config";
import workers from "@cloudflare/vitest-pool-workers";

export default defineConfig({
  test: {
    pool: workers(),
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "mrrainbowsmoke/wrangler.toml"
        }
      }
    }
  }
});

