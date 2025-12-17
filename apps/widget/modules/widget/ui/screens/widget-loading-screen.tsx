"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { errorMessageAtom, loadingMessageAtom, screenAtom, organizationIdAtom, contactSessionIdAtomFamily } from "../../atoms/widget-atoms";
import { LoaderIcon } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";
import { useEffect, useEffectEvent, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";


type InitStep =  "org" | "session" | "settings" | "vapi" | "done";

// loading screen component
export const WidgetLoadingScreen = ({organizationId}: {organizationId: string | null}) =>{
    const [step, setStep] = useState<InitStep>("org")
    const [sessionValid, setSessionValid] = useState(false)

    const loadingMessage = useAtomValue(loadingMessageAtom)
    const setOrganizationId = useSetAtom(organizationIdAtom)
    const setErrorMessage = useSetAtom(errorMessageAtom)
    const setScreen = useSetAtom(screenAtom)
    const setLoadingMessage = useSetAtom(loadingMessageAtom)

    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))

    //validate organization
    const validateOrganization = useAction(api.public.organizations.validate)
    useEffect(() => {
        if(step !== "org"){
            return
        }

        setLoadingMessage("Finding organization ID...")      

        if(!organizationId){
            setErrorMessage("Organization Id is required")
            setScreen("error")
            return
        }

        setLoadingMessage("Verifying organization ID...")
        
        validateOrganization({ organizationID: organizationId })
        .then((result) => {
            if (result.valid){
                setOrganizationId(organizationId)
                setStep("session")
            } else{
                setErrorMessage(result.reason || "Invalid Organization ID")
                setScreen("error")
            }
        })
        .catch(() => {
            setErrorMessage("Failed to validate organization ID")
            setScreen("error")
        })
        
    }, [step, organizationId, setErrorMessage, setScreen, setOrganizationId, validateOrganization, setStep, setLoadingMessage])

    //validate session
    const validateContactSession = useMutation(api.public.contactSessions.validate)
    useEffect(() => {
       if(step !== "session"){
           return
       }

       setLoadingMessage("Finding contact session ID...")

       if(!contactSessionId){
           setSessionValid(false)
           setStep("done")
           return;
       }

       setLoadingMessage("Validating session...")

       validateContactSession({ contactSessionID: contactSessionId as Id<"contactSessions"> })
       .then((result) => {
           if (result.valid){
               setSessionValid(true)
               setStep("done")
           } else{
               setErrorMessage(result.reason || "Invalid Session ID")
               setScreen("error")
           }
       })
       .catch(() => {
           setSessionValid(false)
           setStep("done")
       })

    }, [step, contactSessionId, validateContactSession, setLoadingMessage])

    useEffect(() => {
        if (step !== "done"){
            return
        }

        const hasValidSession = contactSessionId && sessionValid
        setScreen(hasValidSession ? "selection" : "auth")
    }, [step, contactSessionId, sessionValid, setScreen])

    return (
        <div className="flex flex-1 flex-col h-full w-full">
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                   <p className=" text-3xl">Hi there! 👋</p>
                   <p className="text-lg">Let&apos;s get you started</p>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground gap-y-4 p-4">
                <LoaderIcon className="h-10 w-10 animate-spin" />
                <p className="text-center text-lg  font-semibold">{loadingMessage || "Loading..."}</p>
            </div>
        </div>
    )
}