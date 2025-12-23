import { groq } from "@ai-sdk/groq";
import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api";

export const supportAgent = new Agent(components.agent, {
  name: "support-agent",
  languageModel: groq("llama-3.3-70b-versatile") as any,
  instructions: "You are a customer support agent.",
});
