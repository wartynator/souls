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

async function ownedEntry(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  id: Id<"worklist">,
) {
  const entry = await ctx.db.get(id);
  if (!entry || entry.userId !== userId) throw new Error("Entry not found");
  return entry;
}

/* ---------- queries ---------- */

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const entries = await ctx.db
      .query("worklist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      entries.map(async (e) => {
        const contact = await ctx.db.get(e.contactId);
        const device = await ctx.db.get(e.deviceId);
        const action = await ctx.db.get(e.actionId);
        const contactName = contact
          ? [contact.name, contact.surname].filter(Boolean).join(" ")
          : null;
        return {
          ...e,
          contactName,
          deviceName: device?.name ?? null,
          actionName: action?.name ?? null,
        };
      }),
    );
  },
});

/* ---------- mutations ---------- */

export const create = mutation({
  args: {
    contactId: v.id("contacts"),
    deviceId: v.id("devices"),
    actionId: v.id("actions"),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.userId !== userId) throw new Error("Contact not found");
    const device = await ctx.db.get(args.deviceId);
    if (!device || device.userId !== userId) throw new Error("Device not found");
    const action = await ctx.db.get(args.actionId);
    if (!action || action.userId !== userId) throw new Error("Action not found");

    return ctx.db.insert("worklist", {
      userId,
      contactId: args.contactId,
      deviceId: args.deviceId,
      actionId: args.actionId,
      date: args.date,
      notes: args.notes?.trim() || undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("worklist"),
    contactId: v.id("contacts"),
    deviceId: v.id("devices"),
    actionId: v.id("actions"),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedEntry(ctx, userId, args.id);

    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.userId !== userId) throw new Error("Contact not found");
    const device = await ctx.db.get(args.deviceId);
    if (!device || device.userId !== userId) throw new Error("Device not found");
    const action = await ctx.db.get(args.actionId);
    if (!action || action.userId !== userId) throw new Error("Action not found");

    await ctx.db.patch(args.id, {
      contactId: args.contactId,
      deviceId: args.deviceId,
      actionId: args.actionId,
      date: args.date,
      notes: args.notes?.trim() || undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("worklist") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedEntry(ctx, userId, args.id);
    await ctx.db.delete(args.id);
  },
});
