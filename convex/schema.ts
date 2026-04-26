import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  contacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    surname: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  devices: defineTable({
    userId: v.id("users"),
    contactId: v.id("contacts"),
    name: v.string(),
    manufacturer: v.optional(v.string()),
    type: v.optional(v.string()),
    year: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    barcode: v.optional(v.string()), // legacy — kept for existing records
  })
    .index("by_user", ["userId"])
    .index("by_contact", ["contactId"])
    .index("by_user_and_contact", ["userId", "contactId"]),

  actions: defineTable({
    userId: v.id("users"),
    name: v.string(),
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  deviceActions: defineTable({
    userId: v.id("users"),
    deviceId: v.id("devices"),
    actionId: v.id("actions"),
    date: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_device", ["deviceId"]),

  worklist: defineTable({
    userId: v.id("users"),
    contactId: v.id("contacts"),
    deviceId: v.id("devices"),
    date: v.string(), // ISO date "YYYY-MM-DD"
    actionId: v.id("actions"),
    notes: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("in_progress"), v.literal("done"))),
  })
    .index("by_user", ["userId"])
    .index("by_contact", ["contactId"])
    .index("by_device", ["deviceId"]),
});
