import { google } from "@ai-sdk/google";
import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";
import { rag } from "../rag";
import { SEARCH_INTERPRETER_PROMPT } from "../constants";

// defining a new tool for our ai agent to use this one lets it search through the knowledge base we built
export const search = createTool({
    description: "Search the knowledge base for relevant information to help answer user questions",
    args: z.object({
        query: z.string().describe("The Search query to find relevant information"),
    }),
// making sure we know which conversation this is coming from so we can find the right organization to search in
    handler: async (ctx, args) => {
        if (!ctx.threadId) {
            return "Missing thread ID";
        }

        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId,
            { threadId: ctx.threadId }
        )

        if (!conversation) {
            return "Conversation not found";
        }

        const orgId = conversation.organizationId;

// doing the actual search here. asking our vector database to find the top 5 most relevant chunks of text
        const searchResult = await rag.search(ctx, {
            namespace: orgId,
            query: args.query,
            limit: 5,
        })

// combining the results into a single text block so the ai can understand what we found. also listing the titles of documents used
        const contextText = `Found results in ${searchResult.entries
            .map((entry) => entry.title || null)
            .filter((title) => title !== null)
            .join("\n")}. Here is the context:\n\n${searchResult.text}`;

// asking the ai to summarize the answer based on what we found. using a lightweight model for speed
        const response = await generateText({
            messages: [
                {
                    role: "system",
                    content: SEARCH_INTERPRETER_PROMPT
                },
                {
                    role: "user",
                    content: `User asked: ${args.query}\n\nSearch results: ${contextText}`
                }
            ],
            model: google("gemini-2.5-flash")
        })

// saving the ai's answer to the chat history so it shows up in the conversation
        await supportAgent.saveMessage(ctx, {
            threadId: ctx.threadId,
            message: {
                role: "assistant",
                content: response.text,
            }
        })

        return response.text;
    },
})