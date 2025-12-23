"use client";

import type { JSX } from "react";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { useAtomValue } from "jotai";
import { screenAtom } from "../../atoms/widget-atoms";
import { WidgetErrorScreen } from "../screens/widget-error-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";
import { WidgetSelectionScreen } from "../screens/widget-selection-screen";
import { WidgetChatScreen } from "../screens/widget-chat-screen";

interface Props{
    organizationId: string | null;
}

export const WidgetView = ({ organizationId }: Props): JSX.Element => {
    const screen = useAtomValue(screenAtom)

    const screenComponent = {
        error: <WidgetErrorScreen />,
        loading: <WidgetLoadingScreen organizationId={organizationId} />,
        selection: <WidgetSelectionScreen />,
        voice: <p>Todo: Voice</p>,
        auth: <WidgetAuthScreen />,
        inbox: <p>Todo: Inbox</p>,
        chat: <WidgetChatScreen />,
        contact: <p>Todo: Contact</p>,
    }
    return (
        <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
            {screenComponent[screen]}
            {/* <WidgetFooter /> */}
        </main>
    );
};
