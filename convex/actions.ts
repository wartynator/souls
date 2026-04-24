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
    return ctx.db
      .query("actions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    return ctx.db.insert("actions", {
      userId,
      name: args.name.trim(),
      price: args.price ?? undefined,
      notes: args.notes?.trim() || undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("actions"),
    name: v.string(),
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await ownedAction(ctx, userId, args.id);
    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      price: args.price ?? undefined,
      notes: args.notes?.trim() || undefined,
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
