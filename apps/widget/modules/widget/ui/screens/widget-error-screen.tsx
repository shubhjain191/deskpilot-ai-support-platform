"use client";

import { useAtomValue } from "jotai";
import { errorMessageAtom } from "../../atoms/widget-atoms";
import { AlertTriangleIcon } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";


// error screen component
export const WidgetErrorScreen = () =>{
    const errorMessage = useAtomValue(errorMessageAtom)
    return (
        <div className="flex flex-1 flex-col h-full w-full">
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                   <p className=" text-3xl">Hi there! 👋</p>
                   <p className="text-lg">Let&apos;s get you started</p>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-y-4 p-4">
                <AlertTriangleIcon className="h-10 w-10 text-destructive" />
                <p className="text-center text-lg  font-semibold">{errorMessage || "Invalid Configuration"}</p>
            </div>
        </div>
    )
}