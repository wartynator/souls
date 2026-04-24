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

export const listByDevice = query({
  args: { deviceId: v.id("devices") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const rows = await ctx.db
      .query("deviceActions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .collect();

    return Promise.all(
      rows.map(async (r) => {
        const action = await ctx.db.get(r.actionId);
        return {
          ...r,
          actionName: action?.name ?? null,
          actionPrice: action?.price ?? null,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    deviceId: v.id("devices"),
    actionId: v.id("actions"),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const device = await ctx.db.get(args.deviceId);
    if (!device || device.userId !== userId) throw new Error("Device not found");
    const action = await ctx.db.get(args.actionId);
    if (!action || action.userId !== userId) throw new Error("Action not found");

    return ctx.db.insert("deviceActions", {
      userId,
      deviceId: args.deviceId,
      actionId: args.actionId,
      date: args.date,
      notes: args.notes?.trim() || undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("deviceActions") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
