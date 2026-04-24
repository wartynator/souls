import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

async function ownedAction(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  id: Id<"actions">,
) {
  const action = await ctx.db.get(id);
  if (!action || action.userId !== userId) throw new Error("Action not found");
  return action;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const actions = await ctx.db
      .query("actions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Attach device name for display in the list
    return Promise.all(
      actions.map(async (a) => {
        const device = await ctx.db.get(a.deviceId);
        return { ...a, deviceName: device?.name ?? null };
      }),
    );
  },
});

export const listByDevice = query({
  args: { deviceId: v.id("devices") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return ctx.db
      .query("actions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .collect();
  },
});

export const create = mutation({
  args: {
    deviceId: v.id("devices"),
    name: v.string(),
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const device = await ctx.db.get(args.deviceId);
    if (!device || device.userId !== userId) throw new Error("Device not found");

    return ctx.db.insert("actions", {
      userId,
      deviceId: args.deviceId,
      name: args.name.trim(),
      price: args.price ?? undefined,
      notes: args.notes?.trim() || undefined,
      date: args.date,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("actions"),
    deviceId: v.id("devices"),
    name: v.string(),
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedAction(ctx, userId, args.id);

    await ctx.db.patch(args.id, {
      deviceId: args.deviceId,
      name: args.name.trim(),
      price: args.price ?? undefined,
      notes: args.notes?.trim() || undefined,
      date: args.date,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("actions") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedAction(ctx, userId, args.id);
    await ctx.db.delete(args.id);
  },
});
