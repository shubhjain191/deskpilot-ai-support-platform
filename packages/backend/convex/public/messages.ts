import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";

export const create = action({
    args: {
        prompt: v.string(),
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        // First we need to check if the user has a valid session
        const contactSession = await ctx.runQuery(
            internal.system.contactSessions.getOne,
            {
                contactSessionId: args.contactSessionId,
            }
        )

        // If the session is invalid or expired, we block the request
        if(!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            })
        }

        // Next, we find the conversation associated with this thread
        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId,
            {
                threadId: args.threadId,
            }
        )

        // If no conversation exists for this thread, we return an error
        if(!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        // We also check if the conversation is already resolved, in which case we don't allow new messages
        if(conversation.status === "resolved") {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Conversation is resolved"
            })
        }

        // Finally, we send the user's prompt to the AI agent to generate a response
        await supportAgent.generateText(
            ctx,
            { threadId: args.threadId },
            { prompt: args.prompt } as any
        )   
    }
})

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        // We verify the contact session to ensure the user is authorized to view messages
        const contactSession = await ctx.db.get(args.contactSessionId)

        if(!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
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