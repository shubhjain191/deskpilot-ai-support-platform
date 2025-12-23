"use client";


import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react"
import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import { api } from "@workspace/backend/_generated/api";
import { useAction, useQuery } from "convex/react";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools
} from "@workspace/ui/components/ai/input";
import {
    AIMessage,
    AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { 
    AISuggestion,
    AISuggestions
} from "@workspace/ui/components/ai/suggestion";
import { Form, FormField } from "@workspace/ui/components/form"

const formSchema = z.object({
    message: z.string().min(1, "Message is required"),
})

// chat screen component
export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

   const onBack = () => {
    setScreen("selection");
    setConversationId(null);
  };

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId: contactSessionId as Id<"contactSessions">,
        }
      : "skip"
  );

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId  
    ? {
      threadId: conversation.threadId,
      contactSessionId: contactSessionId as Id<"contactSessions">,
    }
    : "skip",
    { initialNumItems: 10}
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  const createMessage = useAction(api.public.messages.create)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if(!conversation || !contactSessionId){
      return;
    }

    form.reset();

    await createMessage({
      threadId: conversation.threadId,
      contactSessionId: contactSessionId as Id<"contactSessions">,
      prompt: values.message,
    })
  }

  return (
    <>
    <div className="flex flex-1 flex-col h-full w-full">
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button variant="transparent" size="icon" onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <p>Chat</p>
        </div>
        <Button size="icon" variant="transparent">
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <AIConversation>
        <AIConversationContent>
          {toUIMessages(messages.results ?? []).map((message) => {
            return (
              <AIMessage
              from={message.role === "user" ? "user" : "assistant"}
              key={message.id}
              >
              <AIMessageContent>
                <AIResponse>{message.text}</AIResponse>
              </AIMessageContent>
              </AIMessage>
            )
          })}
        </AIConversationContent>
      </AIConversation>
    </div>
    <Form {...form}>
      <AIInput
        className="rounded-none border-x-0 border-b-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "message"> }) => (
            <AIInputTextarea 
            disabled={conversation?.status === "resolved"}
            onChange={field.onChange}
            onKeyDown={(e) => {
              if(e.key === "Enter" && !e.shiftKey){
                e.preventDefault();
                form.handleSubmit(onSubmit)()
              }
            }}
            placeholder={
              conversation?.status === "resolved"
              ? "This conversation has been resolved"
              : "Type your message..."
            }
            value={field.value}
            />
          )}
        />
        <AIInputToolbar>
          <AIInputTools>
            <AIInputSubmit
              disabled={conversation?.status === "resolved" || !form.formState.isValid}
              status="ready"
              type="submit"
            />
          </AIInputTools>
        </AIInputToolbar>
      </AIInput>
    </Form>
    </>
  );
};
