import { google } from "@ai-sdk/google";
import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api";


export const supportAgent = new Agent(components.agent, {
  name: "support-agent",
  languageModel: google("gemini-2.5-flash-lite") as any,
  instructions: `You are a customer support agent. Use "resolveConversation" tool when user expresses finalization of the conversation. Use "escalateConversation" tool when user expresses frustration or dissatisfaction or request a human explicitly.`,
});
