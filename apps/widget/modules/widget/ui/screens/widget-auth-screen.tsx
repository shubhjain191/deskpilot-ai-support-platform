import { WidgetHeader } from "../components/widget-header";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useAtomValue, useSetAtom } from "jotai";
import { organizationIdAtom, contactSessionIdAtomFamily } from "../../atoms/widget-atoms";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
})

const organizationId = "123"

export const WidgetAuthScreen = () => {
    const organizationId = useAtomValue(organizationIdAtom)
    const setContactSessionId = useSetAtom(contactSessionIdAtomFamily(organizationId || ""))


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    })

    const createContactSession = useMutation(api.public.contactSessions.create)

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!organizationId) {
            return
        }
        const metadata: Doc<"contactSessions">["metadata"] = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: [...navigator.languages],
            platform: navigator.platform,
            vendor: navigator.vendor,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timeZoneOffset: new Date().getTimezoneOffset(),
            cookieEnabled: navigator.cookieEnabled,
            referrer: document.referrer || "direct",
            currentUrl: window.location.href,
        };

        const contactSessionId = await createContactSession({
            ...values,
            organizationID: organizationId,
            metadata,
        })

        setContactSessionId(contactSessionId)
    }
    return (
        <div>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                   <p className=" text-3xl">Hi there! 👋</p>
                   <p className="text-lg">Let&apos;s get you started</p>
                </div>
            </WidgetHeader>
            <FormProvider {...form}>
                <form 
                    onSubmit={form.handleSubmit(onSubmit)} 
                    className="flex flex-1 flex-col gap-y-4 p-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input 
                                    className="h-10 bg-background"
                                    placeholder="e.g. John Doe" 
                                    type="text"
                                    {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. john.doe@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Continue</Button>
                </form>
            </FormProvider>
        </div>
    );
};
