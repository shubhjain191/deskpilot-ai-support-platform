import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";

export const upsert = mutation({
  args: {
    greetMessage: v.string(),
    defaultSuggestions: v.object({
      suggestions1: v.array(v.string()),
      suggestions2: v.array(v.string()),
      suggestions3: v.array(v.string()),
    }),
    vapiSettings: v.object({
      assistantId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    })
    
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "unauthorized",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "unauthorized",
        message: "Organization not found",
      });
    }

    const existingWidgetSettings = await ctx.db
    .query("widgetSettings")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
    .unique()

    if(existingWidgetSettings) {
      await ctx.db.patch(existingWidgetSettings._id, {
        greetMessage: args.greetMessage,
        defaultSuggestions: args.defaultSuggestions,
        vapiSettings: args.vapiSettings,
      })
    } else {
      await ctx.db.insert("widgetSettings", {
        greetMessage: args.greetMessage,
        defaultSuggestions: args.defaultSuggestions,
        vapiSettings: args.vapiSettings,
        organizationId: orgId,
      })
    }
  },
});

export const getOne = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "unauthorized",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "unauthorized",
        message: "Organization not found",
      });
    }

    const widgetSettings = await ctx.db
    .query("widgetSettings")
    .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
    .unique()

    return widgetSettings;
  },
});

