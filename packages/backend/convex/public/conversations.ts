import { mutation, query } from "../_generated/server";
import { ConvexError, v, Infer } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { saveMessage, vMessageDoc } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";


type MessageDoc = Infer<typeof vMessageDoc>;

// get many conversations for a contact session
export const getMany = query({
    args: {
        contactSessionId: v.id("contactSessions"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.db.get(args.contactSessionId)

        if(!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            })
        }

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_contact_session_id", (q) => 
                q.eq("contactSessionId", args.contactSessionId)
            )
            .order("desc")
            .paginate(args.paginationOpts)

        // looping through all conversations to find the last message for each one so we can show a preview
        const conversationsWithLastMessage = await Promise.all(
            conversations.page.map(async (conversation) => {
                let lastMessage: MessageDoc | null = null ;
                
                const message = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId,
                    paginationOpts: {numItems: 1, cursor: null}
                })

                if(message.page.length > 0){
                    lastMessage = message.page[0] ?? null;
                }

                return {
                    _id: conversation._id,
                    status: conversation.status,
                    threadId: conversation.threadId,
                    _creationTime: conversation._creationTime,
                    organizationId: conversation.organizationId,
                    lastMessage,
                }
            })
        )
        return {
            ...conversations,
            page: conversationsWithLastMessage,
        }
    }
})

// get a single conversation for a contact session
export const getOne = query({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId)

        if(!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            })
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if(conversation.contactSessionId !== session._id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Incorrect session"
            })
        }

        return {
            _id: conversation._id,
            status: conversation.status,
            threadId: conversation.threadId,
        }
    }
})

// create a new conversation for a contact session
export const create = mutation({
    args: {
        contactSessionId: v.id("contactSessions"),
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId)

        if(!session || session.expiresAt < Date.now()){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            })
        }

        const { threadId } = await supportAgent.createThread(ctx, {
            userId: args.organizationId,
        })

        await saveMessage(ctx, components.agent, {
            threadId,
            message: {
                role: "assistant",
                content: "Hello, how can I help you today?",
            },  
        })

        const conversationId = await ctx.db.insert("conversations", {
            contactSessionId: session._id,
            threadId,
            organizationId: args.organizationId,
            status: "unresolved"
        })

        return conversationId;
    }
})