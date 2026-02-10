" use client "

import { BotIcon, PhoneIcon, SettingsIcon, UnplugIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs"
import { VapiPhoneNumbersTab } from "./vapi-phone-numbers-tab"
import { VapiAssistantsTab } from "./vap-assistants-tab"

interface VapiConnectedViewProps {
    onDisconnect: () => void;
}

export const VapiConnectedView = ({ onDisconnect }: VapiConnectedViewProps) => {
    const [activeTab, setActiveTab] = useState("phone-numbers")

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Image 
                            src="/vapi.jpg"
                            alt="Vapi"
                            width={48}
                            height={48}
                            className="rounded-lg object-contain"
                            />
                            <div>
                                <CardTitle>Vapi Integration</CardTitle>
                                <CardDescription>
                                    Manage your phone numbers and AI assistants
                                </CardDescription>
                            </div>
                        </div>
                        <Button onClick={onDisconnect} size="sm" variant="destructive">
                            <UnplugIcon className="mr-2 h-4 w-4" />
                            Disconnect
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex size-12 items-center justify-center rounded-lg border bg-muted">
                                <SettingsIcon className="size-6 text-muted-foreground"/>
                            </div>
                            <div>
                                <CardTitle>Widget Configurations</CardTitle>
                                <CardDescription>
                                    Configure your widget
                                </CardDescription>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/customization">
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                Configure
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>
            <div className="overflow-hidden rounded-lg border bg-background">
                <Tabs
                    className="gap-0"
                    defaultValue="phone-numbers"
                    onValueChange={setActiveTab}
                    value={activeTab}
                >
                    <TabsList className="grid h-12 w-full grid-cols-2 p-0">
                        <TabsTrigger value="phone-numbers" className="h-full rounded-none">
                            <PhoneIcon className="mr-2 h-4 w-4" />
                            Phone Numbers
                        </TabsTrigger>
                        <TabsTrigger value="assistants" className="h-full rounded-none">
                            <BotIcon className="mr-2 h-4 w-4" />
                            AI Assistants
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="phone-numbers">
                        <VapiPhoneNumbersTab />
                    </TabsContent>
                    <TabsContent value="assistants">
                        <VapiAssistantsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}