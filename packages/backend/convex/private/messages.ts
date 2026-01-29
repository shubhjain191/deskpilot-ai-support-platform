import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { internal, components } from "../_generated/api";
import { ConvexError } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";


export const create = action({
    args: {
        prompt: v.string(),
        threadId: v.string(),
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            })
        }
        const orgId = identity.orgId as string;

        if(!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            })
        }

        const conversation = await ctx.db.get(args.conversationId);

        // If no conversation exists for this thread, we return an error
        if(!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if(conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization Id",
            })
        }

        // We also check if the conversation is already resolved, in which case we don't allow new messages
        if(conversation.status === "resolved") {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Conversation is resolved"
            })
        }

        await saveMessage(ctx, components.agent, {
            threadId: conversation.threadId,
            agentName: identity.familyName,
            message: {
                role: "assistant",
                content: args.prompt,
            }
        });
    }
})

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            })
        }
        const orgId = identity.orgId as string;

        if(!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            })
        }

        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique();
        
        if(!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if(conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization Id",
            })
        }
        
        // We retrieve the paginated list of messages for the given thread from the agent
        const paginated = await supportAgent.listMessages(ctx, {
            threadId: args.threadId,
            paginationOpts: args.paginationOpts,
        })

        return paginated;
    }
})