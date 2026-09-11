import { sql } from "drizzle-orm"
import {
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core"

/**
 * MySQL schema.
 *
 * Two MySQL-specific rules shape the column types below:
 *   - anything indexed must be VARCHAR with a length; TEXT can't be indexed
 *     without a prefix length, so ids, emails and tokens are sized explicitly.
 *   - DATETIME rather than TIMESTAMP, which would hit the 2038 limit and
 *     silently convert time zones.
 */

/** stored in UTC by the application; DATETIME keeps MySQL from reinterpreting it */
const timestamps = {
  createdAt: datetime("created_at", { mode: "date", fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime("updated_at", { mode: "date", fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
}

/* ────────────────────────────────────────────────────────────────────────
 * Auth tables — shape required by Better Auth, plus profile columns.
 * ──────────────────────────────────────────────────────────────────────── */

export const user = mysqlTable(
  "user",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),

    // public @slug used across the site
    handle: varchar("handle", { length: 64 }),
    bio: text("bio"),
    website: varchar("website", { length: 255 }),
    location: varchar("location", { length: 120 }),
    githubUsername: varchar("github_username", { length: 120 }),
    twitterUsername: varchar("twitter_username", { length: 120 }),

    role: varchar("role", { length: 32 }).notNull().default("user"),
    banned: boolean("banned").notNull().default(false),
    banReason: text("ban_reason"),
    banExpires: datetime("ban_expires", { mode: "date", fsp: 3 }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("user_email_unique").on(table.email),
    uniqueIndex("user_handle_unique").on(table.handle),
  ]
)

export const session = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    token: varchar("token", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: datetime("expires_at", { mode: "date", fsp: 3 }).notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("session_token_unique").on(table.token),
    index("session_user_id_idx").on(table.userId),
  ]
)

export const account = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: datetime("access_token_expires_at", { mode: "date", fsp: 3 }),
    refreshTokenExpiresAt: datetime("refresh_token_expires_at", { mode: "date", fsp: 3 }),
    scope: text("scope"),

    /** only set for the credential provider; scrypt hash, never a raw password */
    password: text("password"),

    ...timestamps,
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_provider_unique").on(table.providerId, table.accountId),
  ]
)

export const verification = mysqlTable(
  "verification",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: datetime("expires_at", { mode: "date", fsp: 3 }).notNull(),
    ...timestamps,
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

/* ────────────────────────────────────────────────────────────────────────
 * Product tables
 * ──────────────────────────────────────────────────────────────────────── */

export const subscription = mysqlTable(
  "subscription",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    /** free | builder | builder_ai | team */
    plan: varchar("plan", { length: 32 }).notNull().default("free"),
    /** active | trialing | past_due | canceled */
    status: varchar("status", { length: 32 }).notNull().default("active"),

    seats: int("seats").notNull().default(1),

    currentPeriodEnd: datetime("current_period_end", { mode: "date", fsp: 3 }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),

    provider: varchar("provider", { length: 32 }),
    providerCustomerId: varchar("provider_customer_id", { length: 255 }),
    providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),

    ...timestamps,
  },
  (table) => [
    index("subscription_user_idx").on(table.userId),
    index("subscription_status_idx").on(table.status),
  ]
)

/** Components published by users, merged on top of the static catalogue. */
export const component = mysqlTable(
  "component",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    authorId: varchar("author_id", { length: 64 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),

    /** source as published — stored, never executed */
    code: text("code").notNull(),
    demoCode: text("demo_code").notNull(),
    fileName: varchar("file_name", { length: 160 }).notNull(),
    demoFileName: varchar("demo_file_name", { length: 160 }).notNull(),

    tags: json("tags").$type<string[]>().notNull(),
    dependencies: json("dependencies").$type<string[]>().notNull(),
    license: varchar("license", { length: 64 }).notNull().default("MIT License"),
    sourceUrl: varchar("source_url", { length: 500 }),

    /** draft | published | unlisted — only published rows are publicly readable */
    status: varchar("status", { length: 32 }).notNull().default("draft"),

    bookmarkCount: int("bookmark_count").notNull().default(0),
    viewCount: int("view_count").notNull().default(0),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("component_author_slug_unique").on(table.authorId, table.slug),
    index("component_status_idx").on(table.status),
    index("component_author_idx").on(table.authorId),
  ]
)

/** A user's named list. Every user gets a default "Saved" collection. */
export const collection = mysqlTable(
  "collection",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    isPublic: boolean("is_public").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("collection_user_slug_unique").on(table.userId, table.slug),
    index("collection_user_idx").on(table.userId),
  ]
)

/**
 * `componentId` is the registry id — it covers both the static catalogue and
 * user-published rows, so it is intentionally not a foreign key.
 */
export const collectionItem = mysqlTable(
  "collection_item",
  {
    collectionId: varchar("collection_id", { length: 64 })
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
    componentId: varchar("component_id", { length: 120 }).notNull(),
    addedAt: datetime("added_at", { mode: "date", fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.componentId] }),
    index("collection_item_component_idx").on(table.componentId),
  ]
)

/** Flat "is this saved at all" record, so the bookmark toggle is one query. */
export const bookmark = mysqlTable(
  "bookmark",
  {
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    componentId: varchar("component_id", { length: 120 }).notNull(),
    createdAt: datetime("created_at", { mode: "date", fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.componentId] }),
    index("bookmark_component_idx").on(table.componentId),
  ]
)

export type User = typeof user.$inferSelect
export type Subscription = typeof subscription.$inferSelect
export type Component = typeof component.$inferSelect
export type Collection = typeof collection.$inferSelect
