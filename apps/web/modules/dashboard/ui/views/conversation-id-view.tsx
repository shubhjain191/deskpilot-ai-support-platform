"use client"

import { Id } from "@workspace/backend/_generated/dataModel"
import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react"
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "@workspace/ui/components/ai/conversation"
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message"
import { AIInput, AIInputButton, AIInputSubmit, AIInputTextarea, AIInputToolbar, AIInputTools } from "@workspace/ui/components/ai/input"
import { AIResponse } from "@workspace/ui/components/ai/response"
import { Form, FormField } from "@workspace/ui/components/form"
import { z } from "zod"
import { useForm, ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"

const formSchema = z.object({
    message: z.string().min(1, "Message is required"),
})

export const ConversationIdView = ({ conversationId }: { conversationId: Id<"conversations"> }) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    })

    const conversation = useQuery(api.private.conversations.getOne, { conversationId });
    const createMessage = useAction(api.private.messages.create);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!conversation) return;
        
        try {
            await createMessage({
                prompt: values.message,
                conversationId: conversationId,
                threadId: conversation.threadId
            })
            form.reset();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }

    const messages = useThreadMessages(
        api.private.messages.getMany,
        conversation?.threadId ? { threadId: conversation.threadId } : "skip",
        { initialNumItems: 10}
    );
    
    
    return (
        <div className="flex h-full flex-col bg-muted">
            <header className="flex items-center justify-between border-b bg-background p-2.5">
                <Button variant="ghost" size="sm">
                    <MoreHorizontalIcon />
                </Button>
            </header>
            <AIConversation className="max-h-[calc(100vh-180px)]">
                <AIConversationContent>
                    {toUIMessages(messages.results ?? [])?.map((message) => (
                        <AIMessage 
                        from={message.role === "user" ? "assistant" : "user"}
                        key={message.id}
                        >
                            <AIMessageContent>
                                <AIResponse>
                                    {(message as any).text}
                                </AIResponse>
                            </AIMessageContent>
                            {message.role === "user" && (
                                <DicebearAvatar
                                    seed={conversation?.contactSessionId ?? "user"}
                                    size={32}
                                />
                            )}
                        </AIMessage>
                    ))}
                </AIConversationContent>
            </AIConversation>
            <div className="p-2">
                <Form {...form}>
                    <AIInput onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            //disabled={conversation?.status === "resolved"}
                            name="message"
                            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "message"> }) => (
                                <AIInputTextarea
                                    disabled={
                                        conversation?.status === "resolved" ||
                                        form.formState.isSubmitting
                                    }     
                                    
                                    onChange={field.onChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            form.handleSubmit(onSubmit)()
                                        }
                                    }}  
                                    
                                    placeholder={
                                        conversation?.status === "resolved"
                                        ? "This conversation has been resolved"
                                        : "Type your response as an operator..."
                                    }
                                    value={field.value}
                                />
                            )}
                        />
                        <AIInputToolbar>
                            <AIInputTools>
                                <AIInputButton>
                                    <Wand2Icon />
                                    Enhance
                                </AIInputButton>
                            </AIInputTools>
                            <AIInputSubmit
                                disabled={
                                    conversation?.status === "resolved" ||
                                    !form.formState.isValid ||
                                    form.formState.isSubmitting
                                }
                                status="ready"
                                type="submit"
                            />
                        </AIInputToolbar>
                    </AIInput>
                </Form>
            </div>
        </div>

    )
}
