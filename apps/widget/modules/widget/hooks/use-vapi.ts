import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TranscriptMessage {
    role: "user" | "assistant";
    text: string;
};

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

    useEffect(() => {
        //only for testing the Vapi API otherwise customers will provide their own API keys
        const vapiInstance = new Vapi("32f01cf4-a432-4e8a-89af-601f3cc27bc5");
        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript([]);
        })

        vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
        })

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        })

        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        })

        vapiInstance.on("error", (error) => {
            console.log(error, "VAPI_ERROR");
            setIsConnecting(false);
        })

        vapiInstance.on("message", (message) => {
            if (message.type === "transcript" && message.transcriptType === "final")
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role === "user" ? "user" : "assistant",
                        text: message.text,
                    }
                ])
        })

         return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
        setIsConnecting(true);

        if(vapi) {
            //only for testing the Vapi API otherwise customers will provide their own Assitance Id
            vapi.start("b3a517fe-7798-445a-8fb6-9a6324879537");
        }
    }

    const endCall = () => {
        if(vapi) {
            vapi.stop();
        }
    }

    return {
        isSpeaking,
        isConnected,
        isConnecting,
        transcript,
        startCall,
        endCall,
    }
}

