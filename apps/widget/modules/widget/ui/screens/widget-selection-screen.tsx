"use client";

import { MessageSquareTextIcon, ChevronRightIcon } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import {
  screenAtom,
  organizationIdAtom,
  contactSessionIdAtomFamily,
  errorMessageAtom,
  conversationIdAtom,
} from "../../atoms/widget-atoms";
import { api } from "@workspace/backend/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useState } from "react";

// selection screen component
export const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const organizationID = useAtomValue(organizationIdAtom);
  const contactSessionID = useAtomValue(
    contactSessionIdAtomFamily(organizationID || "")
  );

  const createConversation = useMutation(api.public.conversations.create);
  const [isPending, setIsPending] = useState(false);
  const handleNewConversation = async () => {
    if (!organizationID) {
      setScreen("error");
      setErrorMessage("Missing Organization ID");
      return;
    }

    if (!contactSessionID) {
      setScreen("auth");
      setErrorMessage("Missing Contact Session ID");
      return;
    }

    setIsPending(true);
    try {
      const conversationId = await createConversation({
        contactSessionId: contactSessionID as Id<"contactSessions">,
        organizationId: organizationID,
      });
      setConversationId(conversationId);
      setScreen("chat");
    } catch (error) {
      setScreen("auth");
      setErrorMessage("Failed to create conversation");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full w-full">
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className=" text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center overflow-y-auto gap-y-4 p-4">
        <Button
          className="h-16 w-full justify-between"
          variant="outline"
          onClick={handleNewConversation}
          disabled={isPending}
        >
          <div className="flex items-center gap-x-2">
            <MessageSquareTextIcon className="h-5 w-5" />
            <span>Start Chat</span>
          </div>
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
