import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Souls — database schema
 *
 * Two main tables (contacts, devices) tied to a user via userId.
 * Row-level isolation is enforced in each query/mutation by filtering on
 * the authenticated user's id.
 *
 * The `authTables` spread adds the tables that Convex Auth needs internally
 * (users, authSessions, etc.) — don't touch them directly.
 */
export default defineSchema({
  ...authTables,

  contacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    // Fast per-user lookups, sorted by name via _creationTime index
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  devices: defineTable({
    userId: v.id("users"),
    contactId: v.id("contacts"),
    name: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_contact", ["contactId"])
    .index("by_user_and_contact", ["userId", "contactId"]),
});
