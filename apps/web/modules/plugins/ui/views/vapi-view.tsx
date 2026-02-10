"use client"

import { 
    GlobeIcon,
    PhoneCallIcon,
    PhoneIcon,
    WorkflowIcon
 } from "lucide-react";
import { type Features, PluginCard } from "../components/plugin-card";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@workspace/ui/components/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"
import { useMutation } from "convex/react";
import { VapiConnectedView } from "../components/vapi-connected-view";

const vapiFeatures: Features[] = [
    {
        title: "AI-powered Web voice calls",
        description: "Voice chat directly in your app",
        icon: GlobeIcon
    },
    {
        title: "Phone Numbers",
        description: "Get dedicated business lines",
        icon: PhoneCallIcon
    },
    {
        title: "Outbound Calls",
        description: "Automated Customer outreach",
        icon: PhoneIcon
    },
    {
        title: "Workflows",
        description: "Custom conversation flows",
        icon: WorkflowIcon
    },
]

const formSchema = z.object({
    publicApiKey: z.string().min(1, "Public API Key is required"),
    privateApiKey: z.string().min(1, "Private API Key is required"),
})

const VapiPluginForm = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const upsertSecret = useMutation(api.private.secrets.upsert);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            publicApiKey: "",
            privateApiKey: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await upsertSecret({
                service: "vapi",
                value: {
                    publicApiKey: values.publicApiKey,
                    privateApiKey: values.privateApiKey,
                },
            });
            toast.success("Vapi plugin connected successfully");
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to connect Vapi plugin");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enable Vapi</DialogTitle>
                    <DialogDescription>
                        Your API Keys are safely encrypted and stored using AWS Secrets Manager
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                        <FormField
                            control={form.control}
                            name="publicApiKey"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Public API Key</FormLabel>
                                    <FormControl>
                                        <Input 
                                        {...field}
                                        placeholder="Public API Key"
                                        type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="privateApiKey"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Private API Key</FormLabel>
                                    <FormControl>
                                        <Input 
                                        {...field}
                                        placeholder="Private API Key"
                                        type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button 
                            disabled={form.formState.isSubmitting}
                            type="submit">
                                {form.formState.isSubmitting ? "Connecting..." : "Connect"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

const VapiPluginRemoveForm = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const removePlugin = useMutation(api.private.plugins.remove);

    const onSubmit = async () => {
        try {
            await removePlugin({
                service: "vapi",
            });
            toast.success("Vapi plugin removed successfully");
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove Vapi plugin");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Disconnect Vapi</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Are you sure you want to disconnect Vapi Plugin?
                </DialogDescription>
                <DialogFooter>
                    <Button onClick={onSubmit} variant="destructive">
                        Disconnect
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export const VapiView = () => {

    const vapiPlugin = useQuery(api.private.plugins.getOne, {
        service: "vapi",
    });

    const [connectOpen, setConnectOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);

    const toggleConnection = () => {
        if(vapiPlugin){
            setRemoveOpen(true);
        }else{
            setConnectOpen(true);
        }
    }

    return (
        <>
        <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
        <VapiPluginRemoveForm open={removeOpen} setOpen={setRemoveOpen} />
        <div className="flex min-h-screen flex-col bg-muted p-8">
            <div className="mx-auto w-full max-w-screen-md">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl">Vapi Plugin</h1>
                    <p className="text-muted-foreground">Connect your Vapi account to Deskpilot to enable AI-powered voice calls and phone support.</p>
                </div>
                <div className="mt-8">
                    {vapiPlugin ? (
                        <VapiConnectedView onDisconnect={toggleConnection} />
                    ) : (
                        <PluginCard 
                            serviceName="Vapi"
                            serviceImage="/vapi.jpg"
                            features={vapiFeatures}
                            isDisabled={vapiPlugin === undefined}
                            onSubmit={toggleConnection}
                    />
                    )}
                </div>
            </div>
        </div>
        </>
    );
}