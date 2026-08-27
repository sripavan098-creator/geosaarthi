import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stores reproducible analysis metadata only. Raw imagery never enters this table;
 * files remain client-side in the bounded demo or are referenced by a storage key
 * in a future S3-backed adapter.
 */
export const analysisRuns = mysqlTable("analysisRuns", {
  id: int("id").autoincrement().primaryKey(),
  runId: varchar("runId", { length: 64 }).notNull().unique(),
  userId: int("userId"),
  mode: mysqlEnum("mode", ["single", "bi_temporal", "cross_modal"]).notNull(),
  task: varchar("task", { length: 64 }).notNull(),
  query: text("query").notNull(),
  status: mysqlEnum("status", ["success", "partial", "rejected", "low_confidence", "error"]).notNull(),
  overallConfidence: int("overallConfidence").notNull(),
  inputMetadataJson: text("inputMetadataJson").notNull(),
  validationJson: text("validationJson").notNull(),
  answer: text("answer").notNull(),
  evidenceJson: text("evidenceJson").notNull(),
  traceJson: text("traceJson").notNull(),
  provenanceJson: text("provenanceJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalysisRun = typeof analysisRuns.$inferSelect;
export type InsertAnalysisRun = typeof analysisRuns.$inferInsert;
