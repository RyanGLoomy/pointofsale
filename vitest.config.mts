import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/cart.ts",
        "src/lib/format.ts",
        "src/lib/money.ts",
        "src/lib/product-visual.ts",
        "src/lib/receipt.ts",
        "src/lib/reports.ts",
        "src/lib/role-home.ts",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
})
