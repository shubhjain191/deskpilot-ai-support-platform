import { createClerkClient } from "@clerk/backend";
import { v } from "convex/values";
import { action } from "../_generated/server";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY || "",
})

// validate organization
export const validate = action({
    args: {
        organizationID: v.string(),
    },
    handler: async (_, args) => {
        try {
            await clerkClient.organizations.getOrganization({
                organizationId: args.organizationID,
            })
            return { valid: true };
        } catch {
            return { valid: false, reason: "Organization not found" };
        }
    }
})