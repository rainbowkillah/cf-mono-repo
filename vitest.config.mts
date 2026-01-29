import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@packages\/core\/(.*)$/,
        replacement: `${path.resolve(rootDir, "packages/core/src")}/$1`
      }
    ]
  },
  test: {
    environment: "node"
  }
});
