import type { Config } from "drizzle-kit"

/**
 * Used for generating SQL only. Migrations are applied by scripts/db-migrate.mjs
 * against the MySQL database in DATABASE_URL.
 */
export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "mysql://root@localhost:3306/nuxus",
  },
  strict: true,
  verbose: true,
} satisfies Config
