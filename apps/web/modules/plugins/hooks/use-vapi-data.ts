import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@workspace/backend/_generated/api";

type PhoneNumbers = typeof api.private.vapi.getPhoneNumbers._returnType;
type Assistants = typeof api.private.vapi.getAssistants._returnType;

interface UseVapiPhoneNumbersReturn {
    data: PhoneNumbers;
    isLoading: boolean;
    error: string | null;
}

interface UseVapiAssistants {
    data: Assistants;
    isLoading: boolean;
    error: string | null;
}

export const useVapiAssistants = (): UseVapiAssistants => {
    const [data, setData] = useState<Assistants>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAssistants = useAction(api.private.vapi.getAssistants);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const result = await getAssistants();
                setData(result);
                setError(null);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    toast.error("Failed to fetch assistants");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getAssistants]);

    return { data, isLoading, error };
};

export const useVapiPhoneNumbers = (): UseVapiPhoneNumbersReturn => {
    const [data, setData] = useState<PhoneNumbers>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getPhoneNumbers = useAction(api.private.vapi.getPhoneNumbers);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const result = await getPhoneNumbers();
                setData(result);
                setError(null);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    toast.error("Failed to fetch phone numbers");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getPhoneNumbers]);

    return { data, isLoading, error };
};