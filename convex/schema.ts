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
    notes: v.optional(v.string()),
    barcode: v.optional(v.string()),
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
    actionType: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_contact", ["contactId"])
    .index("by_device", ["deviceId"]),
});
