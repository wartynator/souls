import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/* ---------- helpers ---------- */

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

async function ownedContact(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  id: Id<"contacts">,
) {
  const contact = await ctx.db.get(id);
  if (!contact || contact.userId !== userId) {
    throw new Error("Contact not found");
  }
  return contact;
}

/* ---------- queries ---------- */

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      contacts.map(async (c) => {
        const devices = await ctx.db
          .query("devices")
          .withIndex("by_contact", (q) => q.eq("contactId", c._id))
          .collect();
        return { ...c, deviceCount: devices.length };
      }),
    );
  },
});

export const get = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const contact = await ctx.db.get(args.id);
    if (!contact || contact.userId !== userId) return null;
    return contact;
  },
});

/* ---------- mutations ---------- */

export const create = mutation({
  args: {
    name: v.string(),
    surname: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Name is required");

    return ctx.db.insert("contacts", {
      userId,
      name,
      surname: args.surname?.trim() || undefined,
      address: args.address?.trim() || undefined,
      city: args.city?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      email: args.email?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contacts"),
    name: v.string(),
    surname: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedContact(ctx, userId, args.id);

    const name = args.name.trim();
    if (!name) throw new Error("Name is required");

    await ctx.db.patch(args.id, {
      name,
      surname: args.surname?.trim() || undefined,
      address: args.address?.trim() || undefined,
      city: args.city?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      email: args.email?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
    });
  },
});

export const bulkCreate = mutation({
  args: {
    contacts: v.array(
      v.object({
        name: v.string(),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await Promise.all(
      args.contacts.map((c) =>
        ctx.db.insert("contacts", {
          userId,
          name: c.name.trim(),
          phone: c.phone?.trim() || undefined,
          email: c.email?.trim() || undefined,
          notes: c.notes?.trim() || undefined,
        }),
      ),
    );
  },
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedContact(ctx, userId, args.id);

    // Cascade: delete linked devices and their actions
    const devices = await ctx.db
      .query("devices")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();
    await Promise.all(devices.map((d) => ctx.db.delete(d._id)));

    // Cascade: delete linked worklist entries
    const worklistEntries = await ctx.db
      .query("worklist")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();
    await Promise.all(worklistEntries.map((e) => ctx.db.delete(e._id)));

    await ctx.db.delete(args.id);
  },
});
