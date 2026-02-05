import { google } from "@ai-sdk/google";
import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api";
import { SUPPORT_AGENT_PROMPT } from "../constants";


export const supportAgent = new Agent(components.agent, {
  name: "support-agent",
  languageModel: google("gemini-2.5-flash-lite") as any,
  instructions: SUPPORT_AGENT_PROMPT,
});
