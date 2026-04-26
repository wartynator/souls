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

async function assertContactOwnership(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  contactId: Id<"contacts">,
) {
  const contact = await ctx.db.get(contactId);
  if (!contact || contact.userId !== userId) {
    throw new Error("Contact not found");
  }
}

async function ownedDevice(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  id: Id<"devices">,
) {
  const device = await ctx.db.get(id);
  if (!device || device.userId !== userId) {
    throw new Error("Device not found");
  }
  return device;
}

/* ---------- queries ---------- */

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const devices = await ctx.db
      .query("devices")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Attach owner full name for display
    return Promise.all(
      devices.map(async (d) => {
        const owner = await ctx.db.get(d.contactId);
        const ownerName = owner
          ? [owner.name, owner.surname].filter(Boolean).join(" ")
          : null;
        return { ...d, ownerName };
      }),
    );
  },
});

export const listByContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify the contact belongs to the user before returning its devices
    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.userId !== userId) return [];

    return ctx.db
      .query("devices")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("devices") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const device = await ctx.db.get(args.id);
    if (!device || device.userId !== userId) return null;
    return device;
  },
});

/* ---------- mutations ---------- */

export const create = mutation({
  args: {
    contactId: v.id("contacts"),
    name: v.string(),
    manufacturer: v.optional(v.string()),
    type: v.optional(v.string()),
    year: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await assertContactOwnership(ctx, userId, args.contactId);

    const name = args.name.trim();
    if (!name) throw new Error("Device name is required");

    return ctx.db.insert("devices", {
      userId,
      contactId: args.contactId,
      name,
      manufacturer: args.manufacturer?.trim() || undefined,
      type: args.type?.trim() || undefined,
      year: args.year?.trim() || undefined,
      serialNumber: args.serialNumber?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("devices"),
    contactId: v.id("contacts"),
    name: v.string(),
    manufacturer: v.optional(v.string()),
    type: v.optional(v.string()),
    year: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedDevice(ctx, userId, args.id);
    await assertContactOwnership(ctx, userId, args.contactId); // also guards new owner

    const name = args.name.trim();
    if (!name) throw new Error("Device name is required");

    await ctx.db.patch(args.id, {
      contactId: args.contactId,
      name,
      manufacturer: args.manufacturer?.trim() || undefined,
      type: args.type?.trim() || undefined,
      year: args.year?.trim() || undefined,
      serialNumber: args.serialNumber?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("devices") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedDevice(ctx, userId, args.id);

    // Cascade: delete linked worklist entries
    const worklistEntries = await ctx.db
      .query("worklist")
      .withIndex("by_device", (q) => q.eq("deviceId", args.id))
      .collect();
    await Promise.all(worklistEntries.map((e) => ctx.db.delete(e._id)));

    await ctx.db.delete(args.id);
  },
});
