import { defineConfig } from "prisma/config"
import "dotenv/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Use the raw value instead of env(): generate must work on build machines
  // that do not inject DATABASE_URL (e.g. Vercel preview installs). Commands
  // that need a URL still fail clearly when it is missing.
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
