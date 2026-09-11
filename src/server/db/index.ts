import "server-only"
import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"
import { env } from "@/server/env"

/**
 * One MySQL pool per process.
 *
 * On Hostinger the app and the database sit on the same host, so this connects
 * over localhost and MySQL is never exposed to the internet. DATABASE_URL is
 * required everywhere except during `next build`, which issues no queries.
 */
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build"

function createPool() {
  if (!env.DATABASE_URL) {
    if (isBuildPhase) {
      // the build never runs a query; give the adapter a pool it can hold
      return mysql.createPool({ host: "127.0.0.1", user: "build", database: "build" })
    }
    throw new Error(
      "DATABASE_URL is required.\n" +
        "Expected: mysql://user:password@localhost:3306/database"
    )
  }

  return mysql.createPool({
    uri: env.DATABASE_URL,
    connectionLimit: env.isProduction ? 10 : 3,
    connectTimeout: 10_000,
    // times come back as strings otherwise, which breaks Date comparisons
    timezone: "Z",
    supportBigNumbers: true,
    bigNumberStrings: false,
  })
}

declare global {
  var __nuxusPool: mysql.Pool | undefined
}

const pool = globalThis.__nuxusPool ?? createPool()
if (!env.isProduction) globalThis.__nuxusPool = pool

export const db = drizzle(pool, { schema, mode: "default" })

export { schema }
export type Db = typeof db
